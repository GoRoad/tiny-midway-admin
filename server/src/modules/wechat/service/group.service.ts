import { Inject, Provide } from '@midwayjs/core';
import { PrismaClient, WxGroup } from '@prisma/client';
import { BaseService } from '../../../core/crud_service';

@Provide()
export class GropuService extends BaseService<WxGroup> {
  @Inject('prisma')
  prismaClient: PrismaClient;

  protected get model() {
    return this.prismaClient.wxGroup;
  }

  public async getChatroomMemberList(id: string): Promise<any> {
    return this.model.findFirst({
      where: { id },
      include: {
        contacts: true,
      },
    });
  }
}
