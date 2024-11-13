import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch()
export class DefaultErrorFilter {
  async catch(err: any, ctx: Context) {
    // 所有的未分类错误会到这里
    const code = +(err.code || err.status || 500);
    const msg = err.message;
    console.log('@统一异常捕获处理: ', code, msg);
    // 不拦截下面的code，直接抛出http状态码让前端处理
    const ignore = [401, 403];
    if (ignore.includes(code)) {
      ctx.status = code;
      ctx.body = err;
    } else {
      // 前端会弹出所有code不为0或者200的msg信息
      return { code, error: 'DefaultErrorFilter', message: msg };
    }
  }
}
