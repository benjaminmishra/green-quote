import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { authRegisterSchema, authLoginSchema, quoteCreateSchema } from "./schemas";
import { z } from "zod";

export const registry = new OpenAPIRegistry();

// Security Scheme
const cookieAuth = registry.registerComponent("securitySchemes", "cookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "token",
});

registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  summary: "Register a new user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: authRegisterSchema,
        },
      },
    },
  },
  responses: {
    200: { description: "User registered successfully" },
    400: { description: "Validation error" },
    409: { description: "Email already used" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  summary: "Login user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: authLoginSchema,
        },
      },
    },
  },
  responses: {
    200: { description: "User logged in" },
    400: { description: "Validation error" },
    401: { description: "Invalid credentials" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/quotes",
  summary: "Create a quote",
  security: [{ [cookieAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: quoteCreateSchema,
        },
      },
    },
  },
  responses: {
    200: { description: "Quote created" },
    400: { description: "Validation error" },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/quotes",
  summary: "List quotes",
  security: [{ [cookieAuth.name]: [] }],
  responses: {
    200: { description: "Quotes listed" },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/quotes/{id}",
  summary: "Get a quote by ID",
  security: [{ [cookieAuth.name]: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "cltx..." }),
    }),
  },
  responses: {
    200: { description: "Quote found" },
    401: { description: "Unauthorized" },
    403: { description: "Forbidden" },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/health",
  summary: "Health check",
  responses: {
    200: { description: "Healthy" },
  },
});

export function generateOpenApiSpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "GreenQuote API",
      description: "API for GreenQuote solar financing pre-qualification",
    },
    servers: [{ url: "/" }],
  });
}
