-- CreateTable
CREATE TABLE "survey_fills" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_fills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_fill_main_answers" (
    "id" TEXT NOT NULL,
    "fillId" TEXT NOT NULL,
    "dimensionId" TEXT NOT NULL,
    "mainQuestionAnswerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_fill_main_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_fill_question_answers" (
    "id" TEXT NOT NULL,
    "fillId" TEXT NOT NULL,
    "dimensionQuestionId" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_fill_question_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "survey_fills_inviteeId_key" ON "survey_fills"("inviteeId");

-- CreateIndex
CREATE INDEX "survey_fills_surveyId_idx" ON "survey_fills"("surveyId");

-- CreateIndex
CREATE UNIQUE INDEX "survey_fill_main_answers_fillId_dimensionId_key" ON "survey_fill_main_answers"("fillId", "dimensionId");

-- CreateIndex
CREATE UNIQUE INDEX "survey_fill_question_answers_fillId_dimensionQuestionId_answerId_key" ON "survey_fill_question_answers"("fillId", "dimensionQuestionId", "answerId");

-- AddForeignKey
ALTER TABLE "survey_fills" ADD CONSTRAINT "survey_fills_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_fills" ADD CONSTRAINT "survey_fills_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "survey_invitees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_fill_main_answers" ADD CONSTRAINT "survey_fill_main_answers_fillId_fkey" FOREIGN KEY ("fillId") REFERENCES "survey_fills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_fill_main_answers" ADD CONSTRAINT "survey_fill_main_answers_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "dimensions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_fill_main_answers" ADD CONSTRAINT "survey_fill_main_answers_mainQuestionAnswerId_fkey" FOREIGN KEY ("mainQuestionAnswerId") REFERENCES "main_question_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_fill_question_answers" ADD CONSTRAINT "survey_fill_question_answers_fillId_fkey" FOREIGN KEY ("fillId") REFERENCES "survey_fills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_fill_question_answers" ADD CONSTRAINT "survey_fill_question_answers_dimensionQuestionId_fkey" FOREIGN KEY ("dimensionQuestionId") REFERENCES "dimension_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_fill_question_answers" ADD CONSTRAINT "survey_fill_question_answers_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
