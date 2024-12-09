import { Provide, Inject } from '@midwayjs/core';
import { GeweService } from './gewe.service';
import { IMessage, IMessageType } from '../dto/IMessage';

// import { PrismaClient } from '@prisma/client';
// import { ContactsResponse, ChatRoomResponse } from '../dto/WXres';
// import { Member } from '../dto/WXres';

// type OmitPrismaClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
@Provide()
export class WxMessageService {
  @Inject()
  geweService: GeweService;

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

  async handleTextMsg(msg: IMessage) {
    // console.log('@handleTextMsg: ', msg);
    const { Wxid, Appid, Data } = msg;
    const { ToUserName, FromUserName, Content, PushContent } = Data;
    const contenText = Content.string;
    // 群消息的FromUserName有groupId@chatroom，其他为wxid
    const isRoom = FromUserName.string.includes('@chatroom');
    console.log(Wxid, Appid, FromUserName, ToUserName, isRoom, contenText, PushContent);
    if (isRoom) {
      const [_groupWxid] = contenText.split(':');
      // const alias = _groupWxid.trim();
      // console.log('微信号: ', alias);
      // 去掉:和文本开头的\n
      const msgText = contenText.substring(_groupWxid.length + 2);
      if (msgText.startsWith('ai ')) {
        this.sendMsg(Appid, FromUserName.string, '你好，我是你的智能助手.')
      }
    }
  }

  async handleMessage(msg: IMessage) {
    // console.log('@调试消息体: ', msg);
    const msgType = msg.Data.MsgType;
    switch (msgType) {
      case IMessageType['Text']:
        this.handleTextMsg(msg);
        break;
      case IMessageType['Image']:
        console.log('图片消息', msg);
        // this.handleMsgImage(msg.Data);
        break;
      case IMessageType['Voice']:
        console.log('语音消息', msg);
        break;
      case IMessageType['Video']:
        console.log('视频消息', msg);
        break;
      case IMessageType['ShortVideo']:
        console.log('小视频消息', msg);
        break;
      case IMessageType['Location']:
        console.log('位置消息', msg);
        break;
      case IMessageType['Link']:
        // this.handleMsgLink(msg);
        break;
      case IMessageType['Emoji']:
        console.log('表情消息', msg);
        // this.handleMsgImage(msg.Data);
        break;
      case IMessageType['contactCard']:
        console.log('名片消息', msg);
        break;
      case IMessageType['Tips']:
        console.log('贴士类消息', msg);
        break;
      case IMessageType['FriendConfirm']:
        console.log('好友申请消息', msg);
        break;
      case IMessageType['SystemNotice']:
        console.log('系统通知', msg);
        break;
      case IMessageType['SystemMessage']:
        console.log('系统消息', msg);
        break;
      default:
        console.log('未处理消息类型', msg.Wxid);
        break;
    }
  }
}
