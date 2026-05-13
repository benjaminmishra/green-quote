import { z } from "zod";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const envSchema = z.object({
      DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
      JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    });

    const result = envSchema.safeParse(process.env);

    if (!result.success) {
      console.error(
        "❌ Invalid environment variables during startup:",
        JSON.stringify(result.error.format(), null, 2),
      );
      process.exit(1);
    }
  }
}
