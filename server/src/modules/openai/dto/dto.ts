import { LanguageModelLike } from "@langchain/core/language_models/base";

export type SearchParam = {
  appId: string;
  llm: LanguageModelLike; // openai LLM
  input: string; // 关键字
  groupId: string ;
  sender: string; // wxid
  emModelId: number; // 嵌入模型id
};
