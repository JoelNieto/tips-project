-- CreateTable
CREATE TABLE "survey_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "categoryName" TEXT,
    "subcategoryName" TEXT,
    "hasCategories" BOOLEAN NOT NULL DEFAULT false,
    "hasSubcategories" BOOLEAN NOT NULL DEFAULT false,
    "visibleCategories" BOOLEAN NOT NULL DEFAULT false,
    "visibleSubcategories" BOOLEAN NOT NULL DEFAULT false,
    "randomizeQuestions" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "survey_types_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "survey_types" ADD CONSTRAINT "survey_types_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
