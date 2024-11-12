import { IMidwayContainer, Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { join } from 'path';
import { DefaultErrorFilter } from './filter/default.filter';
import { NotFoundFilter } from './filter/notfound.filter';
import { ReportMiddleware } from './middleware/report.middleware';
import * as staticFile from '@midwayjs/static-file';
// prisma数据库客户端
import { PrismaClient } from '@prisma/client';
import * as jwt from '@midwayjs/jwt';
import * as passport from '@midwayjs/passport';
import * as captcha from '@midwayjs/captcha';
import * as busboy from '@midwayjs/busboy';
import * as swagger from '@midwayjs/swagger';

@Configuration({
  imports: [
    koa,
    validate,
    jwt,
    passport,
    captcha,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
    {
      component: swagger,
      enabledEnvironment: ['local']
    },
    busboy,
    staticFile
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  async onReady(applicationContext: IMidwayContainer) {
    // 全局格式处理中间件
    this.app.useMiddleware([ReportMiddleware]);
    // 全局错误处理过滤器
    this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
    // 数据库客户端
    const prisma = new PrismaClient();
    try {
      await prisma.$connect();
      // 注册数据库客户端到ioc容器
      applicationContext.registerObject('prisma', prisma);
    } catch (error) {
      await prisma.$disconnect();
      // this.logger.error(error);
      // 异常退出程序
      process.exit(1);
      // throw new Error('db connect error!');
    }
  }
}
