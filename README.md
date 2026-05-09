# GreenQuote

Next.js App Router + Prisma/PostgreSQL app for solar quote pre-qualification.

## Prerequisites
- Node 20+
- Docker

## Setup
1. Copy envs: `cp .env.example .env`
2. Start DB: `docker compose up -d db`
3. Install deps: `npm install`
4. Prisma: `npm run prisma:generate && npm run prisma:migrate && npm run prisma:seed`
5. Run app: `npm run dev`

## Test
- `npm run test`

## Design
- **Vertical Slice**: domain modules in `src/modules/auth` and `src/modules/quotes`.
- **Next.js app** only contains routing and route handlers in `src/app`.
- **Validation**: Zod client/server.
- **Money math**: Decimal.js used in pricing service.
- **Auth**: email/password + JWT in secure HttpOnly cookie.

## API Reference
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
