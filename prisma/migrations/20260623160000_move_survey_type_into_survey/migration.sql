-- Add config columns to surveys
ALTER TABLE "surveys" ADD COLUMN "categoryName" TEXT;
ALTER TABLE "surveys" ADD COLUMN "subcategoryName" TEXT;
ALTER TABLE "surveys" ADD COLUMN "hasCategories" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "surveys" ADD COLUMN "hasSubcategories" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "surveys" ADD COLUMN "visibleCategories" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "surveys" ADD COLUMN "visibleSubcategories" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "surveys" ADD COLUMN "randomizeQuestions" BOOLEAN NOT NULL DEFAULT false;

-- Backfill from survey_types
UPDATE "surveys" s
SET
  "categoryName" = st."categoryName",
  "subcategoryName" = st."subcategoryName",
  "hasCategories" = st."hasCategories",
  "hasSubcategories" = st."hasSubcategories",
  "visibleCategories" = st."visibleCategories",
  "visibleSubcategories" = st."visibleSubcategories",
  "randomizeQuestions" = st."randomizeQuestions"
FROM "survey_types" st
WHERE s."surveyTypeId" = st."id";

-- Drop FK and surveyTypeId column
ALTER TABLE "surveys" DROP CONSTRAINT "surveys_surveyTypeId_fkey";
ALTER TABLE "surveys" DROP COLUMN "surveyTypeId";

-- Drop survey_types table
ALTER TABLE "survey_types" DROP CONSTRAINT "survey_types_createdById_fkey";
DROP TABLE "survey_types";
