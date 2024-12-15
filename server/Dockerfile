# 源码目录执行命令构建镜像 docker build -t admin-serve .
# 运行镜像启动服务 docker run -p 7001:7001 admin-serve
# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /build
# 安装tzdata,默认的alpine基础镜像不包含时区组件，安装后可通过TZ环境变量配置时区
RUN apk add --no-cache tzdata
# 设置时区为中国东八区，这里的配置可以被docker-compose.yml或docker run时指定的时区覆盖
ENV TZ="Asia/Shanghai"
# 安装openssl
RUN apk add --no-cache openssl
# 服务器编译打包
# 根据服务器环境选择国内源
RUN npm config set registry https://registry.npmmirror.com
# 构建项目
COPY . .
# 构建阶段会使用到开发依赖所以不能使用 --production 安装依赖
RUN set -x && npm install && echo "Install Done."
# 初始化数据库
RUN set -x && npx prisma migrate deploy && echo "DB deploy."
RUN set -x && npm run prisma:init && echo "DB Done."
# 构建项目
RUN set -x && npm run build && echo "Build Done."
# 减小镜像build之后清理开发依赖
RUN set -x && npm prune --production && echo "Clear Done."

# 第二阶段
# 选择必要文件，减少镜像尺寸
# 根据官方文档说明： 服务器运行必须包含的文件或者目录有 package.json，bootstrap.js，dist，node_modules。
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/prisma ./prisma
COPY --from=builder /build/bootstrap.js .
COPY --from=builder /build/package.json .
COPY --from=builder /build/basic_model.conf .
COPY --from=builder /build/download ./download

# 设置环境变量: 数据库链接
ENV DATABASE_URL="file:./dev.db"

# 暴露端口
EXPOSE 7001
CMD ["node", "bootstrap"]
# 调试
# CMD ["sh", "-c", "node bootstrap || sleep 86400"]
