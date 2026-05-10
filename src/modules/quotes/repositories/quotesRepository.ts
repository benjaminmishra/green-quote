import { prisma } from "@/shared/db";
import type { QuoteCreateData } from "../models/repository";

export class QuotesRepositoryError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "QuotesRepositoryError";
  }
}

export const quotesRepository = {
  async create(data: QuoteCreateData) {
    try {
      return await prisma.quote.create({ data, include: { user: true } });
    } catch (err) {
      throw new QuotesRepositoryError("Failed to create quote", {
        cause: err,
      });
    }
  },

  async findManyByUser(userId: string) {
    try {
      return await prisma.quote.findMany({
        where: { userId },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });
    } catch (err) {
      throw new QuotesRepositoryError("Failed to find quotes by user", {
        cause: err,
      });
    }
  },

  async findManyAll() {
    try {
      return await prisma.quote.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });
    } catch (err) {
      throw new QuotesRepositoryError("Failed to find quotes", {
        cause: err,
      });
    }
  },

  async findById(id: string) {
    try {
      return await prisma.quote.findUnique({
        where: { id },
        include: { user: true },
      });
    } catch (err) {
      throw new QuotesRepositoryError("Failed to find quote by id", {
        cause: err,
      });
    }
  },
};
