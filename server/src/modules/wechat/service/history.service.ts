import { Inject, Provide } from '@midwayjs/core';
import { PrismaClient, WxMessage } from '@prisma/client';
import { BaseService } from '../../../core/crud_service';
import { AIModelService } from '../../openai/service/models.service';

@Provide()
export class HistoryService extends BaseService<WxMessage> {
  @Inject('prisma')
  prisma: PrismaClient;
  @Inject()
  aIModelService: AIModelService;

  protected get model() {
    return this.prisma.wxMessage;
  }

  // 增强搜索群组历史
  public async getRagGroupHistory(emModelId: number, keyword: string, groupId: string, wxUserId: string, starTtime: string, endTime: string): Promise<any> {
    const arr = await this.aIModelService.embedding(emModelId, keyword);
    const start = new Date(starTtime);
    const end = new Date(endTime);
    const limit = 10;
    const result = await this.prisma.$queryRaw`
      SELECT 
        "msg"."groupId",
        "msg"."postTime",
        "msg"."content",
        "sender"."nickName" AS "sender_nickName",
        "sender"."id" AS "sender_id",
        "receiver"."nickName" AS "receiver_nickName",
        "receiver"."id" AS "receiver_id"
      FROM 
        "wx_message" "msg"
      LEFT JOIN 
        "wx_contact" "sender" ON "msg"."fromId" = "sender"."id"
      LEFT JOIN 
        "wx_contact" "receiver" ON "msg"."toId" = "receiver"."id"
      WHERE 
        "msg"."fromId" = ${wxUserId}
        AND "msg"."groupId" = ${groupId}
        AND "msg"."postTime" BETWEEN ${start} AND ${end}
      ORDER BY documents <-> ${arr}::vector
      LIMIT ${limit};
    `;
    return result;
  }
}
