# GreenQuote

Next.js App Router + Prisma/PostgreSQL app for solar quote pre-qualification.

## Prerequisites

- Node 20+
- Docker

## Setup

1. Copy envs: `cp .env.example .env`
2. Generate a `JWT_SECRET` of at least 32 characters and put it in `.env`. The boot-time env check (see `src/instrumentation.ts`) refuses to start the app with a shorter value, and in production also rejects obvious placeholders like `change-me`:
   ```bash
   openssl rand -hex 32
   ```
3. Start DB and run migrations/seed: `docker compose up`
4. Install deps: `npm install`
5. Run app locally: `npm run dev`

*Note: The root `Dockerfile` is production-oriented and uses Next.js standalone output. The `docker-compose.yml` is intended for local development convenience.*

## Validation & Testing

- `npm run typecheck` (Checks TypeScript typings)
- `npm run test` (Runs both unit and integration tests)

## Architecture

Please refer to the [ARCHITECTURE.md](ARCHITECTURE.md) document for a detailed explanation of architectural decisions, module boundaries and engineering trade-offs.

## API Reference

Please refer to the [APIREFERENCE.md](APIREFERENCE.md) document for details on available endpoints and how to access the interactive OpenAPI documentation.

## What to do next

Ideally the next step is to make this application production-ready. To harden the application for a production deployment, the following steps are required:

1. **Authentication (OIDC/JWKS)**: Swap out the custom authentication module for a robust Identity Provider like Keycloak. JWT validation should be updated to enforce issuer, audience, token type, and key rotation via JWKS. The boot-time secret-strength check in `src/instrumentation.ts` is a minimum bar — it does not replace proper key management.

2. **Secrets Management**: Sensitive configuration values and database credentials should be stored in a secure vault (e.g., AWS Secrets Manager or HashiCorp Vault) and injected into the runtime environment.

3. **Database Migrations**: The current setup automatically runs `prisma migrate deploy` on local startup for convenience. In production, migrations should be managed as a distinct deployment phase (e.g., via a CI/CD job or an init container) independent of the application server startup.

4. **Deployment & Scaling**: Utilize the multi-stage `Dockerfile` for creating optimized production images. Deploy behind a load balancer and a CDN for static assets. Scale horizontally as needed.

5. **Observability**: Add correlation/request IDs to logs and implement comprehensive distributed tracing and metrics monitoring.

6. **E2E Testing**: Integrate Playwright to simulate actual user journeys in a headless browser.

7. **Result/Error Pattern**: Adopt a functional `Result<T, E>` pattern to safely propagate and exhaustively handle domain errors as the application scales.
