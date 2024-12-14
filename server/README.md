# tiny-midway-admin 后端部分

## 快速入门

> Gewechat准备

感谢Gewechat，功能依赖[Gewechat](https://github.com/Devo919/Gewechat?tab=readme-ov-file)

感谢Gewechaty，代码参考[Gewechat](https://github.com/mikoshu/gewechaty/)

感谢群里大佬 `@1H` 重构了镜像

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


> 数据库准备(pgvectordata提供向量化支持)
```bash
docker run --name pgvector --restart=always -e POSTGRES_USER=pgvector -e POSTGRES_PASSWORD=pgvector -v /srv/tlw/pgvectordata:/var/lib/postgresql/data -p 54333:5432 -d pgvector/pgvector:pg16
```


### 本地开发

```bash
# 数据库初始化
npx prisma migrate deploy
npm run prisma:init
# 运行前端
cd web
npm i
npm run dev
# 运行后端
cd server
npm i
npm run dev
```

### 开发用-数据库命令
```bash
$ npx prisma studio
$ npx prisma migrate dev --name init
$ npx prisma generate
$ npx prisma db pull
$ npx prisma db push
```
