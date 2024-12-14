import { Inject, Provide } from '@midwayjs/core';
import { PrismaClient, WxMessage } from '@prisma/client';
import { BaseService } from '../../../core/crud_service';

@Provide()
export class HistoryService extends BaseService<WxMessage> {
  @Inject('prisma')
  prismaClient: PrismaClient;

  protected get model() { 
    return this.prismaClient.wxMessage;
  }
}
