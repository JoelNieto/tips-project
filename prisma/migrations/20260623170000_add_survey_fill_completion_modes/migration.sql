-- AlterTable
ALTER TABLE "surveys" ADD COLUMN "presentAllQuestionsAtOnce" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "surveys" ADD COLUMN "allowPreviousQuestion" BOOLEAN NOT NULL DEFAULT false;
