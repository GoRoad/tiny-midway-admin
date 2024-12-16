import { Inject, Provide } from '@midwayjs/core';
import { PrismaClient, WxMessage } from '@prisma/client';
import { BaseService } from '../../../core/crud_service';
import { AIModelService } from '../../openai/service/models.service';

@Provide()
export class HistoryService extends BaseService<WxMessage> {
  @Inject('prisma')
  prismaClient: PrismaClient;
  @Inject('prisma')
  aIModelService: AIModelService;

  protected get model() {
    return this.prismaClient.wxMessage;
  }

  // 增强搜索群组历史
  public async getRagGroupHistory(emModelId: number, keyword: string, groupId: string, wxUserId: string, starTtime: string, endTime: string): Promise<any> {
    const arr = await this.aIModelService.embedding(emModelId, keyword);
    const limit = 5;
    const result = await this.prismaClient.$queryRaw`
      SELECT msg.content  FROM "wx_message" msg
      WHERE msg."groupId" = ${groupId}
      ORDER BY documents <-> ${arr}::vector
      LIMIT ${limit};
    `;
    return result;
  }
}
