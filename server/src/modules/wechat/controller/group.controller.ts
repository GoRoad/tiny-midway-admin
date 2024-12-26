import { Inject, Post, Body } from '@midwayjs/core';
import { BaseController } from '../../../core/crud_controller';
import { Crud } from '../../../core/crud_decorator';
import { GropuService } from '../service/group.service';
import { JwtPassportMiddleware } from '../../../middleware/jwt.middleware';

@Crud(
  '/wechat/group',
  { middleware: [JwtPassportMiddleware], description: '模型管理' },
  {
    apis: ['list', 'page', 'info', 'create', 'update', 'delete'],
  }
)
export class GropuController extends BaseController {
  @Inject()
  protected service: GropuService;

  @Post('/getChatroomMemberList')
  public async getChatroomMemberList(@Body('id') id: string) {
    return this.service.getChatroomMemberList(id);
  }
}
