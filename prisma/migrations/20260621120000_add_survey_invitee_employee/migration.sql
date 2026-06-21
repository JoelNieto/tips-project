-- AlterTable
ALTER TABLE "survey_invitees" ADD COLUMN "employeeId" TEXT;

-- CreateIndex
CREATE INDEX "survey_invitees_employeeId_idx" ON "survey_invitees"("employeeId");

-- AddForeignKey
ALTER TABLE "survey_invitees" ADD CONSTRAINT "survey_invitees_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
