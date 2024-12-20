// import { BaseChatModel } from "@langchain/core/language_models/base";

export type SearchParam = {
  appId: string;
  llm: any; // openai LLM
  input: string; // 关键字
  groupId: string ;
  sender: string; // wxid
  emModelId: number; // 嵌入模型id
};
