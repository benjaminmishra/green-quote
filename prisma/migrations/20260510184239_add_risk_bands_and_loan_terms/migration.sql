-- CreateTable
CREATE TABLE "RiskBands" (
    "band" "RiskBand" NOT NULL,
    "apr" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "RiskBands_pkey" PRIMARY KEY ("band")
);

-- CreateTable
CREATE TABLE "LoanTerms" (
    "id" TEXT NOT NULL,
    "termYears" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LoanTerms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoanTerms_termYears_key" ON "LoanTerms"("termYears");

-- AddForeignKey
ALTER TABLE "Quotes" ADD CONSTRAINT "Quotes_riskBand_fkey" FOREIGN KEY ("riskBand") REFERENCES "RiskBands"("band") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed RiskBands (reference data — part of schema)
INSERT INTO "RiskBands" ("band", "apr") VALUES ('A', 6.90) ON CONFLICT DO NOTHING;
INSERT INTO "RiskBands" ("band", "apr") VALUES ('B', 8.90) ON CONFLICT DO NOTHING;
INSERT INTO "RiskBands" ("band", "apr") VALUES ('C', 11.90) ON CONFLICT DO NOTHING;

-- Seed LoanTerms (reference data — part of schema)
INSERT INTO "LoanTerms" ("id", "termYears", "active") VALUES (gen_random_uuid(), 5, true) ON CONFLICT ("termYears") DO NOTHING;
INSERT INTO "LoanTerms" ("id", "termYears", "active") VALUES (gen_random_uuid(), 10, true) ON CONFLICT ("termYears") DO NOTHING;
INSERT INTO "LoanTerms" ("id", "termYears", "active") VALUES (gen_random_uuid(), 15, true) ON CONFLICT ("termYears") DO NOTHING;
