import { Provide, Scope, ScopeEnum, Config, Init, Inject } from '@midwayjs/core';
import { PrismaAdapter } from 'casbin-prisma-adapter';
import * as casbin from 'casbin';
import { PrismaClient } from '@prisma/client';

type GetListTypeString = 'role' | 'policy';

export enum RuleAction {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum RulePossession {
  ANY = 'any',
  OWN = 'own',
  'ANY|OWN' = 'any|own',
}

export enum RuleResource {
  PROJECT_DATA = 'project_obj',
  SHCEMA_DATA = 'shcema_obj',
  USER_DATA = 'user_obj',
  COMMON_DATA = 'common_obj',
}

/**
 * casbin权限校验参数，
 * @isEnabled 是否启用，默认true，fasle则不校验或者使用自定义校验
 * @resource 操作资源(obj)
 * @action 操作(ation)
 * @possession 所有权标识，own表示只能操作自己的 obj
 * @isOwn 只有包含own时才回调，返回false则是无权限
 * @description  sub 取自 ctx，配置项在 userRolesContext
 */
export type RuleOptions = {
  isEnabled: boolean;
  resource: RuleResource;
  action: RuleAction;
  possession: RulePossession;
  isOwn: ((ctx: any) => boolean) | ((ctx: any) => Promise<boolean>);
};

// 单例模式
@Provide()
@Scope(ScopeEnum.Singleton)
export class CasbinService {
  @Inject('prisma')
  prismaClient: PrismaClient;

  @Config('casbin')
  casbinCfg;

  // TODO: 调用一次savePolicy，数据库的策略表会全部删除再插入一遍，真的难绷，少用慎用。
  enforcer: casbin.Enforcer;

  @Init()
  async init() {
    // 使用远程数据库的策略
    const policyAdapter = await PrismaAdapter.newAdapter();
    this.enforcer = await casbin.newEnforcer(this.casbinCfg.modelPath, policyAdapter);

    /***  ===== demo ===== */
    // Check the permission.
    // this.enforcer.enforce('alice', 'data1', 'read');
    // Modify the policy.
    // await e.addPolicy(...);
    // await e.removePolicy(...);
    // Save the policy back to DB.
    // await this.enforcer.savePolicy();

    // return this.enforcer;
  }

  /**
   * 根据数据库获取所有角色或策略
   *
   * @param type 类型，'role' 表示获取角色，'policy' 表示获取策略
   * @returns 返回根据类型对应的角色或策略列表
   */
  async getAllRolesAndPlicysByDB(type: GetListTypeString) {
    const ptype = type === 'role' ? 'g' : 'p';
    const data = await this.prismaClient.casbinRule.findMany({
      where: { ptype },
      select: {
        v0: true,
        v1: true,
      },
    });
    if (type === 'role') {
      return data.map(item => ({ name: item.v0, role: item.v1 }));
    } else {
      return data.map(item => ({ role: item.v0, policy: item.v1 }));
    }
  }

  // 校验权限
  async checkAccess(sub: string, obj: string) {
    return this.enforcer.enforce(sub, obj, 'access');
  }

  async getAdminPlocy(name: string = '') {
    const act = 'access'
    const plist = await this.enforcer.getPolicy();
    const accessList = plist.filter(arr => arr[2] === act);
    const result = [];
    accessList.forEach(item => {
      const [role, code] = item;
      const cur = result.find(item => item.role === role)
      if (cur) {
        cur.codes.push(code);
      } else {
        result.push({ role, codes: [code] });
      }
    });
    if (name) {
      return result.find(item => item.role === name).codes;
    }
    return result;
  }

  async getAdminGroup(name: string = '') {
    const glist = await this.enforcer.getGroupingPolicy();
    const result = [];
    glist.forEach(item => {
      const [user, role] = item;
      const cur = result.find(item => item.user === user)
      if (cur) {
        cur.roles.push(role);
      } else {
        result.push({ user, roles: [role] });
      }
    });
    if (name) {
      return result.find(item => item.user === name).roles;
    }
    return result;
  }

  async addAdminPolices(role: string, codes: string[], save: boolean = true) {
    if (!role) return Promise.reject('角色不能为空');
    if (!codes.length) return true;
    const act = 'access'
    // 转换为 casbin 需要的格式
    const policys = codes.map(code => [role, code, act]);
    const res = await this.enforcer.addPolicies(policys);
    if (save && res) {
      await this.enforcer.savePolicy();
    }
    return res;
  }

  async addAdminRole(username: string, roles: string[], save: boolean = true) {
    if (!username) return Promise.reject('用户名不能为空');
    if (!roles.length) return true;
    // 转换为 casbin 需要的格式
    const policys = roles.map(role => [username, role]);
    const res = await this.enforcer.addGroupingPolicies(policys);
    if (save && res) {
      await this.enforcer.savePolicy();
    }
    return;
  }

  async removeAdminRole(username: string, roles: string[], save: boolean = true) {
    if (!username) return Promise.reject('用户名不能为空');
    if (!roles.length) return true;
    // 转换为 casbin 需要的格式
    const policys = roles.map(role => [username, role]);
    const res = await this.enforcer.removeGroupingPolicies(policys);
    if (save && res) {
      await this.enforcer.savePolicy();
    }
    return;
  }

  async removeAdminPolicy(role: string, codes: string[], save: boolean = true) {
    if (!role) return Promise.reject('角色不能为空');
    if (!codes.length) return true;
    const act = 'access'
    // 转换为 casbin 需要的格式
    const policys = codes.map(code => [role, code, act]);
    const res = await this.enforcer.removePolicies(policys);
    if (save && res) {
      await this.enforcer.savePolicy();
    }
    return;
  }

  async diffAdminRole(username: string, roles: string[]) {
    // 获取该用户所有的角色
    const userRoles = await this.getAdminGroup();
    const curRoles = userRoles.find(item => item.user === username)?.roles || [];
    // 获取需要增加和删除的角色
    const addRoles = roles.filter(item => !curRoles.includes(item));
    const removeRoles = curRoles.filter(item => !roles.includes(item));
    return { addRoles, removeRoles };
  }

  async diffAdminPolicy(role: string, codes: string[]) {
    // 获取该角色所有的权限
    const rolePolicys = await this.getAdminPlocy();
    const curCodes = rolePolicys.find(item => item.role === role)?.codes || [];
    // 获取需要增加和删除的权限
    const addCodes = codes.filter(item => !curCodes.includes(item));
    const removeCodes = curCodes.filter(item => !codes.includes(item));
    return { addCodes, removeCodes };
  }

  async syncAdminRoleAndSave(username: string, roles: string[], save: boolean = true) {
    const { addRoles, removeRoles } = await this.diffAdminRole(username, roles);
    // 如果要操作的list全部为空则直接返回true
    if (!addRoles.length && !removeRoles.length) return true;
    // 不马上保存到数据库，等操作完成之后调用 savePolicy 保存
    await this.removeAdminRole(username, removeRoles, false);
    await this.addAdminRole(username, addRoles, false);
    return save ? await this.enforcer.savePolicy() : false;
  }

  async syncAdminPolicyAndSave(role: string, codes: string[], save: boolean = true) {
    const { addCodes, removeCodes } = await this.diffAdminPolicy(role, codes);
    // 如果要操作的list全部为空则直接返回true
    if (!addCodes.length && !removeCodes.length) return true;
    // 不马上保存到数据库，等操作完成之后调用 savePolicy 保存
    await this.removeAdminPolicy(role, removeCodes, false);
    await this.addAdminPolices(role, addCodes, false);
    return save ? await this.enforcer.savePolicy() : false;
  }

  async syncAdminLoadAndSave(username: string, roles: string[], role: string, codes: string[]) {
    // 从数据库载入最新的策略
    await this.enforcer.loadPolicy();
    // 同步角色和权限
    const save1 = await this.syncAdminRoleAndSave(username, roles, false);
    const save2 = await this.syncAdminPolicyAndSave(role, codes, false);
    if (save1 && save2) {
      return true;
    } else {
      return await this.enforcer.savePolicy();
    }
  }

  async syncAdminDBRules(
    ptype: string,
    v0: string,
    v1: string[],
    v2: string = '',
    client: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"> = this.prismaClient,
  ) {
    // 先清空该用户的所有角色
    await client.casbinRule.deleteMany({
      where: {
        ptype,
        v0,
      },
    });
    // 然后插入新的角色
    for (const obj of v1) {
      const data = {
        ptype,
        v0,
        v1: obj,
      };
      if (v2) data['v2'] = v2;
      await client.casbinRule.create({
        data,
      });
    }
  }

  async clearDBRulesByV0(
    ptype: string,
    v0: string,
    client: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"> = this.prismaClient,
  ) {
    if (!v0) return Promise.reject('name标识不能为空');
    await client.casbinRule.deleteMany({
      where: {
        ptype,
        v0,
      },
    });
  }


  async clearDBRulesByV1(
    ptype: string,
    v1: string,
    client: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"> = this.prismaClient,
  ) {
    // 如果code为空，则会清空所有用户，所以需要限制，code为空就报错
    // 假设 role-a = [read,write] role-b = [read,write]
    // 删除 delete p,read
    // 则 role-a = [read] role-b = [write]
    // if (!code) throw new MidwayError('权限标识不能为空', '5002');
    if (!v1) return Promise.reject('code标识不能为空');
    await client.casbinRule.deleteMany({
      where: {
        ptype,
        v1,
      },
    });
  }
}
