import { Inject, Controller, Get, Post, Body } from '@midwayjs/core';
import { WxMessageService } from '../../wxbot/service/wxMessage.service';
import { GeweMessage } from '../../wxbot/dto/IMessage';
import { Message } from '../../wxbot/class/message.class';

@Controller('/')
export class HomeController {
  @Inject()
  wxMessageService: WxMessageService;

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
      msg,
    };
  }

  @Post('/wxBot/Callback')
  async wxBotCallback(@Body() data: GeweMessage): Promise<any> {
    // 包装一下消息体，方便开发
    const msg = new Message(data);
    if (data.TypeName === 'AddMsg') {
      await this.wxMessageService.handleMessage(msg);
    }
    // 掉线消息
    if (data.TypeName === 'Offline') {
      console.log('@账号掉线', data);
    }
    return { success: true, message: 'OK' };
  }
}
