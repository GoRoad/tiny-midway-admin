export const AdminErrorEnum = {
  CAPTCHA_ERROR: {
    code: 10003,
    error: '验证码错误',
  },
  USR_PWD_ERROR: {
    code: 10002,
    error: '用户名密码错误!',
  },
  DICT_NOT_DATA: {
    code: 10003,
    error: '未找到字典!',
  },
  BAD_USER_DATA: {
    code: 11007,
    error: '用户数据异常!',
  },
  TIMEOUT_USER_DATA: {
    code: 11008,
    error: '用户数据已更新',
  },
};

export class CustomError extends Error {
  code: number | string;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

export class CaptchaError extends CustomError {
  constructor() {
    super(AdminErrorEnum.CAPTCHA_ERROR.error, AdminErrorEnum.CAPTCHA_ERROR.code);
  }
}
