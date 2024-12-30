import { Inject, Provide, makeHttpRequest } from '@midwayjs/core';
import { PrismaClient, AIModelConfig } from '@prisma/client';
import { BaseService } from '../../../core/crud_service';

// import { ChatOpenAIFields } from '@langchain/openai';
import { initChatModel } from "langchain/chat_models/universal";

@Provide()
export class AIModelService extends BaseService<AIModelConfig> {
  @Inject('prisma')
  prismaClient: PrismaClient;

  protected get model() {
    return this.prismaClient.aIModelConfig;
  }

  /**
   * openai
   */
  public async getOpenAIModel(id: number):Promise<any> {
    const aiModel = await this.model.findUnique({ where: { id } });
    if (!aiModel) throw new Error('模型未配置!');
    let baseURL = aiModel.baseURL;
    if (aiModel.type === 'openAi') baseURL += '/chat/completions'
    const modelOptions = {
      apiKey: aiModel.apiKey,
      model: aiModel.model,
      modelProvider: 'openai',
      temperature: aiModel.temperature,
      maxTokens: aiModel.maxTokens,
      configuration: {
        baseURL, // 对话模型接口地址
      },
    };
    if (!aiModel.temperature) delete modelOptions.temperature;
    if (!aiModel.maxTokens) delete modelOptions.maxTokens;
    // 创建可变配置模型
    return initChatModel(undefined, modelOptions);
  }

  public async embedding(emModelId: number, text: string) {
    const model = await this.model.findFirst({ where: { id: emModelId } });
    if (!model) throw new Error('向量化模型未配置!');
    let baseURL = model.baseURL
    if (model.type === 'openAi') baseURL += '/embeddings' // 添加embeddings模型请求url
    const options = {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: 'Bearer ' + model.apiKey,
      },
      method: 'POST',
      data: {
        model: model.model,
        input: text,
        encoding_format: 'float'
      },
      dataType: 'json' as "json" | "text",
    };
    const result: any = await makeHttpRequest(baseURL, options);
    return result.data.data[0].embedding;
  }

  public async test(id: number) {
    const model = await this.getOpenAIModel(id);
    const res = await model.invoke('你好');
    return res.content;
  }
}
