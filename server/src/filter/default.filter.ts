import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch()
export class DefaultErrorFilter {
  async catch(err: any, ctx: Context) {
    const code = err.code || err.status;
    const msg = err.message;
    console.log('@统一异常捕获: ', code, msg);
    // 前端会弹出所有code不为0或者200的返回信息
    // 所有的未分类错误会到这里
    const ignore = [401, 403];
    if (ignore.includes(code)) {
      // 不拦截的错误，直接抛出前端处理
      throw err;
    } else {
      console.log(msg);
      return {
        code,
        error: 'catch error',
        message: msg,
      };
    }
  }
}
