import { prisma } from "@/shared/db";
import type { QuoteCreateData } from "../models/repository";

import { RepositoryError } from "@/shared/errors";

export class QuotesRepositoryError extends RepositoryError {}

const safeUserSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  createdAt: true,
} as const;

export const quotesRepository = {
  async create(data: QuoteCreateData) {
    try {
      return await prisma.quotes.create({
        data,
        include: { user: { select: safeUserSelect } },
      });
    } catch (err) {
      throw new QuotesRepositoryError("Failed to create quote", {
        cause: err,
      });
    }
  },

  async findManyByUser(
    userId: string,
    options?: { limit?: number; cursor?: string },
  ) {
    try {
      const take = options?.limit;
      const cursor = options?.cursor ? { id: options.cursor } : undefined;
      const skip = cursor ? 1 : undefined;

      return await prisma.quotes.findMany({
        where: { userId },
        include: { user: { select: safeUserSelect } },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take,
        cursor,
        skip,
      });
    } catch (err) {
      throw new QuotesRepositoryError("Failed to find quotes by user", {
        cause: err,
      });
    }
  },

  async findManyAll(options?: { limit?: number; cursor?: string }) {
    try {
      const take = options?.limit;
      const cursor = options?.cursor ? { id: options.cursor } : undefined;
      const skip = cursor ? 1 : undefined;

      return await prisma.quotes.findMany({
        include: { user: { select: safeUserSelect } },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take,
        cursor,
        skip,
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
        include: { user: { select: safeUserSelect } },
      });
    } catch (err) {
      throw new QuotesRepositoryError("Failed to find quote by id", {
        cause: err,
      });
    }
  },
};
