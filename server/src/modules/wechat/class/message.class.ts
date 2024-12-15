import { XMLParser } from 'fast-xml-parser';
import { MessageType, GeweMessage } from '../dto/IMessage';

// 仅包装消息体，为了方便开发
// 不引入其他依赖注入容器避免混乱
// 借鉴（抄） https://github.com/mikoshu/gewechaty/

export class Message {
  static Type = MessageType;

  appid: string;
  wxid: string;
  fromId: string;
  toId: string;
  isRoom: boolean;
  _msgId: any;
  _newMsgId: any;
  _text: string;
  _type: any;
  _createTime: any;
  _date: number;
  _self: boolean;
  _pushContent: any;
  _msgSeq: any;
  _status: any;
  _msgSource: any;
  _roomInfo?: any;

  isSendRoom: boolean;

  constructor(data: GeweMessage) {
    
    try {
      this.appid = data.Appid;
      this.wxid = data.Wxid;
      this.fromId = data.Data.FromUserName.string;
      this.toId = data.Data.ToUserName.string;
      this.isRoom = data.Data.FromUserName.string.endsWith('@chatroom');
      this._msgId = data.Data.MsgId || null;
      this._newMsgId = data.Data.NewMsgId || null;
      this._text = data.Data.Content?.string || '';
      this._type = data.Data.MsgType;
      this._createTime = data.Data.CreateTime;
      this._date = this._createTime * 1000;
      this._self = data.Wxid === data.Data.FromUserName.string;
      this._pushContent = data.Data.PushContent || '';
      this._msgSeq = data.Data.MsgSeq || null;
      this._status = data.Data.Status || null;
      this._msgSource = data.Data.MsgSource || null;

      this.isSendRoom = this._self && this.toId.endsWith('@chatroom');
    } catch (error) {
      console.log('Message error: ', error);
      console.log('@未知消息结构', data);
    }
    

    // if (this.isRoom) {
    //   getRoomInfo(this.fromId);
    // }
  }

  isCompanyMsg(): boolean {
    const companyList = [
      'weixin',
      'newsapp',
      'tmessage',
      'qqmail',
      'mphelper',
      'qqsafe',
      'weibo',
      'qmessage',
      'floatbottle',
      'medianote',
    ];
    return this.fromId.includes('gh_') || companyList.includes(this.fromId);
  }

  from(): any {
    if (this.isRoom) {
      return this._text.split(':\n')[0];
    }
    return this.fromId;
  }

  talker(): any {
    if (this.isRoom) {
      return this._text.split(':\n')[0];
    }
    return this.fromId;
  }

  to(): any {
    return this.toId;
  }

  //   async room(): Promise<any> {
  //     if (!this.isRoom) return false;
  //     if (!this._roomInfo) {
  //       this._roomInfo = await getRoomInfo(this.fromId);
  //     }
  //     return this._roomInfo;
  //   }

  text(): string {
    if (this.isRoom) {
      return this._text.split(':\n').slice(1).join(':\n');
    }
    return this._text;
  }

  //   async say(textOrContactOrFileOrUrl: any): Promise<any> {
  //     const res = await say(textOrContactOrFileOrUrl, this.fromId);
  //     return new ResponseMsg(res);
  //   }

  type() {
    return Message.getType(this._type, this.text());
  }

  self(): boolean {
    return this._self;
  }

  async mention(): Promise<any> {
    console.log('暂不支持');
    return null;
  }

  async mentionSelf(): Promise<boolean> {
    if (!this.isRoom || !this._msgSource) {
      return false;
    }
    const result = Message.getXmlToJson(this._msgSource);
    const atUserList = result.msgsource.atuserlist;
    return atUserList?.split(',').includes(this.wxid);
  }

  //   async forward(to: any): Promise<any> {
  //     if (!to) {
  //       console.error('转发消息时，接收者不能为空');
  //       return;
  //     }
  //     return forward(this.text(), to, this.type());
  //   }

  date(): Date {
    return new Date(this._date);
  }

  age(): number {
    const now = Date.now();
    return Math.floor((now - this._date) / 1000);
  }

  async toContact(): Promise<any> {
    console.log('暂不支持');
    return null;
  }

  async toUrlLink(): Promise<any> {
    console.log('暂不支持');
    return null;
  }

  //   async toFileBox(type: number = 2): Promise<Filebox | null> {
  //     if (this._type !== 3) {
  //       console.log('不是图片类型，无法调用toFileBox方法');
  //       return null;
  //     }
  //     let xml = '';
  //     if (this.isRoom) {
  //       xml = this._text.split(":\n")[1];
  //     } else {
  //       xml = this._text;
  //     }
  //     try {
  //       const url = await toFileBox(xml, type);
  //       return Filebox.toDownload(url);
  //     } catch (e) {
  //       console.error(e);
  //       return null;
  //     }
  //   }

  //   async quote(title: string): Promise<any> {
  //     if (!title || title === '') {
  //       console.error('引用消息时title不能为空');
  //       return;
  //     }
  //     let msg = {
  //       title,
  //       msgid: this._newMsgId,
  //       wxid: this.fromId
  //     };
  //     if (this.isRoom) {
  //       msg.wxid = this._text.split(':\n')[0];
  //     }
  //     return quote(msg, this.fromId);
  //   }

  static getXmlToJson(xml: string): any {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });
    let jObj = parser.parse(xml);
    return jObj;
  }

  //   static async find(query: any): Promise<any> {
  //     return await find(query);
  //   }

  static async findAll(queryArgs: any): Promise<any[]> {
    console.log('暂不支持findAll');
    return Promise.resolve([]);
  }

  static getType(type: any, xml: string) {
    let jObj: any;
    try {
      switch (type) {
        case 1:
          return MessageType.Text;
        case 3:
          return MessageType.Image;
        case 34:
          return MessageType.Voice;
        case 37:
          return MessageType.AddFriend;
        case 42:
          return MessageType.Contact;
        case 43:
          return MessageType.Video;
        case 47:
          return MessageType.Emoji;
        case 48:
          return MessageType.Location;
        case 49:
          jObj = Message.getXmlToJson(xml);
          if (jObj.msg.appmsg.type === 5) {
            if (jObj.msg.appmsg.title === '邀请你加入群聊') {
              return MessageType.RoomInvitation;
            } else {
              return MessageType.Link;
            }
          } else if (jObj.msg.appmsg.type === 6) {
            return MessageType.File;
          } else if (jObj.msg.appmsg.type === 17) {
            return MessageType.RealTimeLocation;
          } else if (jObj.msg.appmsg.type === 19) {
            return MessageType.ChatHistroy;
          } else if (
            jObj.msg.appmsg.type === 33 ||
            jObj.msg.appmsg.type === 36
          ) {
            return MessageType.MiniApp;
          } else if (jObj.msg.appmsg.type === 51) {
            return MessageType.VideoAccount;
          } else if (jObj.msg.appmsg.type === 57) {
            return MessageType.Quote;
          } else if (jObj.msg.appmsg.type === 74) {
            return MessageType.FileStart;
          } else if (jObj.msg.appmsg.type === 2000) {
            return MessageType.Transfer;
          } else if (jObj.msg.appmsg.type === 2001) {
            return MessageType.RedPacket;
          }
          break;
        case 50:
          break;
        case 51:
          jObj = Message.getXmlToJson(xml);
          if (jObj.msg.name === 'MomentsTimelineStatus') {
          } else if (jObj.msg.name === 'lastMessage') {
          }
          break;
        case 56:
          break;
        case 10000:
          break;
        case 10002:
          jObj = Message.getXmlToJson(xml);
          if (jObj.sysmsg.type === 'revokemsg') {
            return MessageType.Revoke;
          } else if (jObj.sysmsg.type === 'pat') {
            return MessageType.Pat;
          } else if (jObj.sysmsg.type === 'functionmsg') {
            return MessageType.FunctionMsg;
          } else if (jObj.sysmsg.type === 'ilinkvoip') {
            return MessageType.Voip;
          } else if (jObj.sysmsg.type === 'trackmsg') {
          }
          break;
        default:
          return MessageType.Unknown;
      }
    } catch (e) {
      return MessageType.Unknown;
    }
  }
}
