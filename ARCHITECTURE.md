# Architecture Overview

## Introduction

This project is a modular-monolith backend application for generating and managing solar financing quotes.

The system was intentionally designed to optimize for:

- maintainability,
- operational simplicity,
- deterministic business behavior,
- clear module boundaries,
- local reproducibility,
- future extensibility.

The current implementation focuses on delivering a production-oriented foundation without prematurely introducing distributed system complexity.

# Architectural Principles

The system is designed around the following principles:

- Prefer modularity over premature distribution.
- Keep business logic isolated from transport and persistence layers.
- Optimize for simplicity and maintainability first.
- Design modules that can later evolve into services if needed.
- Keep APIs deterministic and testable.
- Centralize authorization decisions.
- Treat pricing logic as domain logic rather than persistence logic.
- Make trade-offs explicit and documented.

# High-Level Architecture

The application follows a modular monolith architecture.

Each domain is isolated into vertical slices:

- `auth`
- `quotes`
- `shared`

Each module owns:
- API handlers,
- services,
- repositories,
- DTOs,
- domain logic.

The system intentionally avoids introducing:
- distributed messaging,
- service meshes,
- orchestration layers,
- separate deployable services,

because the current domain complexity and operational requirements do not justify that level of infrastructure complexity.

# Why a Modular Monolith

A modular monolith was intentionally chosen over microservices.

Reasons:

- simpler deployments,
- lower operational overhead,
- easier local development,
- easier transactional consistency,
- reduced cognitive complexity,
- faster iteration speed,
- smaller infrastructure footprint.

For the current scope, introducing distributed services would create more operational complexity than business value.

The module boundaries are intentionally designed so they could later evolve into independently deployable services if scale or organizational structure required it.


# Security and Trust Boundaries

Authentication is validated at the middleware layer using JWT verification.
The middleware injects a normalized authentication context into downstream handlers.
Protected routes are intentionally isolated behind middleware matchers.

# Authorization Model

The system uses role-based access control (RBAC).

Roles:
- USER
- ADMIN

Permissions are derived from roles.

Authorization decisions are centralized through shared RBAC utilities rather than scattered inline checks.


# Pricing Architecture

Pricing logic is intentionally isolated from persistence and transport layers.

The pricing engine:
- is deterministic,
- contains no database access,
- uses `decimal.js` for monetary precision,
- is fully unit testable.

# Persistence Strategy

The application uses PostgreSQL with Prisma ORM.

Reasons:
- transactional consistency,
- strong relational modeling,
- mature tooling,
- migration support,
- strong TypeScript integration.

# Pagination Strategy

Cursor pagination was chosen over offset pagination to avoid large-offset query degradation.

Current implementation uses entity identifiers as cursors andoptimizes for implementation simplicity.

# Observability

The system includes structured logging around:
- authentication,
- authorization,
- quote creation,
- error handling.

It uses pino for logging, and it logs to stdout, which is what docker expects.
In prod this needs to be wired up to a log aggregation system.

# Operational Simplicity

The app architecture intentionally minimizes operational burden:

- single deployable unit, is built on a modular monolith,
- single database, uses PostgreSQL,
- deterministic local setup, can run in a docker container.
- minimal infrastructure dependencies

# Non-Goals

This project intentionally does not include:

- multi-region deployments,
- distributed caching,
- advanced fraud detection,
- asynchronous workflow orchestration,
- multi-tenant isolation,
- advanced risk scoring,
- full OIDC identity integration.

The primary goal was to optimize for:
- clarity,
- correctness,
- maintainability,
- architectural extensibility,
- operational simplicity.
