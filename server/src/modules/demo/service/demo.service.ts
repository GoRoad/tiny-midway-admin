import { Inject, Provide } from '@midwayjs/core';
import { PrismaClient, Demo } from '@prisma/client';
import { BaseService } from '../../../core/crud_service';

@Provide()
export class DemoService extends BaseService<Demo> {
  @Inject('prisma')
  prismaClient: PrismaClient;

  protected get model() {
    return this.prismaClient.demo;
  }

  public async my() {
    return { hello: 'world' };
  }
}
