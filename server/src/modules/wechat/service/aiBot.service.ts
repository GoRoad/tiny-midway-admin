import { Inject, Provide } from '@midwayjs/core';
import { PrismaClient, AIBot } from '@prisma/client';
import { BaseService } from '../../../core/crud_service';

// import * as _ from "lodash";
@Provide()
export class AIBotService extends BaseService<AIBot> {
  @Inject('prisma')
  prismaClient: PrismaClient;

  protected get model() {
    return this.prismaClient.aIBot;
  }

  public async create(data: AIBot): Promise<AIBot> {
    const model = await this.model.create({ 
      data: {
        name: data.name,
        description: data.name,
        prompt: data.name,
        useDataSource: data.useDataSource,
        // workflow: data.workflowId ? { connect: { id: data.workflowId } } : undefined,
        wx: data.wxId ? { connect: { wxId: data.wxId }}: undefined,
        model: data.modelId ? { connect: { id: data.modelId }}: undefined,
        emModel: data.emModelId ? { connect: { id: data.emModelId }}: undefined,
      } 
    });
    return model;
  }
}
