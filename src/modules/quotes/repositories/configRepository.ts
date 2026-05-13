import { prisma } from "@/shared/db";
import type { RiskBand } from "@prisma/client";

import { RepositoryError } from "@/shared/errors";

export class ConfigRepositoryError extends RepositoryError {}

export const configRepository = {
  async findRiskBand(band: RiskBand) {
    try {
      return await prisma.riskBands.findUniqueOrThrow({ where: { band } });
    } catch (err) {
      throw new ConfigRepositoryError(`Failed to find risk band: ${band}`, {
        cause: err,
      });
    }
  },

  async findActiveLoanTerms() {
    try {
      return await prisma.loanTerms.findMany({
        where: { active: true },
        orderBy: { termYears: "asc" },
      });
    } catch (err) {
      throw new ConfigRepositoryError("Failed to find active loan terms", {
        cause: err,
      });
    }
  },
};
