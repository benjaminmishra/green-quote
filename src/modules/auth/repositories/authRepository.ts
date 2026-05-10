import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/db";

export class AuthRepositoryError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AuthRepositoryError";
  }
}

function isUniqueConstraintError(err: unknown) {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  );
}

export const authRepository = {
  async findByEmail(email: string) {
    try {
      return await prisma.user.findUnique({ where: { email } });
    } catch (err) {
      throw new AuthRepositoryError("Failed to find user by email", {
        cause: err,
      });
    }
  },

  async createUser(data: {
    fullName: string;
    email: string;
    passwordHash: string;
  }) {
    try {
      return await prisma.user.create({ data });
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        throw new AuthRepositoryError("Email already used", { cause: err });
      }

      throw new AuthRepositoryError("Failed to create user", { cause: err });
    }
  },
};
