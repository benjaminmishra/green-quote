import { z } from "zod";

const WEAK_SECRET_PATTERN = /^(change-me|changeme|secret|password|dev[-_]?secret)/i;

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const isProduction = process.env.NODE_ENV === "production";

  const jwtSecretSchema = z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters")
    .refine(
      (v) => !isProduction || !WEAK_SECRET_PATTERN.test(v),
      "JWT_SECRET looks like a development placeholder; generate a fresh secret for production",
    );

  const envSchema = z.object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    JWT_SECRET: jwtSecretSchema,
  });

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error(
      "Invalid environment variables during startup:",
      JSON.stringify(result.error.format(), null, 2),
    );
    process.exit(1);
  }
}
