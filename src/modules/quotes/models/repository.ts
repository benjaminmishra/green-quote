import { prisma } from "@/shared/db";

export type QuoteCreateData = Parameters<typeof prisma.quotes.create>[0]["data"];
