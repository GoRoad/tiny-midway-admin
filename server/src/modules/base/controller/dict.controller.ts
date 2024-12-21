import { Inject, Controller, Get, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { DictService } from '../service/dict.service';
import { JwtPassportMiddleware } from '../../../middleware/jwt.middleware';
import { AdminErrorEnum } from '../../../error/admin.error';

@Controller('/base/dict', { middleware: [JwtPassportMiddleware] })
export class DictController {
  @Inject()
  ctx: Context;
  @Inject()
  dictService: DictService;


  // 后台配置的字典
  @Get('/')
  async getDict(@Query('code') code: string) {
    const data = await this.dictService.getDictFromDB(code);
    return data || [];
  }

  // 系统字典，动态计算数据返回
  @Get('/sys')
  async getSysDict(@Query('code') code: string) {
    if (code === 'permissions') {
      return await this.dictService.getMenuDict();
    } else if (code === 'role') {
      return await this.dictService.getRoleDict();
    } else {
      return AdminErrorEnum.DICT_NOT_DATA;
    }
  }

  @Get('/wechat/wx-user')
  async getWxUserDict() {
    return this.dictService.getWxUserDict()
  }

  // 获取ai能力字典
  @Get('/openai/sub-types')
  async getOpenAiSubTypes() {
    return this.dictService.openaiSubTypes()
  }

  // 获取ai模型字典
  @Get('/openai/models')
  async getOpenAiModels() {
    return this.dictService.aiModelDict()
  }

  // 筛选微信联系人
  @Get('/wechat/wx-contact-filter')
  async getWxContactDict(@Query('q') q: string) {
    return this.dictService.getWxContactFilterDict(q)
  }

  // 筛选微信联系人
  @Get('/wechat/wx-group-filter')
  async getWxGroupDict(@Query('q') q: string) {
    return this.dictService.getWxGroupFilterDict(q)
  }
}
