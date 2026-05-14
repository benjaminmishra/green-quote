# API Reference

The GreenQuote application features an auto-rendered OpenAPI documentation page generated directly from Zod schemas using `@asteasolutions/zod-to-openapi` and `swagger-ui-react`.

## Interactive API Docs

When running the application locally, you can access the interactive Swagger UI documentation at:
[`/api-docs`](http://localhost:3000/api-docs)

## HTTP Request Examples

A `requests/` folder is included at the root of the repository. It contains `.http` files (one for each logical API route grouping) with ready-to-use request examples. These files can be executed directly from IDEs that support them (like VS Code with the REST Client extension or JetBrains IDEs).

- `requests/health.http`
- `requests/auth-register.http`
- `requests/auth-login.http`
- `requests/quotes-create.http`
- `requests/quotes-list.http`
- `requests/quotes-get.http`

## Available Endpoints

### Health
- **`GET /api/health`**: Returns the health status of the application.

### Authentication
- **`POST /api/auth/register`**: Registers a new user. Requires `fullName`, `email`, and `password`.
- **`POST /api/auth/login`**: Authenticates a user and sets a secure HttpOnly JWT cookie. Requires `email` and `password`.

### Quotes
*Note: All quote endpoints require authentication (JWT cookie or Bearer token).*

- **`POST /api/quotes`**: Creates a new solar quote pre-qualification. Requires `address`, `monthlyConsumptionKwh`, `systemSizeKw`, and optionally `downPayment`. (Requires `quotes:create` permission)
- **`GET /api/quotes`**: Retrieves a paginated list of quotes.
  - Query parameters: `?limit=20&cursor=<quote_id>` (`limit` defaults to 20, capped at 100; `cursor` is the `id` of the last item from the previous page).
  - Response shape:
    ```json
    {
      "items": [ /* QuoteResponse[] */ ],
      "nextCursor": "<id>" | null
    }
    ```
    `nextCursor` is `null` when the returned page is shorter than `limit` (i.e. no more results).
  - Regular users see their own quotes. Admins (with `quotes:read:any` or `admin:quotes:read` permission) see all quotes.
- **`GET /api/quotes/:id`**: Retrieves details for a specific quote by its ID. Users can only read their own quotes unless they have admin permissions.
