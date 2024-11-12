# my_midway_project

## QuickStart

<!-- add docs here for user -->

see [midway docs][midway] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### 数据库初始化

```bash
npx prisma migrate dev
```

### Deploy

```bash
$ npm start
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.


[midway]: https://midwayjs.org

### 开发说明

> prisma常用命令
```bash
# 自带的数据库浏览器
npx prisma studio
# 根据schema创建数据库和表并生成名为_init的迁移sql文件并更新PrismaClient
npx prisma migrate dev --name init
# 使用现有sql迁移文件创建数据库表如果有,否则重新生成迁移文件并更新PrismaClient
npx prisma migrate dev
# 部署迁移文件到数据库，不更新Prisma Client
npx prisma migrate deploy
# 修改schema.prisma文件后ts类型不正确
# 其他PrismaClient类型提示错误需要执行
npx prisma generate
# 用于从现有的数据库中提取schema.prisma
npx prisma db pull
# 用于将 schema.prisma model直接推到数据库，不生成迁移文件
npx prisma db push
```

