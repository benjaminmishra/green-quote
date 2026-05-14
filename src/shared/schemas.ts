import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const authRegisterSchema = z.object({
  fullName: z.string().trim().min(1).openapi({ example: "John Doe" }),
  email: z.string().trim().toLowerCase().email().openapi({ example: "john@example.com" }),
  password: z.string().min(6).openapi({ example: "password123", format: "password" }),
}).openapi("AuthRegister");

export const authLoginSchema = authRegisterSchema.pick({ email: true, password: true }).openapi("AuthLogin");

export const quoteCreateSchema = z.object({
  fullName: z.string().min(1).openapi({ example: "John Doe" }),
  email: z.string().email().openapi({ example: "john@example.com" }),
  address: z.string().min(3).openapi({ example: "123 Solar Way" }),
  monthlyConsumptionKwh: z.number().int().positive().openapi({ example: 500 }),
  systemSizeKw: z.number().positive().openapi({ example: 5 }),
  downPayment: z.number().nonnegative().optional().default(0).openapi({ example: 1000 }),
}).openapi("QuoteCreate");
