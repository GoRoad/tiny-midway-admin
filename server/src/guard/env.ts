import { Guard, IGuard, App } from '@midwayjs/core';
import { Context, Application } from '@midwayjs/koa';

// 只允许本地访问test接口
@Guard()
export class EnvGuard implements IGuard<Context> {
  @App()
  app: Application;

//   @Config()
//   config;

  async canActivate(ctx: Context, supplierClz, methodName: string): Promise<boolean> {
    return this.app.getEnv() === 'local';
  }
}
