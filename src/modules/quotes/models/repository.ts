import { prisma } from "@/shared/db";

export type QuoteCreateData = Parameters<typeof prisma.quote.create>[0]["data"];
