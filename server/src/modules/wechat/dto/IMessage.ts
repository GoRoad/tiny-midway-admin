interface GeweMessageContent {
  string: string;
}

interface ImgBuf {
  iLen: number;
}

interface GeweMessageData {
  MsgId: string;
  FromUserName: GeweMessageContent;
  ToUserName: GeweMessageContent;
  MsgType: number;
  Content: GeweMessageContent;
  Status: number;
  ImgStatus: number;
  ImgBuf: ImgBuf;
  CreateTime: number;
  MsgSource: string;
  PushContent: string;
  NewMsgId: string;
  MsgSeq: number;
}

export interface GeweMessage {
  TypeName: string;
  Appid: string;
  Wxid: string;
  testMsg?: string;
  Data: GeweMessageData;
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

export const MessageType = {
  Unknown: 'unknown', // 未知类型
  FileStart: 'file_start', // 文件开始
  File: 'file', // 文件发送结束
  Voice: 'voice', // 语音
  Contact: 'contact', // 名片
  Emoji: 'emoji', // 表情
  Image: 'image', // 图片
  Text: 'text', // 文本
  Video: 'video', // 视频
  Url: 'link', // 链接
  RoomInvitation: 'room_invitation', // 群邀请
  MiniApp: 'mini_app', // 小程序消息
  AppMsg: 'app_msg', // app消息
  Link: 'link', // 公众号链接
  AddFriend: 'add_friend', // 添加好友通知
  Quote: 'quote', // 引用消息
  Transfer: 'transfer', //转账
  RedPacket: 'red_packet', //红包
  VideoAccount: 'video_account', // 视频号消息
  Revoke: 'revoke', // 撤回消息
  Pat: 'pat', // 拍一拍
  Location: 'location', // 位置消息
  FunctionMsg: 'function_msg', // 微信团队消息
  NewMonmentTimeline: 'new_monment_timeline', // 朋友圈更新
  ChatHistroy: 'chat_histroy', // 聊天记录
  Voip: 'voip', // voip消息
  RealTimeLocation: 'real_time_location', // 实时位置共享
};

export interface Member {
  wxid: string;
  nickName: string;
  memberFlag: number;
}

export interface ChatRoom {
  chatroomId: string;
  nickName: string;
  pyInitial: string;
  quanPin: string;
  remark: string | null;
  remarkPyInitial: string | null;
  remarkQuanPin: string | null;
  chatRoomNotify: number;
  chatRoomOwner: string; // 群主id
  smallHeadImgUrl: string;
  memberList: Member[]; // 有缓存，接口获取群成员名单
}

export interface Contact {
  userName: string;
  nickName: string;
  pyInitial: string;
  quanPin: string;
  sex: number;
  remark: string;
  remarkPyInitial: string;
  remarkQuanPin: string;
  signature: string | null;
  alias: string;
  snsBgImg: string | null;
  country: string;
  bigHeadImgUrl: string;
  smallHeadImgUrl: string;
  description: string | null;
  cardImgUrl: string | null;
  labelList: any[] | null;
  province: string;
  city: string;
  phoneNumList: any[] | null;
}