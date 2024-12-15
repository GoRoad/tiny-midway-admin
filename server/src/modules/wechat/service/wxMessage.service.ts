import { Provide, Inject } from '@midwayjs/core';
import { GeweService } from './gewe.service';
import { AIModelService } from '../../openai/service/models.service';

import { Message } from '../class/message.class';

import { PrismaClient } from '@prisma/client';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import * as _ from 'lodash';

type OmitPrismaClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">

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
    this.saveChatHistory(msg);
    const text = msg.text();
    const aiBot = await this.prisma.aIBot.findFirst({
      where: {
        wx: {
          wxId: msg.wxid,
        },
      },
    });
    const messages = [new SystemMessage(aiBot?.prompt || ''), new HumanMessage(text)];
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
    // console.log('@调试消息体: ', msg);
    // console.log('@调试消息体 info: ', msg.type(), msg.text());
    const type = msg.type();
    if (type === 'text') this.handleTextMsg(msg);
  }

  async saveChatHistory(msg: Message) {
    const type = msg.type();
    if (type !== 'text') throw new Error('不能处理这类消息！');
    const isRoom = msg.isRoom;
    const isSendRoom = msg.isSendRoom;
    if (type === 'text') {
      const text = msg._text;
      const data = {
        id: msg._newMsgId + '',
        appId: msg.appid,
        wxId: msg.wxid,
        type: msg._type,
        fromId: msg.fromId,
        toId: msg.toId,
        content: msg.text(),
        pushContent: msg._pushContent,
        postTime: new Date(),
      } as any;

      if (isRoom) {
        data.groupId = msg.fromId;
        const [_fromId] = text.split(':');
        data.fromId = _fromId;
      } else if (isSendRoom) {
        // 自己发群里的信息，收信人改为自己
        data.groupId = msg.toId;
        data.toId = msg.fromId;
      } else {
        data.fromId = msg.fromId;
      }
      // console.log('@调试', msg, data);
      // 企业微信无法获取信息
      if (data.fromId.endsWith('@openim')) return console.log('企微无法获取信息')
      try {
        const store = await this.prisma.$transaction(async client => {
          // 检查发信人、收信人是否存在，否则自动入库
          await this.addContactsIfMiss(data.appId, [data.fromId, data.toId], client, data.groupId);
          // 检查群数据是否存在，否则自动入库
          if (data.groupId) await this.addGroupIfMiss(msg.appid, [data.groupId], client);
          // 入库
          return await client.wxMessage.create({ data });
        });
        const res = await this.addEmbeddingText(store.id, store.content)
        console.log('@入库成功: ', store.pushContent, res);
      } catch (error) {
        console.error(error);
      }
    }
  }

  // 向量化入库
  async addEmbeddingText(id: string, content: string) {
    const embeddingArr = await this.aIModelService.embedding(content);
    const tableName = 'wx_message'
    const query = `
          UPDATE "${tableName}"
          SET documents = $1::vector
          WHERE id = $2;
      `;
    // 使用参数化查询避免 SQL 注入
    const res = await this.prisma.$executeRawUnsafe(query, embeddingArr, id);
    const success = res > 0;
    return success;
  }

  async addContactsIfMiss(appId: string, ids: string[], prisma: OmitPrismaClient, groupId: string = '') {
    const records = await prisma.wxContact.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
      },
    });
    // 提取已存在的转换为set
    const idsSet = new Set(records.map(record => record.id));
    // 过滤出不存在的
    const missIds = ids.filter(id => !idsSet.has(id));
    if (missIds.length > 0) {
      const contacts = groupId ? 
        await this.geweService.roomMemberInfo(appId, groupId, missIds) : 
        await this.geweService.contactsInfo(appId, missIds);
      const data = contacts.map(item => {
        if (!item.userName) {
          console.error('@缺少联系人信息: ', groupId, missIds, item);
        }
        const obj = _.pick(item, ['nickName', 'pyInitial', 'sex', 'bigHeadImgUrl', 'smallHeadImgUrl', 'country', 'province', 'city']);
        return { ...obj, id: item.userName }
      });
      await prisma.wxContact.createMany({ data });
    }
    return true;
  }

  async addGroupIfMiss(appId: string, ids: string[], prisma: OmitPrismaClient) {
    const records = await prisma.wxGroup.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
      },
    });
    // 提取已存在的转换为set
    const idsSet = new Set(records.map(record => record.id));
    // 过滤出不存在的
    const missIds = ids.filter(id => !idsSet.has(id));
    if (missIds.length > 0) {
      const groupInfos = await this.geweService.contactsInfo(appId, missIds);
      const data = groupInfos.map(item => {
        if (!item.userName) {
          console.error('@缺少群信息: ', missIds, item);
        }
        const obj = _.pick(item, ['nickName', 'pyInitial', 'chatRoomNotify', 'chatRoomOwner', 'smallHeadImgUrl'])
        return { ...obj, id: item.userName }
      });
      await prisma.wxGroup.createMany({ data });
    }
    return true;
  }
}
