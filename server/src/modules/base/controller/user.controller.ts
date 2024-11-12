import { Inject, Controller, Get, Patch, Put, Body, Param } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { UserService as SysUserService } from '../../system/service/user.service';
import { JwtPassportMiddleware } from '../../../middleware/jwt.middleware';
// import { Access } from '../../../decorator/access';
// import { CasbinGuard } from '../../../guard/casbin';

import * as bcrypt from 'bcrypt';
import { AdminErrorEnum } from '../../../error/admin.error';

// 不需要角色校验，都是查看自己的数据
// @UseGuard(CasbinGuard)
@Controller('/base/user', { middleware: [JwtPassportMiddleware] })
export class UserController {
  @Inject()
  ctx: Context;
  @Inject()
  userService: UserService;
  @Inject()
  sysUserService: SysUserService;

  @Get('/detail')
  async getUserInfo() {
    try {
      return await this.userService.getUserInfo(this.ctx.state.user.id);
    } catch (error) {
      return AdminErrorEnum.BAD_USER_DATA;
    }
  }

  @Put('/')
  async updateMyInfo(@Body() obj: any,) {
    try {
      return await this.sysUserService.updateUserInfo(this.ctx.state.user.id, obj);
    } catch (error) {
      return AdminErrorEnum.BAD_USER_DATA;
    }
  }

  @Patch('/pwd/:password')
  async updateMyPwd(@Param('password') password: string,) {
    const id = this.ctx.state.user.id;
    const user = await this.sysUserService.safeUserById(id);
    const passwordVersion = user.passwordVersion + 1;
    const str = decodeURIComponent(password);
    const _password = await bcrypt.hash(str, 10);
    const obj = { password: _password, passwordVersion };
    try {
      await this.sysUserService.updateUserInfo(id, obj);
      // 踢下线，重新登录
      return AdminErrorEnum.TIMEOUT_USER_DATA;
    } catch (error) {
      return AdminErrorEnum.BAD_USER_DATA;
    }
  }

  @Get('/menu')
  async getMenuList() {
    try {
      return this.userService.getMenus(this.ctx.state.user.username);
    } catch (error) {
      return AdminErrorEnum.BAD_USER_DATA;
    }
  }
}
