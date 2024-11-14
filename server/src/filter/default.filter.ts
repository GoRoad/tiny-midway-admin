import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch()
export class DefaultErrorFilter {
  async catch(err: any, ctx: Context) {
    // 所有的未分类错误会到这里
    const code = err.status || err.code;
    // 把code转换成数字类型
    const code2 = +code;
    const msg = err.message;
    console.log('@统一异常捕获处理: ', code, msg);
    // 不拦截下面的code，前端有特殊处理
    const ignore = [401, 403, 500];
    if (ignore.includes(code2)) {
      ctx.status = code2;
      ctx.body = { message: msg };
    } else {
      // 抛出异常信息
      // 前端抛出code不为0或者200的msg信息弹窗
      // 没有具体业务code的错误统一返回1000
      return { code: 1000, error: 'DefaultError', message: msg };
    }
  }
}
