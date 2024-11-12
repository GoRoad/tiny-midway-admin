import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {

  @Get('/')
  async home(): Promise<any> {
    const process = require('process');
    const now = new Date();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const msg = `Hello, MidwayJS + Casbin + Prisma = ❤️`;
    const mem = process.memoryUsage();
    return {
      now,
      timeZone,
      mem,
      msg
    };
  }
}
