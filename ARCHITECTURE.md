# GreenQuote Architecture

This document describes the architectural decisions, trade-offs, and structure of the GreenQuote application.

## Architectural Decisions

- **Vertical Slice**: Domain modules are organized in `src/modules/auth` and `src/modules/quotes`.
- **Next.js App Router**: The Next.js `src/app` directory only contains routing and route handlers, keeping domain logic isolated.
- **Schemas & Validation**: Zod is used for both client-side and server-side validation.
- **Pricing Model Calculations**: `decimal.js` is used in the pricing service for high precision to prevent floating-point errors.
- **Authentication**: Custom email/password + JWT stored in a secure HttpOnly cookie.

## Trade-offs

- **Monolith over Microservices**: Built as a modular monolith within the Next.js App Router for simplicity and speed. Separating the frontend and backend would add unnecessary operational overhead for this stage.
- **Client-side Fetching**: Used standard client-side `fetch` in React components instead of Next.js Server Actions. While Server Actions reduce boilerplate, standard API routes ensure a clean separation between the UI and the API layer, making the API independently testable and consumable.
- **Custom Auth vs External IdP**: Implemented custom email/password authentication (with bcrypt + JWT) to minimize external dependencies. Integrating an external IdP like Keycloak was deferred to keep the local setup fast, though the JWT validation layer is built to easily adapt to standard IdP claims.
- **Vertical Slicing**: Code is organized by feature domains (`auth`, `quotes`) rather than technical concern (controllers, services, models). This makes the codebase easier to navigate but can lead to slight duplication of shared utilities.
- **Pagination Strategy**: The application currently uses a simple cursor-based pagination with Prisma (`take: limit`, `skip: 1`, `cursor: { id }`). While this is simple and works for the current scale, it is a known architectural tradeoff. In a high-scale production system, an opaque continuation token should be used instead to ensure cursor values cannot be easily guessed or manipulated, and to potentially allow encoding query state directly into the token.
- **JWT Revocation**: Currently, JWT revocation does not exist. Once issued, the token remains valid for its full 24-hour lifespan (`.setExpirationTime("1d")`). If a token leaks, it cannot be revoked. Production systems usually mitigate this by using short-lived access tokens, refresh tokens, token versioning, a centralized session store, and blacklist/revocation support. This was an explicit trade-off decision made to avoid unnecessary complexity at this stage of the project.
- **Rate Limiting**: There is currently no rate limiting or API throttling implemented. Since this application is primarily a demonstration and proof-of-concept, we bypassed adding tools like Redis for rate limiting to keep the infrastructure footprint small and the deployment simple.
