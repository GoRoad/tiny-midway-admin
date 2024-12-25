import { Controller, Inject, Get, Query, Post, Body } from '@midwayjs/core';
import { GeweService } from '../service/gewe.service';

import { JwtPassportMiddleware } from '../../../middleware/jwt.middleware';

@Controller('/wechat/gewe', { middleware: [JwtPassportMiddleware] })
export class GeweController {
  @Inject()
  geweService: GeweService;

  @Get('/config')
  async getConfig(): Promise<any> {
    return this.geweService.getGeweConfig();
  }

  @Post('/config')
  async setConfig(@Body() data: any): Promise<any> {
    return this.geweService.setGeweConfig(data);
  }

  @Get('/wxUsers')
  async getWxUser(): Promise<any> {
    return this.geweService.getWxUsers();
  }

  @Get('/delWxUser')
  async delWxUser(@Query('wxid') wxid: string): Promise<any> {
    return this.geweService.delWxUser(wxid);
  }

  @Post('/wxUser')
  async setWxUser(@Body() data: any): Promise<any> {
    return this.geweService.setWxUser(data);
  }
  // gewe接口的token，每次调用传递
  // @Get('/token')
  // async home(): Promise<any> {
  //   return this.geweService.getToken();
  // }
  // appId参数为设备ID，首次登录传空，会自动触发创建设备，掉线后重新登录则必须传接口返回的appId，注意同一个号避免重复创建设备，以免触发官方风控
  @Get('/login')
  async login(@Query('appId') appId: string): Promise<any> {
    return this.geweService.getQrCode(appId);
  }
  // 获取到登录二维码后需每间隔5s调用本接口来判断是否登录成功
  @Get('/checkLogin')
  async checkLogin(
    @Query('appId') appId: string,
    @Query('uuid') uuid: string
  ): Promise<any> {
    return this.geweService.checkLogin({ appId, uuid });
  }

  @Get('/logout')
  async logout(@Query('appId') appId: string): Promise<any> {
    return this.geweService.logout(appId);
  }

  @Get('/checkOnline')
  async checkOnline(@Query('appId') appId: string): Promise<any> {
    return this.geweService.checkOnline(appId);
  }

  @Get('/tools/setCallback')
  async setCallback(@Query('url') url: string): Promise<any> {
    const _url = decodeURIComponent(url);
    return this.geweService.setCallback(_url);
  }

  // 联系人模块
  // 获取群信息/好友详细信息
  @Post('/contacts/getDetailInfo')
  async getContactsInfo(@Body('appId') appId: string, @Body('wxids') wxids: string[]): Promise<any> {
    return this.geweService.contactsInfo(appId, wxids);
  }

  // 群模块
  // 获取群成员详情
  @Post('/group/getChatroomMemberDetail')
  async getRoomMemberInfo(@Body('appId') appId: string, @Body('chatroomId') chatroomId: string , @Body('memberWxids') memberWxids: string[]): Promise<any> {
    return this.geweService.roomMemberInfo(appId, chatroomId, memberWxids);
  }

  /**
   * 获取聊天室成员列表
   *
   * @param appId 应用ID
   * @param chatroomId 聊天室ID
   * @returns 返回聊天室成员列表
   */
  @Post('/group/getChatroomMemberList')
  async getRoomMemberList(@Body('appId') appId: string, @Body('chatroomId') chatroomId: string): Promise<any> {
    return this.geweService.roomMemberList(appId, chatroomId);
  }
}
