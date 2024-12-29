// import { BaseChatModel } from "@langchain/core/language_models/base";
import { AIBot } from 'prisma/prisma-client';

export type SearchParam = {
  appId: string;
  llm: any; // openai LLM
  input: string; // 关键字
  groupId: string;
  sender: string; // wxid
  aiBot: AIBot & {
    tools: {
      name: string;
      id: number;
      funcName: string;
      description: string;
      code: string;
      permissions: string[];
      createdAt: Date;
      updatedAt: Date;
    }[];
  }; // 机器人配置
};
