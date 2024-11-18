## 简介

⚡ 采用 MidwayJS 3.x框架，结合 Prisma、Casbin、VueNaiveAdmin、 FastCrud 等技术构建的一款高效简洁的前后端分离权限管理系统，持续更新中...

### 演示地址
>外网环境，所以感觉会卡，推荐使用Docker部署演示
- 演示地址：https://tiny-admin.2000y.lol

### 快速开始
> 推荐开发环境 nodejs 18.14.x 及以上版本

```base
git clone https://github.com/34892002/tiny-midway-admin.git
# 安装前端依赖
cd web
npm install
# 启动前端
npm run dev

# 返回上级目录
cd ..

# 安装后端依赖
cd server
npm install
# 创建数据库（仅第一次）
npm run prisma:init
# 启动后端
npm run dev

# 自带的数据库浏览器(server目录)
npx prisma studio
```
### CRUD 快速开发
- 后端CRUD接口
> 例子源代码  server/src/modules/demo/demo.controller.ts
```typescript
import { Inject } from '@midwayjs/core';
import { BaseController } from '../../../core/crud_controller';
import { Crud } from '../../../core/crud_decorator';
import { DemoDto } from '../dto/demo';
import { DemoService } from '../service/demo.service';
import { CasbinGuard } from '../../../guard/casbin';
import { JwtPassportMiddleware } from '../../../middleware/jwt.middleware';

@Crud(
  '/demo/crud',
  { middleware: [JwtPassportMiddleware], description: 'CRUD例子' },
  {
    apis: [
      'list',
      'page',
      'info',
      'create',
      'update',
      'delete'
    ],
    access: [
      'demo:crud:view',
      'demo:crud:view',
      'demo:crud:view',
      'demo:crud:add',
      'demo:crud:edit',
      'demo:crud:remove'
    ],
    dto: { create: DemoDto, update: DemoDto },
    guard: CasbinGuard
  }
)
export class DemoController extends BaseController {
  @Inject()
  protected service: DemoService;
}
```
- 前端CRUD页面
> 例子源代码 web\src\views\demo\crud\index.vue

```vue
<template>
  <CommonPage>
    <fs-crud ref="crudRef" v-bind="crudBinding">
    </fs-crud>
  </CommonPage>
</template>

<script setup>
  import { ref, onMounted } from "vue";
  import { useFs } from "@fast-crud/fast-crud";
  import createCrudOptions from "./crud";

  // 将在createOptions之前触发
  const onExpose = (e) => {
    // 可以获取到crudExpose,和context
    console.log(e);
  }
  const { crudRef, crudBinding, crudExpose } = useFs({
    createCrudOptions,
    onExpose,
    // 控制按钮是否展示，需要在资源管理中配置按钮code
    // 比如demo:crud:add、demo:crud:edit、demo:crud:xxx
    // 然后在角色管理分配给对应角色，刷新页面就生效了
    // 这里只用配置前缀，代码会自校验add、edit、view、remove
    context: { permission: "demo:crud" }
  });
  // 页面打开后获取列表数据
  onMounted(async () => {
    crudExpose.doRefresh();
  });
</script>
```

- 前端CRUD组件配置文件
> 例子源代码 web\src\views\demo\crud\crud.js

```javascript
/**
 * 省略了接口配置，具体请查看例子源代码
 */
export default function ({ crudExpose, context }) {
  const opt = {
    crudOptions: {
      // crud接口配置
      request: {
        pageRequest,
        addRequest,
        editRequest,
        delRequest
      },
      // crud表格配置
      columns: {
        _index: {
          title: '序号',
          type: 'text',
        },
        id: {
          title: 'id',
          type: 'text',
          readonly: true,
        },
        name: {
          title: '姓名',
          type: 'text',
          search: {
            show: true,
          },
          form: {
            rule: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
          },
          editForm: {
            rule: [{ required: true, pattern: /^.{2,12}$/, message: '长度为2-12', trigger: 'blur' }],
          },
        },
        desc: {
          title: '描述',
          type: 'text',
          column: { // 表格列的展示配置
            resizable: true,
            width: 200
          }
        },
      },
    }
  }
  // 按钮权限处理
  return createPermissionOpt(opt, context)
}
```

### Docker部署
推荐使用 Docker Compose 部署安装 [官方文档](https://docs.docker.com/compose/install/)

#### 部署演示
- 部署演示站点到自己的服务器
```base
# 1. 上传admin-compose.yml文件到服务器
# 2. 在上传目录执行下面命令
docker-compose -f admin-compose.yml up -d
```
#### 部署生产
- 在服务器上打包部署，需要2G以上内存
```base
# 服务器打包源码部署
# 注：编译前端代码(web)需要服务器内存大于2G
# 1. 上传源码到服务器
# 2. 在上传目录执行下面命令

docker compose up -d
```

- 在本地电脑打包上传部署，快速、不挑服务器配置
> 先按照[快速开始](#快速开始)的说明搭建好本地开发环境
```base
# 打包前端代码
cd web
npm run build
# 修改web前端目录的Dockerfile文件，去掉打包命令
# 删除掉Dockerfile文件中如下内容:
    # 安装依赖
    RUN set -x && npm install && echo "Install Done."
    # 构建项目，增加 Node.js 内存限制
    RUN set -x \
        && node --max-old-space-size=2048 ./node_modules/.bin/vite build \
        && echo "Build Done."



# 返回上级目录
cd ..

# 打包后端部分
cd server
npm run prisma:init
npm run build
# 修改server后端目录的Dockerfile文件，去掉打包命令
# 删除掉Dockerfile文件中如下内容:
    # 构建阶段会使用到开发依赖所以不能使用 --production 安装依赖
    RUN set -x && npm install && echo "Install Done."
    # 初始化数据库
    RUN set -x && npm run prisma:init && echo "DB Done."
    # 构建项目
    RUN set -x && npm run build && echo "Build Done."
    # 减小镜像build之后清理开发依赖
    RUN set -x && npm prune --production && echo "Clear Done."
```
将打包好的项目整体上传到服务器。注意不需要上传web、server目录下面的node_modules目录
在服务器上项目的根目录执行下面命令
```base
docker compose up -d
```

### 使用说明书
- 为增强密码保护，请务必更换初始的key和使用https
#### 前端部分
- [vue-naive-admin 2.x](https://www.isme.top/) 一款极简风格的后台管理模板
- [fast-crud](http://fast-crud.docmirror.cn/) 基于Vue3的面向配置的crud开发框架，快速开发crud功能
- [fast-crud 官方示例](http://fast-crud.docmirror.cn/naive/#/login?redirect=/dashboard) 【赞】页面右下角按钮直达每个例子源码
- [naiveui](https://www.naiveui.com/) 是一个流行的 Vue3 的组件库，主题可调

#### 后端端部分
- [midwayjs](https://www.midwayjs.org/) 阿里巴巴 - 淘宝前端架构团队，基于渐进式理念研发的 Node.js 框架
- [prisma](https://github.com/prisma/prisma) 下一代数据库 ORM,支持PostgreSQL、MySQL、SQLite、MongoDB、SQLServer、CockroachDB
- [casbin](https://github.com/casbin/node-casbin) 权限控制框架，支持ACL、RBAC、ABAC等权限控制模型