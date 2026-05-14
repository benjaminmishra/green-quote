# GreenQuote

Next.js App Router + Prisma/PostgreSQL app for solar quote pre-qualification.

## Prerequisites

- Node 20+
- Docker

## Setup

1. Copy envs: `cp .env.example .env`
2. Start DB and run migrations/seed: `docker compose up`
3. Install deps: `npm install`
4. Run app locally: `npm run dev`

To run the app through Docker instead, use `docker compose --profile app up`.

## Test

- `npm run test`

## Some Architectural Decisions

- **Vertical Slice**: domain modules in `src/modules/auth` and `src/modules/quotes`.
- **Next.js app** only contains routing and route handlers in `src/app`.
- **Schemas & Validation**: Zod client/server.
- **Pricing Model Calculations**: Decimal.js used in pricing service for high precision.
- **Authentication**: email/password + JWT in secure HttpOnly cookie.

## API Reference

The application features an auto-rendered OpenAPI documentation page generated directly from Zod schemas using `@asteasolutions/zod-to-openapi` and `swagger-ui-react`.

- **Interactive API Docs**: Available at [`/api-docs`](http://localhost:3000/api-docs) when running locally.

Endpoints covered:
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/quotes`
- `GET /api/quotes`
- `GET /api/quotes/:id`

## RBAC

- Roles: `USER`, `ADMIN`.
- Permission-based checks are used (`quotes:create`, `quotes:read:own`, `quotes:read:any`, `admin:quotes:read`).
- JWT payload supports future Keycloak-style claims mapping (`realm_access.roles`) in `verifyToken`.

## Trade-offs

- **Monolith over Microservices**: Built as a modular monolith within the Next.js App Router for simplicity and speed. Separating the frontend and backend would add unnecessary operational overhead for this stage.
- **Client-side Fetching**: Used standard client-side `fetch` in React components instead of Next.js Server Actions. While Server Actions reduce boilerplate, standard API routes ensure a clean separation between the UI and the API layer, making the API independently testable and consumable.
- **Custom Auth vs External IdP**: Implemented custom email/password authentication (with bcrypt + JWT) to minimize external dependencies. Integrating an external IdP like Keycloak was deferred to keep the local setup fast, though the JWT validation layer is built to easily adapt to standard IdP claims.
- **Vertical Slicing**: Code is organized by feature domains (`auth`, `quotes`) rather than technical concern (controllers, services, models). This makes the codebase easier to navigate but can lead to slight duplication of shared utilities.

## What to do next

To harden the app for a large-scale production deployment, the following steps are recommended:

1. **IdP Integration**: Swap out the custom authentication module for a robust Identity Provider like Keycloak for enterprise-grade identity management.
2. **E2E Testing**: Integrate Playwright to simulate actual user journeys in a headless browser (e.g., User Sign Up -> Fill Quote Form -> See Results -> Admin Review).
3. **Result/Error Pattern**: Stop throwing exceptions for expected business logic failures (like validation errors). Instead, adopt a functional `Result<T, E>` pattern to safely propagate and exhaustively handle domain errors as the application scales.
4. **Master Data Admin UI**: Build the remaining bonus features (Amortization schedule, PDF export) and create an Admin UI panel to dynamically update the pricing master data (Risk Bands, APRs, Loan Terms) without needing database migrations.
