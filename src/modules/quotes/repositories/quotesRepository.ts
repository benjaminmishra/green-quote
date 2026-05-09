import { prisma } from '@/shared/db';
export const quotesRepository = {
  create: (data: any) => prisma.quote.create({ data, include: { user: true } }),
  findManyByUser: (userId: string) => prisma.quote.findMany({ where: { userId }, include: { user: true }, orderBy: { createdAt: 'desc' } }),
  findManyAll: () => prisma.quote.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } }),
  findById: (id: string) => prisma.quote.findUnique({ where: { id }, include: { user: true } })
};
