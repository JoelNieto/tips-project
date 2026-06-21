-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DESIGNER', 'ORG_ADMIN', 'EMPLOYEE');

-- AlterTable: user role and admin plugin fields
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'DESIGNER';
ALTER TABLE "users" ADD COLUMN "banned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "banReason" TEXT;
ALTER TABLE "users" ADD COLUMN "banExpires" TIMESTAMP(3);

-- Bootstrap first user as platform admin
UPDATE "users"
SET "role" = 'ADMIN'
WHERE "id" = (SELECT "id" FROM "users" ORDER BY "createdAt" ASC LIMIT 1);

-- CreateTable: organizations
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- Create default organization for existing companies
INSERT INTO "organizations" ("id", "name", "description", "createdAt", "updatedAt", "createdById")
SELECT
    gen_random_uuid()::text,
    'Default Organization',
    'Auto-created during RBAC migration',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    (SELECT "id" FROM "users" ORDER BY "createdAt" ASC LIMIT 1)
WHERE EXISTS (SELECT 1 FROM "companies" LIMIT 1)
   OR EXISTS (SELECT 1 FROM "users" LIMIT 1);

-- Add organizationId to companies (nullable first for backfill)
ALTER TABLE "companies" ADD COLUMN "organizationId" TEXT;

UPDATE "companies"
SET "organizationId" = (SELECT "id" FROM "organizations" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "organizationId" IS NULL;

ALTER TABLE "companies" ALTER COLUMN "organizationId" SET NOT NULL;

-- CreateTable: organization_users
CREATE TABLE "organization_users" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable: organization_surveys
CREATE TABLE "organization_surveys" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "organization_surveys_pkey" PRIMARY KEY ("id")
);

-- AlterTable: link employees to auth users
ALTER TABLE "employees" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "employees_userId_key" ON "employees"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_users_organizationId_userId_key" ON "organization_users"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_surveys_organizationId_surveyId_key" ON "organization_surveys"("organizationId", "surveyId");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "companies" ADD CONSTRAINT "companies_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "organization_surveys" ADD CONSTRAINT "organization_surveys_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "organization_surveys" ADD CONSTRAINT "organization_surveys_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "organization_surveys" ADD CONSTRAINT "organization_surveys_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "employees" ADD CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
