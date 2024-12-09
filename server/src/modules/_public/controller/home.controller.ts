import { Inject, Controller, Get, Post, Body } from '@midwayjs/core';
import { WxMessageService } from '../../wxbot/service/wxMessage.service';

@Controller('/')
export class HomeController {
  @Inject()
  wxMessageService: WxMessageService

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

  @Post('/wxBot/Callback')
  async wxBotCallback(@Body() data: any): Promise<any> {
    if (data.TypeName === 'AddMsg') {
      await this.wxMessageService.handleMessage(data);
    }
    // 掉线消息
    if (data.TypeName === 'Offline') {
      console.log('@账号掉线', data);
    }
    return { success: true, message: 'OK' };
  }
}
