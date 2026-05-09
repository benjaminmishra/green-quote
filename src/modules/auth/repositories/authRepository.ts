import { prisma } from "@/shared/db";

export const authRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  createUser: (data: {
    fullName: string;
    email: string;
    passwordHash: string;
  }) => prisma.user.create({ data }),
};
