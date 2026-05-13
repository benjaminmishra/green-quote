# Codebase Review

Perform a thorough codebase review of the green-quote project. Analyze the codebase across the dimensions listed below and produce a structured review report as a markdown artifact.

## Review Scope

Review the **entire** project. Focus on `src/`, `tests/`, and `prisma/` directories. Exclude `node_modules/`, `.next/`, and generated files.

If the user provides a `$ARGUMENTS` value (e.g. a specific module name like "quotes" or "auth"), scope the review to that area only.

---

## Review Dimensions

### 1. Folder Structure & Architecture

- Does the folder layout follow a clear, consistent pattern (e.g. feature-based modules)?
- Are module boundaries well-defined? Is there leakage between modules?
- Is the separation between `app/` (Next.js routes), `modules/` (domain logic), `shared/` (cross-cutting), and `lib/` (framework glue) respected?
- Are files placed in the right layer? (e.g. API routes don't contain business logic, repositories don't contain UI code)
- Flag any orphaned, misplaced, or confusingly named files/directories.

### 2. Code Readability & Clarity

- Are functions and variables named clearly and consistently?
- Is the code self-documenting? Are comments used where genuinely needed (not to explain obvious code)?
- Are files a reasonable length? Flag any that exceed ~200 lines.
- Is there consistent formatting and code style?
- Are complex expressions broken down into readable steps?
- Is there appropriate use of TypeScript types vs `any`?

### 3. Separation of Concerns

- Does each module follow the internal layering pattern: `api/` → `services/` → `repositories/` → `models/`?
- Are UI components (`ui/`) free of direct data-fetching or business logic?
- Are services pure or at least clearly separated from infrastructure?
- Is the Prisma client properly abstracted behind repositories?

### 4. Error Handling & Robustness

- Are errors handled consistently across API routes and services?
- Is there proper input validation (e.g. using Zod schemas)?
- Are edge cases considered (empty results, invalid inputs, auth failures)?
- Is logging used effectively (structured logging with pino)?

### 5. Type Safety

- Are TypeScript types used effectively throughout?
- Are there model types for domain, UI, and API layers (avoiding leaking Prisma types to the frontend)?
- Is `any` used anywhere it shouldn't be?
- Are Zod schemas aligned with TypeScript types?

### 6. Testing

- Is test coverage adequate for critical paths (services, pricing logic, API routes)?
- Are unit and integration tests properly separated?
- Do integration tests use testcontainers correctly?
- Are test names descriptive and organized?
- Are there missing test cases for important edge cases?

### 7. Security

- Is authentication/authorization properly enforced (middleware, RBAC)?
- Are secrets handled correctly (env vars, not hardcoded)?
- Is input sanitized before database queries?
- Are API routes properly protected?

### 8. DRY & Code Reuse

- Is there duplicated logic that should be extracted?
- Are shared utilities in `src/shared/` actually reused?
- Are there similar patterns across modules that could be unified?

### 9. Next.js App Router & Full Stack Best Practices

- **Server-First Approach**: Are React Server Components (RSC) the default? Are Client Components (`"use client"`) pushed as deep into the component tree as possible?
- **Thin Route Boundaries**: Are `page.tsx` and `layout.tsx` files lean, delegating business logic to dedicated services or helper functions?
- **Colocation**: Are files kept close to where they are used (The Rule of Proximity)?
- **Data Fetching & State**: Is data fetched on the server close to where it's used? Are Server Actions utilized for form submissions and mutations instead of traditional API routes?
- **Security**: Are server-only secrets properly protected (no `NEXT_PUBLIC_` prefix unless needed)? Are Server Actions validating input with schemas (like Zod) and authenticating every request?

---

## Output Format

Produce the review as a markdown artifact named `codebase_review.md` with the following structure:

```
# Codebase Review — green-quote

**Date:** <current date>
**Scope:** <full codebase or specific module>

## Summary

<2-3 sentence overall assessment with a health rating: 🟢 Healthy / 🟡 Needs Attention / 🔴 Needs Significant Work>

## Detailed Findings

### 1. Folder Structure & Architecture
**Rating:** 🟢/🟡/🔴

<findings with specific file references>

### 2. Code Readability & Clarity
**Rating:** 🟢/🟡/🔴

<findings with specific file references and line numbers>

... (repeat for each dimension)

## Top Recommendations

<Numbered list of the 5 most impactful improvements, ordered by priority>

## Quick Wins

<Bullet list of small, easy-to-fix issues>
```

---

## Guidelines

- Be specific: reference actual files and line numbers.
- Be constructive: pair every criticism with a concrete suggestion.
- Acknowledge strengths: call out well-designed parts of the codebase.
- Use code snippets in your findings when they help illustrate a point.
- Keep recommendations actionable and prioritized by impact.
