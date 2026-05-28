CREATE TYPE "RiskLevel" AS ENUM ('low', 'medium', 'high');

CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'LIQUIDATION', 'INACTIVE', 'BANKRUPTCY');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "inn" TEXT NOT NULL,
    "ogrn" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL,
    "status" "CompanyStatus" NOT NULL,
    "address" TEXT NOT NULL,
    "director" TEXT NOT NULL,
    "okved" TEXT NOT NULL,
    "authorizedCapital" INTEGER,
    "massAddress" BOOLEAN NOT NULL DEFAULT false,
    "directorChangesYear" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Check" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "companyId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "level" "RiskLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Check_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "level" "RiskLevel" NOT NULL,
    "reasonsJson" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "sourcesJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MonitoringItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "companyId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MonitoringItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MonitoringEvent" (
    "id" TEXT NOT NULL,
    "monitoringItemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" "RiskLevel" NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MonitoringEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "checksLimit" INTEGER NOT NULL,
    "monitoringLimit" INTEGER NOT NULL,
    "provider" TEXT,
    "providerRef" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Company_inn_key" ON "Company"("inn");
CREATE UNIQUE INDEX "Company_ogrn_key" ON "Company"("ogrn");
CREATE UNIQUE INDEX "Check_reportId_key" ON "Check"("reportId");
CREATE UNIQUE INDEX "MonitoringItem_userId_companyId_key" ON "MonitoringItem"("userId", "companyId");

ALTER TABLE "Check" ADD CONSTRAINT "Check_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Check" ADD CONSTRAINT "Check_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Check" ADD CONSTRAINT "Check_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MonitoringItem" ADD CONSTRAINT "MonitoringItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MonitoringItem" ADD CONSTRAINT "MonitoringItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MonitoringEvent" ADD CONSTRAINT "MonitoringEvent_monitoringItemId_fkey" FOREIGN KEY ("monitoringItemId") REFERENCES "MonitoringItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
