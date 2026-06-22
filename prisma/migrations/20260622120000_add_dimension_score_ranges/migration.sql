-- CreateTable
CREATE TABLE "dimension_score_ranges" (
    "id" TEXT NOT NULL,
    "dimensionId" TEXT NOT NULL,
    "label" TEXT,
    "message" TEXT NOT NULL,
    "minValue" DOUBLE PRECISION NOT NULL,
    "maxValue" DOUBLE PRECISION NOT NULL,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dimension_score_ranges_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dimension_score_ranges" ADD CONSTRAINT "dimension_score_ranges_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "dimensions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
