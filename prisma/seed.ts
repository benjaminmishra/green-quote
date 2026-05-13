import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  // DEV ONLY — hardcoded password for local development seed data
  const passwordHash = await bcrypt.hash("Admin123!", 10);
  await prisma.users.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      fullName: "Admin User",
      passwordHash,
      role: Role.ADMIN,
    },
  });
}
main().finally(async () => prisma.$disconnect());
