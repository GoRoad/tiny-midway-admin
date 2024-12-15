/*
  Warnings:

  - A unique constraint covering the columns `[wxId]` on the table `ai_bot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[modelId]` on the table `ai_bot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emModelId]` on the table `ai_bot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `modelId` to the `ai_bot` table without a default value. This is not possible if the table is not empty.
  - Made the column `wxId` on table `ai_bot` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ai_bot" DROP CONSTRAINT "ai_bot_wxId_fkey";

-- AlterTable
ALTER TABLE "ai_bot" ADD COLUMN     "emModelId" INTEGER,
ADD COLUMN     "modelId" INTEGER NOT NULL,
ALTER COLUMN "wxId" SET NOT NULL,
ALTER COLUMN "wxId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ai_bot_wxId_key" ON "ai_bot"("wxId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_bot_modelId_key" ON "ai_bot"("modelId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_bot_emModelId_key" ON "ai_bot"("emModelId");

-- AddForeignKey
ALTER TABLE "ai_bot" ADD CONSTRAINT "ai_bot_wxId_fkey" FOREIGN KEY ("wxId") REFERENCES "wx_user"("wxId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_bot" ADD CONSTRAINT "ai_bot_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ai_model_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_bot" ADD CONSTRAINT "ai_bot_emModelId_fkey" FOREIGN KEY ("emModelId") REFERENCES "ai_model_config"("id") ON DELETE SET NULL ON UPDATE CASCADE;
