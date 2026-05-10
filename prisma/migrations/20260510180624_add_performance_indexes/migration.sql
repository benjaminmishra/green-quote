-- CreateIndex
CREATE INDEX "Quote_userId_idx" ON "Quote"("userId");

-- CreateIndex
CREATE INDEX "Quote_createdAt_idx" ON "Quote"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "User_fullName_idx" ON "User"("fullName");
