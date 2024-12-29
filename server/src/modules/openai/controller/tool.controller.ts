import { Inject } from '@midwayjs/core';
import { BaseController } from '../../../core/crud_controller';
import { Crud } from '../../../core/crud_decorator';
import { DemoDto } from '../dto/models';
import { AIToolService } from '../service/tool.service';
import { JwtPassportMiddleware } from '../../../middleware/jwt.middleware';

@Crud(
  '/openai/tool',
  { middleware: [JwtPassportMiddleware], description: '模型管理' },
  {
    apis: ['list', 'page', 'info', 'create', 'update', 'delete'],
    dto: { create: DemoDto, update: DemoDto },
  }
)
export class AIModelController extends BaseController {
  @Inject()
  protected service: AIToolService;
}
