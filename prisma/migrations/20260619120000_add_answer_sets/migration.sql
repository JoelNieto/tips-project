-- CreateTable
CREATE TABLE "answer_sets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "answer_sets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "answer_sets" ADD CONSTRAINT "answer_sets_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "questions" ADD COLUMN "answerSetId" TEXT;

-- AlterTable
ALTER TABLE "answers" ADD COLUMN "answerSetId" TEXT;

-- Migrate existing question answers into answer sets
CREATE TEMP TABLE "question_answer_set_map" (
    "question_id" TEXT NOT NULL,
    "set_id" TEXT NOT NULL,
    CONSTRAINT "question_answer_set_map_pkey" PRIMARY KEY ("question_id")
);

INSERT INTO "question_answer_set_map" ("question_id", "set_id")
SELECT q."id", gen_random_uuid()::text
FROM "questions" q
WHERE EXISTS (
    SELECT 1 FROM "answers" a WHERE a."questionId" = q."id"
);

INSERT INTO "answer_sets" ("id", "name", "description", "createdAt", "updatedAt", "createdById")
SELECT m."set_id", q."title", NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, q."createdById"
FROM "question_answer_set_map" m
INNER JOIN "questions" q ON q."id" = m."question_id";

UPDATE "questions" q
SET "answerSetId" = m."set_id"
FROM "question_answer_set_map" m
WHERE q."id" = m."question_id";

UPDATE "answers" a
SET "answerSetId" = m."set_id"
FROM "question_answer_set_map" m
WHERE a."questionId" = m."question_id";

DROP TABLE "question_answer_set_map";

-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_questionId_fkey";

-- AlterTable
ALTER TABLE "answers" DROP COLUMN "questionId";

-- AlterTable
ALTER TABLE "answers" ALTER COLUMN "answerSetId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_answerSetId_fkey" FOREIGN KEY ("answerSetId") REFERENCES "answer_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_answerSetId_fkey" FOREIGN KEY ("answerSetId") REFERENCES "answer_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
