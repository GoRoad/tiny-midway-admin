## 简介

⚡ 采用 MidwayJS 3.x框架，结合 Prisma、Casbin、VueNaiveAdmin、 FastCrud 等技术构建的一款高效简洁的前后端分离权限管理系统，持续更新中...

### 演示地址
- 演示地址：https://tiny-admin.2000y.lol/

### 快速开始
```base
git clone https://github.com/34892002/tiny-midway-admin.git
# 安装前端依赖
cd web
npm install
# 启动前端
npm run dev

# 安装后端依赖
cd server
npm install
# 创建数据库
npm run prisma:init
# 启动后端
npm run dev
```

### 部署演示
```base
docker-compose -f admin-compose.yml up -d
```
### 部署生产
```base
docker compose up -d
```

### 使用说明书
- 为增强密码保护，请务必更换初始的key和使用https