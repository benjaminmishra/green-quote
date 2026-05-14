---
name: code-review
description: Perform a thorough codebase review of the green-quote project across architecture, correctness, types, security, tests, and Next.js best practices, and produce a structured markdown report.
---

# Codebase Review — green-quote

Perform a thorough codebase review of the green-quote project. Analyze the codebase across the dimensions listed below and produce a structured review report.

## Review Scope

Review **only first-party source**: `src/`, `tests/`, `prisma/`, and top-level config (`next.config.mjs`, `tsconfig.json`, `Dockerfile`, `docker-compose.yml`, `package.json`). **Exclude** `node_modules/`, `.next/`, `*.tsbuildinfo`, `package-lock.json`, and any generated Prisma client.

If the invocation includes `$ARGUMENTS` (e.g. `quotes`, `auth`, `pricing`), scope the review to that module/area only and skip dimensions that do not apply.

## How to Read the Repo

Before producing findings, read at minimum:

- `ARCHITECTURE.md` and `README.md` (to ground claims against the documented intent — flag drift, do not duplicate the architecture description).
- `prisma/schema.prisma` and every file under `prisma/migrations/` (reference data lives in migration SQL, e.g. `RiskBands`, `LoanTerms` — do **not** flag missing seeds for these).
- `src/middleware.ts`, `src/instrumentation.ts`, `src/app/**/route.ts` (the request/response surface).
- The module(s) in scope: `src/modules/<name>/{api,services,repositories,models,ui}/*`.
- Tests that cover the module in scope, especially `tests/integration/*-flow.test.ts` — these encode the API contract.

Prefer reading whole files for files <300 lines; grep first for files >300 lines.

---

## Review Dimensions

For each dimension assign 🟢 Healthy / 🟡 Needs Attention / 🔴 Needs Significant Work. Always cite `path:line` so the user can jump to the source.

### 1. Folder Structure & Architecture

- Does the layout follow the documented vertical-slice pattern (`src/modules/<feature>/{api,services,repositories,models,ui}`)?
- Are App Router files (`src/app/**`) thin shims that delegate to module handlers?
- Are there **layer inversions**? Specifically check that `repositories/` does NOT import from `api/` or `ui/`, and that `services/` does NOT import from `api/`. (Historical hot spot: `safeUserSelect` colocated in `api/dto.ts` but consumed by repositories.)
- Are `src/lib/` and `src/shared/` boundaries respected and non-overlapping?

### 2. API ↔ UI Contract Coherence (high signal)

This is the dimension most likely to harbor latent runtime bugs. For every API handler in scope:

1. Note the exact JSON shape it returns (`NextResponse.json({...})`).
2. Find every UI fetch of that endpoint and verify the consumer destructures the same shape.
3. Check pagination, error envelopes, and Decimal-as-string conventions for consistency between server and client.

Cite both ends of any mismatch.

### 3. Code Readability & Clarity

- Naming, function size, file size (flag >300 lines, suggest decomposition).
- JSDoc correctness — `/** */` vs `/* */` (the latter does not render).
- Inline-style sprawl in `ui/`: acceptable in this codebase but suggest extraction when a file exceeds ~250 lines or repeats styles.
- Dead code, unused params (`_req` convention).

### 4. Separation of Concerns

- API handlers should orchestrate **auth → DTO → service → response**, not call repositories or compute business logic directly. Hot spot: `postQuoteHandler` historically computes risk band + pricing + persistence directly — recommend a `quoteService.createQuote()`.
- UI components should not embed business rules; only display + minimal client-side validation.
- Repositories own all Prisma calls; services and handlers must not touch `prisma.*` directly.

### 5. Error Handling & Robustness

- Are domain errors typed (subclasses of `RepositoryError` / `ServiceError`) rather than string-matched on `.message`? Flag any `err.message === "..."` comparison.
- Is Zod parsing consistent — prefer `safeParse` with explicit error mapping over `.parse` + catch.
- Are all JSON body reads guarded with try/catch returning 400 "Invalid JSON payload"?
- Does `withLogging` correctly wrap every handler? Are unhandled errors converted to a generic 500 without leaking internals?
- Does `middleware.ts` correctly fall back from `Authorization` header to cookie in **all** edge cases (empty header, non-Bearer scheme)?

### 6. Type Safety

- `any`/`unknown` usage — only acceptable at JSON parsing boundaries.
- Prisma `Decimal` and `Json` fields: are they projected through a DTO before reaching the UI? Flag direct leakage of `Prisma.Decimal` or untyped `Json` to the response.
- Test fixtures using `as any` to bypass repository contracts — flag and suggest typed factories.
- Zod schemas in `src/shared/schemas.ts` should be the single source of truth for request DTOs.

### 7. Testing

- Is pricing logic covered with boundary tests? (`determineRiskBand` thresholds 250/400, size=6 boundary; `calculatePricing` with `apr=0`, `down >= systemPrice`, large numbers.)
- Are integration tests using testcontainers correctly and reseeding state between tests?
- Is there at least one test asserting the **shape** the UI consumes (especially paginated `{ items, nextCursor }` envelopes)?
- Test names descriptive; no `it("works")`.

### 8. Security (lightweight — defer deep pass to `security-review` skill)

- Flag obvious issues only (hardcoded secrets, missing auth on protected routes, `dangerouslySetInnerHTML`, missing `httpOnly`/`secure`/`sameSite` on auth cookies).
- For any deeper security concern, write "**See security-review.**" and stop.

### 9. DRY & Code Reuse

- Cursor-pagination duplication between `findManyByUser` and `findManyAll` (and equivalents).
- Repeated JSON-body parsing guards across handlers — propose a shared helper.
- Inline-style duplication that could move to `*Styles.ts`.

### 10. Next.js App Router & Full-Stack Best Practices

- Are pages Server Components by default, with `"use client"` pushed as deep as possible?
- Could a page pre-fetch its first data slice on the server and hand `initialItems` to the client component (cheap perf win)?
- Are `redirect()` calls placed correctly (no flicker)?
- Are server-only secrets free of `NEXT_PUBLIC_` prefix?
- Is `instrumentation.ts` env validation strict (length/entropy, not just non-empty)?

---

## Output Format

Produce a markdown report — inline in chat by default, or to a file if the user explicitly asks. Use this structure:

```markdown
# Codebase Review — green-quote

**Date:** <ISO date>
**Scope:** <full | module name>

## Summary

<2–3 sentences with health rating: 🟢 / 🟡 / 🔴. Name the single highest-impact issue.>

## Detailed Findings

### 1. Folder Structure & Architecture — <rating>
<findings with path:line citations>

### 2. API ↔ UI Contract Coherence — <rating>
<findings>

... (one section per applicable dimension)

## Top Recommendations
<numbered, priority-ordered, with concrete code snippets where they sharpen the suggestion>

## Quick Wins
<bulleted, small-and-easy items>
```

---

## Guidelines

- **Be specific.** Every claim needs a `path:line` citation. Vague observations ("this could be cleaner") are not findings.
- **Acknowledge strengths.** Call out what the codebase does well — RBAC, pino redaction, Decimal usage, vertical slicing.
- **Distinguish bugs from style.** Lead with bugs (anything that breaks at runtime or violates the contract) before stylistic items.
- **Pair every criticism with a fix.** Show a one-line snippet or pseudocode for the proposed change.
- **Respect documented trade-offs.** `ARCHITECTURE.md` already calls out: monolith, client-side fetching, custom auth, simple cursor pagination, no JWT revocation, no rate limiting. Do not re-litigate these — only flag if the implementation deviates from the documented trade-off.
- **Defer deep security.** For anything beyond an obvious lapse, write "See security-review." and stop.
