-- 设置 vector
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "casbin_rule" (
    "id" SERIAL NOT NULL,
    "ptype" TEXT NOT NULL,
    "v0" TEXT,
    "v1" TEXT,
    "v2" TEXT,
    "v3" TEXT,
    "v4" TEXT,
    "v5" TEXT,

    CONSTRAINT "casbin_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "nickName" TEXT NOT NULL,
    "address" TEXT,
    "system" BOOLEAN DEFAULT false,
    "passwordVersion" INTEGER NOT NULL DEFAULT 1,
    "gender" INTEGER,
    "avatar" TEXT DEFAULT 'https://s1.imagehub.cc/images/2024/10/22/d99f96eaf4ec45e7b2f5eb19c66303d6.gif',
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demo" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "gender" INTEGER NOT NULL,
    "desc" TEXT,
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parent_id" INTEGER,
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "system" BOOLEAN DEFAULT false,
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MENU',
    "parent_id" INTEGER,
    "path" TEXT,
    "redirect" TEXT,
    "icon" TEXT,
    "component" TEXT,
    "layout" TEXT,
    "keepAlive" BOOLEAN,
    "method" TEXT,
    "description" TEXT,
    "show" BOOLEAN NOT NULL DEFAULT true,
    "enable" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dict" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "json" TEXT NOT NULL,
    "remark" TEXT,
    "enabled" BOOLEAN NOT NULL,
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL,
    "system" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "file_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL DEFAULT 1,
    "source" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "remark" TEXT,
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_model_config" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "maxTokens" INTEGER,
    "baseURL" TEXT NOT NULL,
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_model_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wx_user" (
    "id" SERIAL NOT NULL,
    "alias" TEXT,
    "mobile" TEXT,
    "nickName" TEXT,
    "headImgUrl" TEXT,
    "uin" INTEGER,
    "status" INTEGER NOT NULL,
    "wxId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "loginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wx_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gewe_config" (
    "id" INTEGER NOT NULL,
    "baseAPI" TEXT NOT NULL,
    "fileAPI" TEXT NOT NULL,
    "tinyAPI" TEXT NOT NULL,
    "CheckAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gewe_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_bot" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "prompt" TEXT,
    "plugins" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "useDataSource" BOOLEAN,
    "dataSource" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" INTEGER,
    "wxId" INTEGER,

    CONSTRAINT "ai_bot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "prompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wx_contact" (
    "id" VARCHAR(50) NOT NULL,
    "nickName" VARCHAR(50),
    "pyInitial" VARCHAR(50),
    "sex" INTEGER,
    "bigHeadImgUrl" TEXT,
    "smallHeadImgUrl" TEXT,
    "country" VARCHAR(20),
    "province" VARCHAR(20),
    "city" VARCHAR(20),
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wx_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wx_group" (
    "id" VARCHAR(50) NOT NULL,
    "nickName" VARCHAR(50),
    "pyInitial" VARCHAR(50),
    "chatRoomNotify" INTEGER,
    "chatRoomOwner" VARCHAR(50),
    "smallHeadImgUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wx_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wx_message" (
    "id" TEXT NOT NULL,
    "appId" VARCHAR(50) NOT NULL,
    "wxId" VARCHAR(50) NOT NULL,
    "groupId" VARCHAR(50),
    "type" INTEGER NOT NULL,
    "fromId" VARCHAR(50) NOT NULL,
    "toId" VARCHAR(50) NOT NULL,
    "content" TEXT NOT NULL,
    "documents" vector,
    "pushContent" TEXT,
    "postTime" TIMESTAMP(3) NOT NULL,
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wx_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DepartmentRole" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_UserGroups" (
    "A" VARCHAR(50) NOT NULL,
    "B" VARCHAR(50) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "resource_code_key" ON "resource"("code");

-- CreateIndex
CREATE UNIQUE INDEX "file_category_name_key" ON "file_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ai_model_config_name_key" ON "ai_model_config"("name");

-- CreateIndex
CREATE UNIQUE INDEX "wx_user_wxId_key" ON "wx_user"("wxId");

-- CreateIndex
CREATE INDEX "wx_message_wxId_idx" ON "wx_message"("wxId");

-- CreateIndex
CREATE INDEX "wx_message_fromId_idx" ON "wx_message"("fromId");

-- CreateIndex
CREATE UNIQUE INDEX "_DepartmentRole_AB_unique" ON "_DepartmentRole"("A", "B");

-- CreateIndex
CREATE INDEX "_DepartmentRole_B_index" ON "_DepartmentRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserGroups_AB_unique" ON "_UserGroups"("A", "B");

-- CreateIndex
CREATE INDEX "_UserGroups_B_index" ON "_UserGroups"("B");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource" ADD CONSTRAINT "resource_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "file_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_bot" ADD CONSTRAINT "ai_bot_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_bot" ADD CONSTRAINT "ai_bot_wxId_fkey" FOREIGN KEY ("wxId") REFERENCES "wx_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wx_message" ADD CONSTRAINT "wx_message_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "wx_contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wx_message" ADD CONSTRAINT "wx_message_toId_fkey" FOREIGN KEY ("toId") REFERENCES "wx_contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wx_message" ADD CONSTRAINT "wx_message_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "wx_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepartmentRole" ADD CONSTRAINT "_DepartmentRole_A_fkey" FOREIGN KEY ("A") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepartmentRole" ADD CONSTRAINT "_DepartmentRole_B_fkey" FOREIGN KEY ("B") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserGroups" ADD CONSTRAINT "_UserGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "wx_contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserGroups" ADD CONSTRAINT "_UserGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "wx_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
