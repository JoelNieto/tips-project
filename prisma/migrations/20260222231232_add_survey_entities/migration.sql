-- CreateTable
CREATE TABLE "surveys" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "surveyTypeId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dimensions" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "parentDimensionId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "weighting" DOUBLE PRECISION,
    "mainQuestionText" TEXT,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dimensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_question_answers" (
    "id" TEXT NOT NULL,
    "dimensionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER,
    "value" DOUBLE PRECISION NOT NULL,
    "reverseValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "main_question_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "weight" DOUBLE PRECISION,
    "isReversed" BOOLEAN NOT NULL DEFAULT false,
    "isMultiAnswer" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER,
    "value" DOUBLE PRECISION NOT NULL,
    "reverseValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dimension_questions" (
    "id" TEXT NOT NULL,
    "dimensionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER,
    "weightOverride" DOUBLE PRECISION,
    "isReversedOverride" BOOLEAN,
    "isMultiAnswerOverride" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dimension_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dimension_question_answers" (
    "id" TEXT NOT NULL,
    "dimensionQuestionId" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "valueOverride" DOUBLE PRECISION,
    "reverseValueOverride" DOUBLE PRECISION,
    "orderOverride" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dimension_question_answers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_surveyTypeId_fkey" FOREIGN KEY ("surveyTypeId") REFERENCES "survey_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dimensions" ADD CONSTRAINT "dimensions_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dimensions" ADD CONSTRAINT "dimensions_parentDimensionId_fkey" FOREIGN KEY ("parentDimensionId") REFERENCES "dimensions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main_question_answers" ADD CONSTRAINT "main_question_answers_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "dimensions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dimension_questions" ADD CONSTRAINT "dimension_questions_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "dimensions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dimension_questions" ADD CONSTRAINT "dimension_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dimension_question_answers" ADD CONSTRAINT "dimension_question_answers_dimensionQuestionId_fkey" FOREIGN KEY ("dimensionQuestionId") REFERENCES "dimension_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dimension_question_answers" ADD CONSTRAINT "dimension_question_answers_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
