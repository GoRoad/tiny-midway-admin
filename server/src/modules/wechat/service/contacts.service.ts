import { Inject, Provide } from '@midwayjs/core';
import { PrismaClient, AIBot } from '@prisma/client';
import { BaseService } from '../../../core/crud_service';

@Provide()
export class ContactsService extends BaseService<AIBot> {
  @Inject('prisma')
  prismaClient: PrismaClient;

  protected get model() {
    return this.prismaClient.wxContact;
  }
}
