-- AlterTable
ALTER TABLE "ai_bot" ADD COLUMN     "agentPrompt" TEXT,
ADD COLUMN     "useAgent" BOOLEAN NOT NULL DEFAULT false;
