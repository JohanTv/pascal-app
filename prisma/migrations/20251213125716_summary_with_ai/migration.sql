-- AlterTable
ALTER TABLE "conversation" ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "aiTags" TEXT[] DEFAULT ARRAY[]::TEXT[];
