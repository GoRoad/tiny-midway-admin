import { App, Inject } from '@midwayjs/core';
import { Application, Context } from '@midwayjs/koa';
import { ListQuery } from './dto';
import { ValidateService } from '@midwayjs/validate';

export abstract class BaseController {
  @App()
  protected app: Application;

  @Inject()
  protected ctx: Context;

  @Inject()
  validateService: ValidateService;

  protected service;

  public async list() {
    const { query } = this.ctx;
    // 参数校验
    const validatedQuery = this.validateService.validate(ListQuery, query);
    const { take, cursorId } = validatedQuery.value;
    return await this.service.list(take, cursorId);
  }

  public async page() {
    const { body } = this.ctx.request as any;
    const { sort = JSON.stringify({ id: 'desc' }), currentPage = 1, pageSize = 20, ...where } = body;
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
    return await this.service.findAll(filteredWhere, {
      sort: JSON.parse(sort as string),
      page: Number(currentPage),
      limit: Number(pageSize),
    });
  }

  public async info() {
    const { params, query } = this.ctx;
    const { id } = params;
    return await this.service.findById(isNaN(id) ? id : +id, query);
  }

  public async create() {
    const { body } = this.ctx.request as any;
    // prisma自动生成的字段，不能被修改
    delete body.createTime;
    delete body.updateTime;
    return await this.service.create(body);
  }

  public async update() {
    const { params } = this.ctx;
    const { id } = params;
    const { body } = this.ctx.request as any;
    // prisma自动生成的字段，不能被修改
    delete body.createTime;
    delete body.updateTime;
    return await this.service.updateOne({ id: isNaN(id) ? id : +id }, body);
  }

  public async delete() {
    const { params } = this.ctx;
    const { id } = params;
    return await this.service.deleteById(isNaN(id) ? id : +id);
    // return this.success(result);
  }

  protected success(content?) {
    return { header: { status: 0 }, content };
  }
}
