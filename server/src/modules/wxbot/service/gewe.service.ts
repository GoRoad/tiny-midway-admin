import {
  Scope,
  ScopeEnum,
  Init,
  Provide,
  makeHttpRequest,
  Inject,
} from '@midwayjs/core';
import { Prisma, PrismaClient } from '@prisma/client';
import * as _ from 'lodash';

@Provide()
@Scope(ScopeEnum.Singleton)
export class GeweService {
  private token: string;
  private config: any;
  private expiresAt: number;
  static readonly EXPIRES_TIME = 60 * 1000 * 60 * 3; // 默认到期时间毫秒数3小时

  @Inject()
  prisma: PrismaClient;

  @Init()
  async init() {
    // 初始化
    this.expiresAt = Date.now()
    const config = await this.prisma.geweConfig.findFirst();
    this.config = config;
  }

  private refreshConfig(data) {
    if (data) {
      this.config = data;
    } else {
      throw new Error('Gewe Config Error: ')
    }
  }

  private async request(method: string, url: string, data: any = {}, isToken = true): Promise<any> {
    if (!this.config?.baseAPI) {
      throw new Error('Gewe url Error: ')
    }
    const fullUrl = this.config.baseAPI + url;
    const options = {
      headers: {
        'Content-Type': 'application/json'
      },
      method,
      data,
      dataType: 'json' as "json" | "text",
    };
    if (isToken) {
      const token = await this.getToken();
      if (!token) throw new Error('Gewe Invalid token: ' + token)
      options.headers['X-GEWE-TOKEN'] = token;
    }
    const result: any = await makeHttpRequest(fullUrl, options);
    const _data = result.data;
    console.log('GeweService http: ', _data);
    if (_data.ret === 200) {
      return 'data' in _data ? _data.data : _data.msg;
    } else {
      throw new Error(_data.msg || 'Gewe Error!');
    }
  }

  private async refreshToken() {
    const token = await this.request('POST', '/tools/getTokenId', null, false);
    if (!token) throw new Error('Get token Error');
    this.token = token;
    this.expiresAt = Date.now() + GeweService.EXPIRES_TIME;
  }

  async post(url: string, data: any) {
    const result = await this.request('POST', url, data);
    return result;
  }

  async getToken() {
    if (Date.now() >= this.expiresAt) {
      await this.refreshToken();
    }
    return this.token;
  }

  async getGeweConfig() {
    const data =  await this.prisma.geweConfig.findFirst();
    return data;
  }

  async setGeweConfig(data: Prisma.GeweConfigCreateInput) {
    const id = 1;
    const res = await this.prisma.geweConfig.upsert({
      where: { id },
      update: data,
      create: { ...data, id },
    });
    this.refreshConfig(res);
    return res;
  }

  async getWxUsers() {
    const data =  await this.prisma.wxUser.findMany();
    return data;
  }

  async setWxUser(data: Prisma.WxUserCreateInput) {
    const res = await this.prisma.wxUser.upsert({
      where: { wxid: data.wxid },
      update: data,
      create: { ...data },
    });
    return res;
  }

  async delWxUser(wxid: string) {
    const data =  await this.prisma.wxUser.delete({
      where: { wxid }
    })
    return data;
  }

  // appId参数为设备ID，首次登录传空，会自动触发创建设备，掉线后重新登录则必须传接口返回的appId，注意同一个号避免重复创建设备，以免触发官方风控
  // 取码时传的appId需要与上次登录扫码的微信一致，否则会导致登录失败
  async getQrCode(appId: string = '') {
    const result = await this.request('POST', '/login/getLoginQrCode', {
      appId,
    });
    return result;
  }

  async checkLogin(data: any) {
    const result = await this.request('POST', '/login/checkLogin', data);
    return result;
  }

  async logout(appId: string) {
    const result = await this.request('POST', '/login/logout', { appId });
    return result;
  }

  async checkOnline(appId: string) {
    const result = await this.request('POST', '/login/checkOnline', { appId });
    return result;
  }

  async setCallback(url: string) {
    const result = await this.request('POST', '/tools/setCallback', {
      token: await this.getToken(),
      callbackUrl: url,
    });
    return result;
  }
}
