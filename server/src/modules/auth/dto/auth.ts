import { Rule, RuleType } from '@midwayjs/validate';
/**
 * 登录参数校验
 */
export class LoginDTO {
  // 用户名
  @Rule(RuleType.string().required())
  username: string;

  // 密码
  @Rule(RuleType.string().required())
  password: string;

  // 验证码id
  @Rule(RuleType.required())
  captchaId: string;

  // 验证码
  @Rule(RuleType.required())
  captcha: string;

  @Rule(RuleType.boolean().optional())
  isQuick: boolean

  @Rule(RuleType.boolean().optional())
  isRemember: boolean
}
