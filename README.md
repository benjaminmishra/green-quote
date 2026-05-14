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

*Note: The included `docker-compose.yml` and `Dockerfile` are intended for local development convenience. For production deployments, please use the `Dockerfile.prod` multi-stage build.*

## Validation & Testing

- `npm run typecheck` (Checks TypeScript typings)
- `npm run test` (Runs both unit and integration tests)

## Architecture

Please refer to the [ARCHITECTURE.md](ARCHITECTURE.md) document for a detailed explanation of architectural decisions, module boundaries and engineering trade-offs.

## API Reference

Please refer to the [APIREFERENCE.md](APIREFERENCE.md) document for details on available endpoints and how to access the interactive OpenAPI documentation.

## Production Readiness

To harden the application for a large-scale production deployment, the following steps are required:

1. **Authentication (OIDC/JWKS)**: Swap out the custom authentication module for a robust Identity Provider like Keycloak. JWT validation should be updated to enforce issuer, audience, token type, and key rotation via JWKS.
2. **Secrets Management**: Sensitive configuration values and database credentials should be stored in a secure vault (e.g., AWS Secrets Manager or HashiCorp Vault) and injected into the runtime environment.
3. **Database Migrations**: The current setup automatically runs `prisma migrate deploy` on local startup for convenience. In production, migrations should be managed as a distinct deployment phase (e.g., via a CI/CD job or an init container) independent of the application server startup.
4. **Deployment & Scaling**: Utilize the multi-stage `Dockerfile.prod` for creating optimized production images. Deploy behind a load balancer and a CDN for static assets. Scale horizontally as needed.
5. **Observability**: Add correlation/request IDs to logs and implement comprehensive distributed tracing and metrics monitoring.
6. **E2E Testing**: Integrate Playwright to simulate actual user journeys in a headless browser.
7. **Result/Error Pattern**: Adopt a functional `Result<T, E>` pattern to safely propagate and exhaustively handle domain errors as the application scales.
