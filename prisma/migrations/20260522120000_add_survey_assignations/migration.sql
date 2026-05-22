-- CreateTable
CREATE TABLE "survey_assignations" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "welcomeMessage" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "survey_assignations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_invitees" (
    "id" TEXT NOT NULL,
    "assignationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_invitees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "survey_invitees_token_key" ON "survey_invitees"("token");

-- CreateIndex
CREATE INDEX "survey_invitees_token_idx" ON "survey_invitees"("token");

-- AddForeignKey
ALTER TABLE "survey_assignations" ADD CONSTRAINT "survey_assignations_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_assignations" ADD CONSTRAINT "survey_assignations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_assignations" ADD CONSTRAINT "survey_assignations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_invitees" ADD CONSTRAINT "survey_invitees_assignationId_fkey" FOREIGN KEY ("assignationId") REFERENCES "survey_assignations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
