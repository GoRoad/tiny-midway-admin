import { Provide, Inject } from '@midwayjs/core';
import { GeweService } from './gewe.service';
import { AIModelService } from '../../openai/service/models.service';

import { Message } from '../class/message.class';

import { PrismaClient } from '@prisma/client';
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

@Provide()
export class WxMessageService {
  @Inject('prisma')
  prisma: PrismaClient;
  @Inject()
  geweService: GeweService;
  @Inject()
  aIModelService: AIModelService;

  async sendMsg(
    appId: string,
    toWxid: string,
    content: string,
    ats: string = ''
  ) {
    const params = { appId, toWxid, ats, content };
    const url = '/message/postText';
    const result = await this.geweService.post(url, params);
    return result.data;
  }

  async handleTextMsg(msg: Message) {
    const text = msg.text();
    const aiBot = await this.prisma.aIBot.findFirst({
      where: {
        wx: {
          wxId: msg.wxid,
        },
      },
    });
    const messages = [
      new SystemMessage(aiBot.prompt),
      new HumanMessage(text),
    ];
    
    if (msg.isRoom) {
      if (text.startsWith('ai ')) {
        // this.sendMsg(msg.appid, msg.fromId, '你好，我是智能助手.')
        const chat = await this.aIModelService.getOpenAIModel(3);
        const res = await chat.invoke(messages);
        this.sendMsg(msg.appid, msg.fromId, res.content.toString());
      }
    } else if (!msg._self) {
      // this.sendMsg(msg.appid, msg.fromId, '你好，我是你的私人智能助手.')
      const chat = await this.aIModelService.getOpenAIModel(1);
      const res = await chat.invoke(messages);
      this.sendMsg(msg.appid, msg.fromId, res.content.toString());
    }
  }

  async handleMessage(msg: Message) {
    console.log('@调试消息体: ', msg);
    console.log('@调试消息体 info: ', msg.type(), msg.text());
    const type = msg.type();
    if (type === 'text') this.handleTextMsg(msg);
  }
}
