import { Controller, UseGuard, Get, Inject, Query, Param } from '@midwayjs/core';
import { CasbinService } from '../../base/service/casbin.service';
import { AIModelService } from '../../openai/service/models.service';
// import { PrismaClient } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { EnvGuard } from "../../../guard/env";

@Controller('/test') // 只允许本地访问test接口
@UseGuard(EnvGuard)
export class HomeController {
  @Inject()
  casbinService: CasbinService;
  @Inject()
  aIModelService: AIModelService;
  @Inject()
  prisma: PrismaClient;

  @Get('/')
  async index(): Promise<any> {
    const root = process.cwd();
    const dir = __dirname;
    const file = __filename;

    const data = {
      root,
      dir,
      file
    }
    return data;
  }
  // 测试接口
  @Get('/casbin')
  async t_casbin(
    @Query('sub') sub: string,
    @Query('obj') obj: string,
    @Query('act') act: string
  ): Promise<boolean> {
    console.log('sub, obj, act: ', sub, obj, act);
    const isRoot = await this.casbinService.enforcer.hasRoleForUser(sub, 'root');
    const _sub = isRoot ? 'root' : sub;
    return await this.casbinService.enforcer.enforce(_sub, obj, act);
  }
  // 测试接口1
  @Get('/test')
  async test(): Promise<any> {
    // return await this.roleService.getAllRolesAndPlicysByDB('role');
    // 测试查询
    // const res = await this.prisma.user.findMany({
    //   include: {
    //     roles: true
    //   }
    // })
    // return res;

    // return this.prisma.resource.create({
    //   data: {
    //     "name": "子菜单1",
    //     "code": "NewMenu",
    //     "type": "MENU",
    //     "parentId": 2,
    //     "path": "/new-menu",
    //     "icon": "i-fe:grid",
    //     "component": "/src/views/new-menu/index.vue",
    //     "show": true,
    //     "enable": true,
    //     "order": 1
    //   }
    // });
    await this.casbinService.syncAdminLoadAndSave('test', ['admin'], 'guest', ['Base','data6', 'Icon']);
    const access = await this.casbinService.getAdminPlocy();
    const role = await this.casbinService.getAdminGroup();
    return {
      access, role
    };
  }
  @Get('/roles')
  async test1(): Promise<any> {
    const roles = [
      'root', {users: ['u1'], policy: ['Menu','Base']}
    ]
    return roles;
  }

  @Get('/model/:id')
  async publicAPI(@Param('id') id: number, @Query('q') q: string = '你用的模型？') {
    const chat = await this.aIModelService.getOpenAIModel(id);
    const messages = [
      new SystemMessage('要求：中文回复，言简意赅'),
      new HumanMessage(q),
    ];
    const res = await chat.invoke(messages);
    return res.content;
  }
}
