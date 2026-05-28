-- Store a user's claimed organization without treating an unverified INN as ownership.
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inn" TEXT NOT NULL,
    "companyName" TEXT,
    "contactEmail" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'unverified',
    "plan" TEXT NOT NULL DEFAULT 'free',
    "checksLimit" INTEGER NOT NULL DEFAULT 1,
    "monitoringLimit" INTEGER NOT NULL DEFAULT 0,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Check" ADD COLUMN "clientIpHash" TEXT;
ALTER TABLE "Check" ADD COLUMN "deviceHash" TEXT;

CREATE UNIQUE INDEX "Workspace_userId_key" ON "Workspace"("userId");
CREATE INDEX "Workspace_inn_idx" ON "Workspace"("inn");
CREATE INDEX "Workspace_verificationStatus_idx" ON "Workspace"("verificationStatus");
CREATE INDEX "Check_clientIpHash_idx" ON "Check"("clientIpHash");
CREATE INDEX "Check_deviceHash_idx" ON "Check"("deviceHash");
CREATE INDEX "Check_userId_createdAt_idx" ON "Check"("userId", "createdAt");

ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
