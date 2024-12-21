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
    try {
      const model = await this.model.create({
        data: {
          name: data.name,
          description: data.description,
          prompt: data.prompt,
          useDataSource: data.useDataSource,
          singleChatPrefix: data.singleChatPrefix,
          singleListMode: data.singleListMode,
          singleListId: data.singleListId,
          groupChatPrefix: data.groupChatPrefix,
          groupListMode: data.groupListMode,
          groupListId: data.groupListId,
          // workflow: data.workflowId ? { connect: { id: data.workflowId } } : undefined,
          wx: data.wxId ? { connect: { wxId: data.wxId } } : undefined,
          model: data.modelId ? { connect: { id: data.modelId } } : undefined,
          emModel: data.emModelId
            ? { connect: { id: data.emModelId } }
            : undefined,
        },
      });
      return model;
    } catch (error) {
      if (error.code === 'P2014') throw new Error('此微信已被绑定到其他机器人');
      throw error;
    }
  }

  public async updateOne(where: any, data: any) {
    try {
      const model = await this.model.upsert({ where, update: data, create: data });
      return model;
    } catch (error) {
      if (error.code === 'P2002') throw new Error('此微信已被绑定到其他机器人');
      throw error;
    }
  }
}
