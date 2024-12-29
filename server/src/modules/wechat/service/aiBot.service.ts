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

  public async create(data: AIBot& { tools?: number[] }): Promise<AIBot> {
    try {
      const model = await this.model.create({
        data: {
          name: data.name,
          description: data.description,
          prompt: data.prompt,
          agentPrompt: data.agentPrompt,
          useDataSource: data.useDataSource,
          useAgent: data.useAgent,
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
          tools: data?.tools?.length ? { connect: data.tools.map(id => ({ id })) } : undefined,
        },
      });
      return model;
    } catch (error) {
      if (error.code === 'P2014') throw new Error('此微信已被绑定到其他机器人');
      throw error;
    }
  }

  public async updateOne(where: any, data:  AIBot& { tools?: number[] }) {
    try {
      const _data = {
        name: data.name,
        description: data.description,
        prompt: data.prompt,
        agentPrompt: data.agentPrompt,
        useDataSource: data.useDataSource,
        useAgent: data.useAgent,
        singleChatPrefix: data.singleChatPrefix,
        singleListMode: data.singleListMode,
        singleListId: data.singleListId,
        groupChatPrefix: data.groupChatPrefix,
        groupListMode: data.groupListMode,
        groupListId: data.groupListId,
        wx: data.wxId ? { connect: { wxId: data.wxId } } : undefined,
        model: data.modelId ? { connect: { id: data.modelId } } : undefined,
        emModel: data.emModelId
          ? { connect: { id: data.emModelId } }
          : undefined,
        tools: data?.tools?.length ? { connect: data.tools.map(id => ({ id })) } : undefined,
      }
      const model = await this.model.upsert({ where, update: _data, create: _data });
      return model;
    } catch (error) {
      if (error.code === 'P2002') throw new Error('此微信已被绑定到其他机器人');
      throw error;
    }
  }
}
