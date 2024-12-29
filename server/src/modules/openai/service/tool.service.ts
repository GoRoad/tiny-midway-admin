import { Inject, Provide } from '@midwayjs/core';
import { PrismaClient, Tool } from '@prisma/client';
import { BaseService } from '../../../core/crud_service';

@Provide()
export class AIToolService extends BaseService<Tool> {
  @Inject('prisma')
  prismaClient: PrismaClient;

  protected get model() {
    return this.prismaClient.tool;
  }
}
