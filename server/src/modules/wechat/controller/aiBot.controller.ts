import { Inject } from '@midwayjs/core';
import { BaseController } from '../../../core/crud_controller';
import { Crud } from '../../../core/crud_decorator';
import { AIBotService } from '../service/aiBot.service';
import { JwtPassportMiddleware } from '../../../middleware/jwt.middleware';

@Crud(
  '/wechat/ai-bot',
  { middleware: [JwtPassportMiddleware], description: '模型管理' },
  {
    apis: ['list', 'page', 'info', 'create', 'update', 'delete'],
  }
)
export class AIBotlController extends BaseController {
  @Inject()
  protected service: AIBotService;

  public async page() {
    const { body } = this.ctx.request as any;
    const { sort = JSON.stringify({ id: 'desc' }), currentPage = 1, pageSize = 20, ...where } = body;
    const filteredWhere = Object.entries(where).reduce((acc, [key, value]) => {
      // 过滤非法值
      const invalidValue = value === undefined || value === null || value === '';
      if (invalidValue) return acc;
      // 判断是否有模糊查询的字段
      if (typeof value === 'string' && value.endsWith('%')) {
        acc[key] = { contains: value.slice(0, -1) };
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
    // 连表查询
    const include = {
      tools: {
        select: {
          id: true,
        },
      },
    }
    const result =  await this.service.findAll(filteredWhere, {
      sort: JSON.parse(sort as string),
      include,
      page: Number(currentPage),
      limit: Number(pageSize),
    });
    // 将 tools 转换为纯数字数组
    result.records.forEach((item: any) => {
      if (item?.tools?.length) item.tools = item.tools.map(tool => tool.id);
    });
    return result;
  }
}
