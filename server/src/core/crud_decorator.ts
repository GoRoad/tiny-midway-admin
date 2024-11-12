import { UseGuard, Controller, Del, Get, Post, Put } from '@midwayjs/core';
import { ApiBody, ApiParam, ApiQuery } from '@midwayjs/swagger';
import { Access } from '../decorator/access';

export const Crud = (prefix = '/', routerOptions, crudOptions): ClassDecorator => {
  const decorators = {
    list: [
      Get('/', { summary: '列表', description: '默认查询100条数据的列表' }),
      ApiQuery({name: 'take', required: false, example: '2', description: '要获取的数据条数'}),
      ApiQuery({name: 'cursorId', required: false, example: '1', description: '游标-数据id'}),
    ],
    page: [
      Post('/page', { summary: '分页列表', description: 'page参数查询分页列表' }),
      ApiQuery({name: 'page', required: false, example: '1', description: '页码'}),
      ApiQuery({name: 'limit', required: false, example: '20', description: '每页条数'}),
    ],
    info: [
      Get('/:id', { summary: '详情', description: '通过id查询详情' }),
      ApiParam({ name: 'id', type: 'string', required: true }),
    ],
    create: [
      Post('/', { summary: '新增', description: '新增' }),
      ApiBody({ type: crudOptions.dto?.create }),
    ],
    update: [
      Put('/:id', { summary: '更新', description: '通过id更新' }),
      ApiParam({ name: 'id', type: 'string', required: true }),
      ApiBody({ type: crudOptions.dto?.update }),
    ],
    delete: [
      Del('/:id', { summary: '删除', description: '通过id删除' }),
      ApiParam({ name: 'id', type: 'string', required: true })
    ],
  };

  return (target) => {
    // 应用守卫到整个控制器类
    if (crudOptions.guard) {
      UseGuard(crudOptions.guard)(target);
    }
    // 定义守卫元数据
    (crudOptions?.access || []).forEach((code, index) => {
      const _target = target.prototype;
      const propertyKey = crudOptions.apis[index];
      Access(code)(_target, propertyKey, Object.getOwnPropertyDescriptor(_target, propertyKey));
    });
    // 注册接口
    for (const propertyKey of crudOptions.apis) {
      Reflect.decorate(decorators[propertyKey], target, propertyKey);
    }
    Controller(prefix, routerOptions)(target);
  };
};
