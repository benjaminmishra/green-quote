import { prisma } from "@/shared/db";
import type { QuoteCreateData } from "../models/repository";

import { RepositoryError } from "@/shared/errors";

export class QuotesRepositoryError extends RepositoryError {}

export const quotesRepository = {
  async create(data: QuoteCreateData) {
    try {
      return await prisma.quotes.create({ data, include: { user: true } });
    } catch (err) {
      throw new QuotesRepositoryError("Failed to create quote", {
        cause: err,
      });
    }
  },

  async findManyByUser(userId: string) {
    try {
      return await prisma.quotes.findMany({
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
      return await prisma.quotes.findMany({
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
      return await prisma.quotes.findUnique({
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
