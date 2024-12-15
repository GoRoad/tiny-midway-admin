-- AlterTable
ALTER TABLE "ai_model_config" ADD COLUMN     "subType" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
