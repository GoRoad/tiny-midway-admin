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
```

### Docker部署
推荐使用 Docker Compose 部署安装 [官方文档](https://docs.docker.com/compose/install/)

#### 部署演示

```base
# 1. 上传admin-compose.yml文件到服务器
# 2. 在上传目录执行下面命令
docker-compose -f admin-compose.yml up -d
```
#### 部署生产
```base
# 服务器编译源码部署
# 注：编译前端代码(web)需要服务器内存大于2G
# 1. 上传源码到服务器
# 2. 在上传目录执行下面命令

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