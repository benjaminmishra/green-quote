---
name: security-review
description: Perform a focused security review of the green-quote project — authentication, authorization, session handling, input validation, secrets, logging hygiene, dependencies, and Next.js-specific risks — and produce a prioritized findings report with concrete remediations.
---

# Security Review — green-quote

Perform a focused **defensive** security review of green-quote. The goal is to surface real, exploitable issues a maintainer can act on, ordered by severity. Pair every finding with a concrete remediation. Do **not** produce exploit code, payloads, or attack tooling.

## Scope

- **Included:** `src/`, `tests/`, `prisma/`, `Dockerfile`, `docker-compose.yml`, `next.config.mjs`, `.env.example`, `.gitignore`, `package.json`.
- **Excluded:** `node_modules/`, `.next/`, generated Prisma client.
- If `$ARGUMENTS` is provided (e.g. `auth`, `quotes`, `jwt`), scope to that area only.

Before reviewing, read:

- `ARCHITECTURE.md` and the **Production Readiness** section of `README.md` — they document accepted trade-offs (no JWT revocation, custom auth instead of IdP, no rate limiting). Do **not** re-raise these as findings; reference them and check whether the implementation matches the documented trade-off.
- `prisma/schema.prisma` (data model and indexes).
- `src/middleware.ts`, `src/instrumentation.ts`, `src/lib/auth.ts`, `src/shared/rbac.ts`, `src/shared/cookieOptions.ts`, `src/shared/logger.ts`.
- The full `src/modules/auth/**` slice.

---

## Threat Model Summary (project-specific)

- Custom email/password auth with bcrypt (cost 10) + HS256 JWT.
- JWT delivered via `httpOnly`, `sameSite: "strict"`, `secure` (prod) cookie named `token`.
- `middleware.ts` validates tokens for `/quotes`, `/admin`, `/api/quotes/:path*` and **injects** an `x-auth-context` header into the request after deleting any incoming one.
- Downstream handlers trust `x-auth-context` via `getAuthContextFromRequest`.
- Pricing math uses `decimal.js` to avoid float drift.
- Logger uses `pino` with redaction of `email`, `password`, `address`, and `*.email`/`*.password`/`*.address`.

Critical invariants:

1. `x-auth-context` must **never** be reachable from a client request — only set by middleware. Middleware must run on every route that reads it.
2. JWT verification must enforce signature, expiry, and required claims; HS256 secret must be strong.
3. Auth cookies must be `httpOnly` + `sameSite=strict` + `secure` in production.
4. Password hashes must never leave the repository layer in responses.
5. Sensitive PII (email, address, password) must be redacted from logs.

---

## Review Checklist

Work through every item. Cite `path:line`.

### A. Authentication

- [ ] `JWT_SECRET` validation in `instrumentation.ts`: not just non-empty — enforce **min length** (≥32 chars) and **reject known-weak values** like `change-me`, `secret`, `dev-secret-*` in production (`NODE_ENV === "production"`).
- [ ] `.env.example` and `docker-compose.yml` do not embed real-looking secrets. Confirm `.env` is gitignored and was never committed (`git log -- .env`).
- [ ] JWT issuance (`SignJWT(...).sign`) sets `alg`, `exp`, `iat`. Check whether `iss`/`aud`/`sub` are set and enforced on `verifyToken` — note as a hardening recommendation if absent (currently documented).
- [ ] `verifyToken` uses `jose.jwtVerify` (which enforces signature + expiry) and validates payload with Zod. Confirm no path returns auth context on verification failure.
- [ ] Bcrypt cost factor is ≥10. Note if production should use ≥12.
- [ ] Login response does **not** include `passwordHash` or other sensitive fields.
- [ ] Registration does not enable account enumeration via differential error messages or timing. (Current behavior returns 409 "Email already used" — flag as **account enumeration** with recommendation to return a generic 200 + email verification flow.)
- [ ] Password policy (min length, complexity). Current schema: `min(6)` — flag as weak.

### B. Session & Cookie Handling

- [ ] `AUTH_COOKIE_OPTIONS` has `httpOnly: true`, `sameSite: "strict"`, `secure` conditional on production, `path: "/"`.
- [ ] Logout sets the cookie to `""` with `maxAge: 0` (server-side invalidation impossible without revocation list — already documented).
- [ ] No `Authorization` Bearer parsing path bypasses cookie security. (`middleware.ts` accepts Bearer if present — note this means a stolen JWT used as Bearer works the same as the cookie. Acceptable for API consumers but document.)
- [ ] Token lifetime is set (`1d`) and matches the documented trade-off.

### C. Authorization (RBAC)

- [ ] Every protected route is in the `middleware.ts` matcher (`/quotes`, `/admin`, `/api/quotes/:path*`). Cross-check with `src/app/**/route.ts` — flag any route under `/api` that handles sensitive data but is **not** matched.
- [ ] Handlers call `getAuthContextFromRequest` and short-circuit with `unauthorized()` if null.
- [ ] Permission checks use `hasPermission` / `canReadQuote`, not bare role string comparisons.
- [ ] Admin-only pages (`/admin/quotes`) double-check role on the server (`getAuthOrRedirect` + `hasPermission("admin:quotes:read")`).
- [ ] No IDOR: `getQuoteHandler` enforces `canReadQuote(auth, quote.userId)` before returning a quote.

### D. The `x-auth-context` Trust Boundary (project-specific, HIGH PRIORITY)

- [ ] `middleware.ts` calls `requestHeaders.delete("x-auth-context")` **before** setting its own — confirm and flag if removed.
- [ ] Verify the middleware matcher covers **every** route that calls `getAuthContextFromRequest`. Grep:
  ```
  grep -rn "getAuthContextFromRequest" src/
  ```
  Every result must live under a path covered by the matcher in `middleware.ts:export const config`. Any handler that reads `x-auth-context` but sits outside the matcher is a **critical privilege-escalation bug**.
- [ ] `getAuthContextFromRequest` parses with Zod and returns `null` on failure — confirm no `as` cast or `JSON.parse` without try/catch.

### E. Input Validation & Injection

- [ ] All request bodies validated with Zod schemas from `src/shared/schemas.ts`.
- [ ] Path/query params validated (limit/cursor in `listQuotesHandler` — verify integer/positive checks).
- [ ] Prisma is used for all DB access (no raw SQL or `$queryRawUnsafe`); confirm via grep.
- [ ] No `dangerouslySetInnerHTML` in `src/modules/**/ui/**`.
- [ ] OpenAPI/Swagger UI page (`src/app/api-docs/page.tsx`) is intentionally unauthenticated — recommend gating in production builds or moving behind admin auth.
- [ ] `redirect()` targets are static strings, never user-supplied (no open-redirect risk).

### F. Data Exposure

- [ ] `safeUserSelect` is the only user projection used in quotes responses — confirm `passwordHash` is never selected.
- [ ] Error responses do not leak stack traces, Prisma error codes, or internal messages (`withLogging` returns generic 500 — ✓; spot-check handlers).
- [ ] Pagination cursor — currently raw `id`. Documented trade-off (opaque token deferred). Reference but do not re-raise.

### G. Logging Hygiene

- [ ] `logger.ts` redaction paths cover `email`, `password`, `address` at top level and one nesting level. Check whether any handler logs request bodies or user objects under different key names (e.g. `body`, `data`, `user.profile.email`) that bypass redaction. Recommend extending paths or wrapping with `pino`'s `wildcard` matchers.
- [ ] No `console.log` of sensitive data (`grep -rn "console.log" src/`).
- [ ] Trace IDs propagated via AsyncLocalStorage (`withLogging`) — ✓.
- [ ] Logger transport `pino-pretty` is gated on `NODE_ENV !== "production"` — ✓.

### H. Dependencies & Supply Chain

- [ ] Run `npm audit --omit=dev` mentally against `package.json`: flag obviously stale majors (Next 14.2.5 — known CVEs? recommend upgrade path), `bcryptjs` (pure-JS — slower than `bcrypt`; acceptable).
- [ ] No suspicious post-install scripts in direct deps.
- [ ] `package-lock.json` is committed (verify) — required for reproducible installs.

### I. Container & Deployment

- [ ] `Dockerfile` uses non-root user (`USER nextjs`) — ✓.
- [ ] `docker-compose.yml` is local-dev only and does not have `JWT_SECRET: dev-secret-change-me` baked into a production profile — confirm `profiles: [app]` keeps it opt-in.
- [ ] Prisma migrations are not auto-run in the production image — verify and flag if the Dockerfile entrypoint runs `prisma migrate deploy` (it should not; README says this is dev-only convenience).
- [ ] `next.config.mjs` output `"standalone"` — fine. No source maps shipped in prod.

### J. Cross-Site / Browser Risks

- [ ] CSRF: `sameSite: "strict"` mitigates most browser CSRF. Flag any state-changing GET endpoint as **CSRF risk** if present.
- [ ] CSP / security headers: none currently configured. Recommend `next.config.mjs` `headers()` adding `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security` (prod).
- [ ] No mixed-content fetches.

### K. Rate Limiting & Abuse

- Documented trade-off (no rate limiting). Reference and recommend a minimal in-process limiter for `/api/auth/login` and `/api/auth/register` to slow online brute-force attacks even before introducing Redis.

---

## Severity Rubric

Use these definitions consistently:

- 🔴 **Critical** — Exploitable in current code, leads to privilege escalation, account takeover, secret disclosure, or data exposure. Fix immediately.
- 🟠 **High** — Realistic exploit path requiring a contributing factor (weak secret in prod, missing matcher route added later). Fix this sprint.
- 🟡 **Medium** — Hardening; reduces blast radius or attacker surface. Schedule.
- 🟢 **Low** — Best-practice improvement.
- ℹ️ **Documented Trade-off** — Already acknowledged in `ARCHITECTURE.md` / `README.md`. Only reference; do not re-raise.

---

## Output Format

Inline markdown by default. Use this structure:

```markdown
# Security Review — green-quote

**Date:** <ISO date>
**Scope:** <full | module>
**Reviewer:** automated

## Summary

<2–3 sentences. Lead with critical/high counts. Name the single most urgent fix.>

## Findings

### 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

For each finding:

#### <Short title>
- **Severity:** 🔴/🟠/🟡/🟢
- **Location:** path:line (and additional refs)
- **Risk:** <one paragraph: what an attacker could do>
- **Remediation:** <concrete code change — show a diff or snippet>
- **Notes:** <optional — reference accepted trade-offs, related findings>

## Documented Trade-offs Verified

<bulleted list confirming the implementation matches what's promised in ARCHITECTURE.md / README.md production-readiness>

## Recommended Hardening Backlog

<numbered list, priority-ordered, for items beyond the immediate findings>
```

---

## Guidelines

- **Defensive only.** No exploit code, payloads, or attack scripts. Describe risk in prose.
- **Be specific and falsifiable.** Cite `path:line`; vague concerns are not findings.
- **Show, don't tell, the fix.** A one-line snippet or diff beats a paragraph of advice.
- **Respect documented trade-offs.** Reference them; do not re-raise as findings.
- **Triage carefully.** Reserve 🔴 for issues exploitable today. Hardening recommendations are 🟡/🟢.
- **Acknowledge strengths.** Note the things the project does well (redaction, RBAC, vertical slicing, Decimal precision, non-root container) — short paragraph at the end of the summary.
- **Stop at the boundary.** Anything that requires production runtime data, secrets, or actual exploitation is out of scope — recommend a pentest engagement instead.
