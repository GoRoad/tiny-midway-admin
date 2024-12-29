-- CreateTable
CREATE TABLE "tool" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "funcName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AIBotTool" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AIBotTool_AB_unique" ON "_AIBotTool"("A", "B");

-- CreateIndex
CREATE INDEX "_AIBotTool_B_index" ON "_AIBotTool"("B");

-- AddForeignKey
ALTER TABLE "_AIBotTool" ADD CONSTRAINT "_AIBotTool_A_fkey" FOREIGN KEY ("A") REFERENCES "ai_bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AIBotTool" ADD CONSTRAINT "_AIBotTool_B_fkey" FOREIGN KEY ("B") REFERENCES "tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
