interface IMessageContent {
  string: string;
}

interface IImgBuf {
  iLen: number;
}

interface IMessageData {
  MsgId: string;
  FromUserName: IMessageContent;
  ToUserName: IMessageContent;
  MsgType: number;
  Content: IMessageContent;
  Status: number;
  ImgStatus: number;
  ImgBuf: IImgBuf;
  CreateTime: number;
  MsgSource: string;
  PushContent: string;
  NewMsgId: string;
  MsgSeq: number;
}

export interface IMessage {
  TypeName: string;
  Appid: string;
  Wxid: string;
  Data: IMessageData;
}

// 使用示例
// const message: IMessage = {
//   TypeName: "AddMsg",
//   Appid: "wx_wR_U4zPj2M_OTS3BCyoE4",
//   Wxid: "wxid_phyyedw9xap22",
//   Data: {
//     MsgId: 1040356095,
//     FromUserName: {
//       string: "wxid_phyyedw9xap22"
//     },
//     ToUserName: {
//       string: "wxid_0xsqb3o0tsvz22"
//     },
//     MsgType: 1,
//     Content: {
//       string: "123"
//     },
//     Status: 3,
//     ImgStatus: 1,
//     ImgBuf: {
//       iLen: 0
//     },
//     CreateTime: 1705043418,
//     MsgSource: {
//       alnode: {
//         fr: "1"
//       },
//       signature: "v1_volHXhv4",
//       tmp_node: {
//         "publisher-id": ""
//       }
//     },
//     PushContent: "朝夕。 : 123",
//     NewMsgId: 7773749793478223190,
//     MsgSeq: 640356095
//   }
// };

/* 消息类型为49的链接类消息，需要进一步解析Msg.Data.Content.string中的xml
* 邀请进群的通知，msg.appmsg.type=5
* 小程序消息msg.appmsg.type=33/36
* 引用消息msg.appmsg.type=57
* 转账消息msg.appmsg.type=2000
* 红包消息msg.appmsg.type=2001
* 视频号消息msg.appmsg.type=51
* 文件消息（发送文件的通知 msg.appmsg.type=74
* 文件消息（文件发送完成）msg.appmsg.type=6
* 群聊邀请msg.appmsg.title=邀请你加入群聊(根据手机设置的系统语言title会有调整，不同语言关键字不同)
*/
/* 消息类型为10002的消息，需要进一步解析Msg.Data.Content.string中的xml
* 撤回消息，sysmsg.type=revokemsg
* 拍一拍消息 sysmsg.type=pat
*/
export enum IMessageType {
  Text = 1, // 文本消息
  Image = 3, // 图片消息
  Voice = 34, // 语音消息
  FriendConfirm = 37, // 好友添加请求消息
  POSSIBLEFRIEND_MSG = 40, // POSSIBLEFRIEND_MSG
  contactCard = 42, // 分享的名片消息
  Video = 43, // 视频消息
  Emoji = 47, // 表情
  Location = 48, // 位置消息
  Link = 49, // 链接类消息(引用消息),
  VOIPMsg = 50, // VOIP消息
  WeChatInit = 51, // 微信初始化消息
  VOIPNotify = 52, // VOIP通知
  VOIPInvite = 53, // VOIP邀请
  ShortVideo = 62, // 小视频
  SystemNotice = 9999, // 系统通知
  SystemMessage = 10000, // 系统消息
  Tips = 10002, // 贴士类消息，包含撤回、拍一拍、群（踢人、解散、公告）通知
}

interface IMessagePostDataExtnd {
  nickname: string;
}

export interface IMessageStoreData {
  appId: string;
  wxId: string;
  msgId: string;
  newMsgId: string;
  msgType: number;
  from: string;
  to: string;
  content: string;
  documents?: any; // Unsupported("vector") is represented as 'any' in TypeScript
  pushContent?: string;
  createTime: Date;
  groupId?: string;
}

export interface IMessagePostData extends IMessageStoreData {
  extend?: IMessagePostDataExtnd;
}
