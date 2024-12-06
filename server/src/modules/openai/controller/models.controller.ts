import { Inject, Get, Query } from '@midwayjs/core';
import { BaseController } from '../../../core/crud_controller';
import { Crud } from '../../../core/crud_decorator';
import { DemoDto } from '../dto/models';
import { AIModelService } from '../service/models.service';
// import { CasbinGuard } from '../../../guard/casbin';
import { JwtPassportMiddleware } from '../../../middleware/jwt.middleware';

// import { HumanMessage, SystemMessage } from "@langchain/core/messages";

@Crud(
  '/openai/model',
  { middleware: [JwtPassportMiddleware], description: '模型管理' },
  {
    apis: [
      'list',
      'page',
      'info',
      'create',
      'update',
      'delete',
    ],
    // access: [],
    dto: { create: DemoDto, update: DemoDto },
    // guard: CasbinGuard
  }
)
export class DemoController extends BaseController {
  @Inject()
  protected service: AIModelService;

  // 测试AI模型联通性
  @Get('/test')
  async testAi(@Query('modelName') modelName: string) {
    // 自定义逻辑
    // const openai = await this.service.my();
    // const messages = [
    //   new SystemMessage("翻译下面的句子成中文"),
    //   new HumanMessage("君の日本語本当上手."),
    // ];
    // const res = await openai.invoke(messages);
    // return res.content;
    // const llm = await openai.invoke('翻译下面的句子成中文:君の日本語本当上手.');
    // return llm.content;
    return this.service.test(modelName);
  }
}
