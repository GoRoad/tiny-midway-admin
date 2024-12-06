import { Inject, Provide } from '@midwayjs/core';
import { PrismaClient, AIModelConfig } from '@prisma/client';
import { BaseService } from '../../../core/crud_service';

// import { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import { ChatOpenAI } from '@langchain/openai';

@Provide()
export class AIModelService extends BaseService<AIModelConfig> {
  @Inject('prisma')
  prismaClient: PrismaClient;

  protected get model() {
    return this.prismaClient.aIModelConfig;
  }

  public async test(name: string) {
    const aiModel = await this.model.findUnique({ where: { name } });
    const modelOptions = {
      apiKey: aiModel.apiKey,
      model: aiModel.model,
      configuration: {
        baseURL: aiModel.baseURL,
      },
    } as any;
    if (aiModel.temperature) modelOptions.temperature = aiModel.temperature;
    if (aiModel.maxTokens) modelOptions.maxTokens = aiModel.maxTokens;
    const openai = new ChatOpenAI(modelOptions);
    const res = await openai.invoke('你好')
    return res.content;
  }
}
