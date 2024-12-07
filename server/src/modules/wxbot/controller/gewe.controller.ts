import { Controller, Inject, Get, Query } from '@midwayjs/core';
import { GeweService } from '../service/gewe.service';

// import { JwtPassportMiddleware } from '../../../middleware/jwt.middleware';

@Controller('/gewe', { middleware: [] })
export class GeweController {
  @Inject()
  geweService: GeweService;
  // gewe接口的token，每次调用传递
  @Get('/token')
  async home(): Promise<any> {
    return this.geweService.getToken();
  }
  // appId参数为设备ID，首次登录传空，会自动触发创建设备，掉线后重新登录则必须传接口返回的appId，注意同一个号避免重复创建设备，以免触发官方风控
  @Get('/login')
  async login(): Promise<any> {
    const appId = 'wx_dl-59z-pJEwnUNljtl4F0';
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
    const _url = decodeURIComponent("http://192.168.2.183:7001/wxBot/Callback")
    console.log('url: ', url, _url);
    return this.geweService.setCallback(_url);
  }
}
