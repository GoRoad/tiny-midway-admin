import { MidwayConfig } from '@midwayjs/core';
import { join } from 'path';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '22262538456_5791',
  mnAdmin: {
    token: {
      // refresh token 默认2天，记住登录信息最大30天
      refresh_token_default: '2d',
      refresh_token_max: '30d',
      // token 默认2小时
      token_default: '2h',
    }
  },
  client: {
  },
  koa: {
    port: 7001,
  },
  jwt: {
    secret: 'mn-admin-jwt', // fs.readFileSync('xxxxx.key')
    // 默认有效期 https://github.com/vercel/ms
    expiresIn: '2d',
  },
  passport: {
    session: false, // 使用jwt无需保存到session
  },
  casbin: {
    modelPath: join('./', 'basic_model.conf'),
    // 使用数据库的policy
    // policyAdapter: join('./', 'basic_policy.csv'),
    usernameFromContext: (ctx: any) => {
      // 获取用户名
      return ctx.state.user?.username;
    },
    userRolesContext: (ctx: any) => {
      // 获取角色
      return ctx.state.user?.roles;
    },
  },
  swagger: {
    title: 'API 文档',
    description: 'mn-admin API 文档',
    version: '1.0.1',
    auth: {
      authType: 'bearer',
    },
  },
  busboy: {
    mode: 'asyncIterator',
    limits: {
      //限制上传文件大小 20兆
      fileSize: 20 * 1024 * 1024,
    },
    defParamCharset: 'utf8',
    defCharset: 'utf8',
  },
  staticFile: {
    dirs: {
      default: {
        prefix: '/public/',
        dir: join(__dirname, '..', '..', 'download')
      },
    }
  },
} as MidwayConfig;
