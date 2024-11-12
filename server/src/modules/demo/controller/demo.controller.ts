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
    apis: ['list', 'page', 'info', 'create', 'update', 'delete'],
    dto: { create: DemoDto, update: DemoDto },
    access: ['CrudDemo', 'CrudDemo', 'CrudDemo', 'CrudDemo', 'CrudDemo', 'CrudDemo'],
    guard: CasbinGuard
  }
)
export class DemoController extends BaseController {
  @Inject()
  protected service: DemoService;
}
