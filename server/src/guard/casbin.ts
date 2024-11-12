import { Inject, Guard, IGuard, Config, getPropertyMetadata } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { CasbinService } from '../modules/base/service/casbin.service';
import { PrismaClient } from '@prisma/client';
import { ACCESS_META_KEY } from '../decorator/access';

export enum RuleAction {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum RulePossession {
  ANY = 'any',
  OWN = 'own',
  'ANY|OWN' = 'any|own',
}

export enum RuleResource {
  PROJECT_DATA = 'project_obj',
  SHCEMA_DATA = 'shcema_obj',
  USER_DATA = 'user_obj',
  COMMON_DATA = 'common_obj',
}

export type RuleOptions = {
  isEnabled: boolean;
  resource: RuleResource;
  action: RuleAction;
  possession: RulePossession;
  isOwn: ((ctx: any) => boolean) | ((ctx: any) => Promise<boolean>);
};

@Guard()
export class CasbinGuard implements IGuard<Context> {
  @Config('casbin')
  casbinConfig;

  @Inject()
  casbinService: CasbinService;
  @Inject('prisma')
  prismaClient: PrismaClient;

  async canActivate(
    ctx: Context, supplierClz, methodName: string
  ): Promise<boolean> {
    const act = 'access';
    const code = getPropertyMetadata<string[]>(ACCESS_META_KEY, supplierClz, methodName);
    // 缺少信息的直接403
    const username = ctx.state?.user?.username;
    // TODO: 扩展，暂不支持多个角色，未登录用户给予guest权限
    const role = username ? username : 'guest';
    return await this.casbinService.enforcer.enforce(
      role, // 角色
      code, // 权限
      act, // 操作
    );
  }
}
