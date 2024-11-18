import { UseGuard, Post, Del, Put, Inject, Controller, Body, Param } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { JwtPassportMiddleware } from '../../../middleware/jwt.middleware';
import { MidwayError } from '@midwayjs/core';

import { UserService } from '../service/user.service';
import { Access } from '../../../decorator/access';
import { CasbinGuard } from '../../../guard/casbin';

@UseGuard(CasbinGuard)
@Controller('/system/user', { middleware: [JwtPassportMiddleware] })
export class RoleController {
  @Inject()
  ctx: Context;
  @Inject()
  userService: UserService;

  // 查询列表
  @Access('UserMgt')
  @Post('/page')
  async page(@Body() query: any) {
    const { sort = JSON.stringify({ id: 'desc' }), currentPage = 1, pageSize = 20, ...where } = query;
    const filteredWhere = Object.entries(where).reduce((acc, [key, value]) => {
      // 过滤非法值
      const invalidValue = value === undefined || value === null || value === '';
      if (invalidValue) return acc;
      // 判断是否有模糊查询的字段
      if (typeof value === 'string' && value.endsWith('%')) {
        acc[key] = { contains: value.slice(0, -1) };
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
    const data = await this.userService.findAll(filteredWhere, {
      sort: JSON.parse(sort as string),
      page: Number(currentPage),
      limit: Number(pageSize),
    });
    return data;
  }

  // 修改
  @Access('UserMgt')
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() obj: any,
  ) {
    if (process.env.RUN_DEMO === 'true') {
      if (obj.system) { throw new MidwayError('演示环境不能修改Root用户', '5005') };
    }
    return await this.userService.updateOne(Number(id), obj);
  }

  // 添加
  @Access('UserMgt')
  @Post('/')
  async add(@Body() dto) {
    return this.userService.updateOne(-1, dto);
  }

  // 删除
  @Access('UserMgt')
  @Del('/:id')
  async del(
    @Param('id') id: string,
  ) {
    return this.userService.deleteById(+id);
  }
}
