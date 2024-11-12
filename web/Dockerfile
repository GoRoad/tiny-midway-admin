# 源码目录执行命令构建镜像 docker build -t admin .
# 运行镜像启动服务 docker run -p 3003:80 admin
# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /build
# 服务器编译打包
# 服务器资源不足的可以在本地打包上传dist目录到源码，从这里开始注释到构建阶段结束
# 安装tzdata,默认的alpine基础镜像不包含时区组件，安装后可通过TZ环境变量配置时区
RUN apk add --no-cache tzdata
# 设置时区为中国东八区，这里的配置可以被docker-compose.yml或docker run时指定的时区覆盖
ENV TZ="Asia/Shanghai"
# 根据服务器环境选择国内源
RUN npm config set registry https://registry.npmmirror.com
# 构建项目
COPY . .
# set -x 输出调试信息
# 安装依赖
RUN set -x && npm install && echo "Install Done."
# 构建项目，增加 Node.js 内存限制
RUN set -x \
    && node --max-old-space-size=2048 ./node_modules/.bin/vite build \
    && echo "Build Done."

# 第二阶段
# 选择必要文件，减少镜像尺寸
FROM nginx:stable-alpine AS prod
COPY --from=builder /build/dist /www
COPY nginx.conf /etc/nginx/nginx.conf
# 暴露端口
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
# 调试
# CMD ["sh", "-c", "sleep 86400"]
