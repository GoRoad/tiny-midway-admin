import { Inject, Provide, makeHttpRequest } from '@midwayjs/core';
import { PrismaClient, AIModelConfig } from '@prisma/client';
import { BaseService } from '../../../core/crud_service';

import { ChatOpenAI, ChatOpenAIFields } from '@langchain/openai';

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
  public async getOpenAIModel(id: number) {
    const aiModel = await this.model.findUnique({ where: { id } });
    const modelOptions: ChatOpenAIFields = {
      apiKey: aiModel.apiKey,
      model: aiModel.model,
      temperature: aiModel.temperature,
      maxTokens: aiModel.maxTokens,
      configuration: {
        baseURL: aiModel.baseURL,
      },
    };
    if (!aiModel.temperature) delete modelOptions.temperature;
    if (!aiModel.maxTokens) delete modelOptions.maxTokens;
    const openai = new ChatOpenAI(modelOptions);
    return openai;
  }

  public async embedding(emModelId: number, text: string) {
    const model = await this.model.findFirst({ where: { id: emModelId } });
    if (!model) throw new Error('向量化模型未配置!');
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
    const result: any = await makeHttpRequest(model.baseURL, options);
    return result.data.data[0].embedding;
  }

  public async test(id: number) {
    const model = await this.getOpenAIModel(id);
    const res = await model.invoke('hi');
    return res.content;
  }
}
