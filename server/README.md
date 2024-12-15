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
$ npx prisma migrate reset
$ npx prisma generate
$ npx prisma db pull
$ npx prisma db push
```
