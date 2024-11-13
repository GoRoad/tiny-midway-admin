import { Inject } from '@midwayjs/core';
import { BaseController } from '../../../core/crud_controller';
import { Crud } from '../../../core/crud_decorator';
import { DemoDto } from '../dto/demo';
import { DemoService } from '../service/demo.service';
import { CasbinGuard } from '../../../guard/casbin';
import { JwtPassportMiddleware } from '../../../middleware/jwt.middleware';

@Crud(
  '/demo/crud',
  { middleware: [JwtPassportMiddleware], description: 'CRUD例子' },
  {
    apis: [
      'list',
      'page',
      'info',
      'create',
      'update',
      'delete'
    ],
    access: [
      'demo:crud:view',
      'demo:crud:view',
      'demo:crud:view',
      'demo:crud:add',
      'demo:crud:edit',
      'demo:crud:remove'
    ],
    dto: { create: DemoDto, update: DemoDto },
    guard: CasbinGuard
  }
)
export class DemoController extends BaseController {
  @Inject()
  protected service: DemoService;
}
