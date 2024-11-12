import { Provide, Inject } from '@midwayjs/core';
import { PrismaClient } from '@prisma/client';
import { CasbinService } from '../../base/service/casbin.service';
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';

@Provide()
export class AuthService {
  @Inject()
  prisma: PrismaClient;

  @Inject()
  casbinService: CasbinService;

  async login(username: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { username },
    });
    if (!user) return false;
    const match = await bcrypt.compare(password, user.password);
    // 去掉密码后返回
    const safe = _.omit(user, 'password');
    return match ? safe : false;
  }

  async checkMenuAccess(username: string, path: string) {
    const res = await this.prisma.resource.findFirst({
      where: { path },
    });
    if (res?.code) {
      // 校验权限
      const code = res.code;
      return await this.casbinService.checkAccess(username, code);
    } else {
      // 没有code，无法管辖等于有权限
      return true;
    }
  }
}

