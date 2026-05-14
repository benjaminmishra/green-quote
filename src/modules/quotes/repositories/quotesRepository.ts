import { prisma } from "@/shared/db";
import { Prisma } from "@prisma/client";
import type { QuoteCreateData } from "../models/repository";

import { RepositoryError } from "@/shared/errors";
import { safeUserSelect } from "../models/userProjection";

export class QuotesRepositoryError extends RepositoryError {}
export class QuotesInvalidCursorError extends QuotesRepositoryError {}

type PageOptions = { limit?: number; cursor?: string };

function pageArgs({ limit, cursor }: PageOptions) {
  return {
    take: limit,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : undefined,
  };
}

function rethrowPaginationError(err: unknown, msg: string): never {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2025"
  ) {
    throw new QuotesInvalidCursorError("Invalid cursor", { cause: err });
  }
  throw new QuotesRepositoryError(msg, { cause: err });
}

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

  async findManyByUser(userId: string, options: PageOptions = {}) {
    try {
      return await prisma.quotes.findMany({
        where: { userId },
        include: { user: { select: safeUserSelect } },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        ...pageArgs(options),
      });
    } catch (err) {
      rethrowPaginationError(err, "Failed to find quotes by user");
    }
  },

  async findManyAll(options: PageOptions = {}) {
    try {
      return await prisma.quotes.findMany({
        include: { user: { select: safeUserSelect } },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        ...pageArgs(options),
      });
    } catch (err) {
      rethrowPaginationError(err, "Failed to find quotes");
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
