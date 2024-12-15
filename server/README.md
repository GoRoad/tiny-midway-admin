## 简介

⚡ 此项目属于tiny-midway-admin(此处简称Tiny)衍生项目，目的是创造一个能快速接入微信的个人ai助手，使用向量化存储聊天记录，让你的私人助手更智能。本项目仅供个人学习使用且未经过规模测试，不得用于任何商业或非法行为，否则后果自负。

## 部分功能


## 快速入门
运行环境：docker、nodejs
本项目总运行总共需要三个部分： Tiny、Gewechat，Tiny提供admin管理界面，接入微信的功能依靠[Gewechat](https://github.com/Devo919/Gewechat)实现

### Tiny

```base
# 注意是wechat分支
git clone -b wechat https://github.com/34892002/tiny-midway-admin.git
```

### 数据库
> 使用pgvector镜像或使用PostgreSQL数据库自行安装vector插件，主要用于向量化存储支持

```bash
# pgvector镜像
docker run --name pgvector --restart=always -e POSTGRES_USER=pgvector -e POSTGRES_PASSWORD=pgvector -v /root/pgvector/data:/var/lib/postgresql/data -p 5432:5432 -d pgvector/pgvector:pg16
```

### Gewechat

```bash
  docker pull registry.cn-chengdu.aliyuncs.com/tu1h/wechotd:alpine
  docker tag registry.cn-chengdu.aliyuncs.com/tu1h/wechotd:alpine gewe
```
运行镜像容器

```bash
  mkdir -p /root/temp
  docker run -itd -v /root/temp:/root/temp -p 2531:2531 -p 2532:2532 --name=gewe gewe
  #将容器设置成开机运行
  docker update --restart=always gewe
```

### 本地开发
- 连接数据库创建数据库：tiny_admin
- 修改/server/.env数据库配置 DATABASE_URL="postgresql://user:pwd@host:port/tiny_admin?schema=public"

数据库初始化
```bash
npx prisma migrate deploy
npm run prisma:init
```
运行前端
```bash
cd web
npm i
npm run dev
```
运行后端

```bash
cd server
npm i
npm run dev
```
> 访问web界面
http://localhost:3200/

## 学习互助群
说明：目前项目还不稳定，测试（踩坑）为主，我会尽快修复，Peace and love.
![img](/img/g_20241215.jpg)

## 鸣谢
- 感谢Gewechat，功能依赖[Gewechat](https://github.com/Devo919/Gewechat)
- 感谢Gewechaty项目，代码参考[Gewechaty](https://github.com/mikoshu/gewechaty)
- 感谢群里大佬 `@1H` 重构了镜像

# tiny-midway-admin 后端部分

### 本地开发

```bash
# 数据库初始化
npx prisma migrate deploy
npm run prisma:init
# 运行后端
cd server
npm i
npm run dev
```

### 开发用-数据库命令
```bash
$ npx prisma studio
$ npx prisma migrate dev --name init
$ npx prisma migrate deploy
$ npx prisma generate
$ npx prisma db pull
$ npx prisma db push
```
