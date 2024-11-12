import { Provide, Inject } from '@midwayjs/core';
import { PrismaClient } from '@prisma/client';
import { DictService } from '../service/dict.service';
import { CasbinService } from '../../base/service/casbin.service';
import { ResourceService } from '../../system/service/resource.service';
import * as _ from 'lodash';

@Provide()
export class UserService {
  @Inject()
  prisma: PrismaClient;
  @Inject()
  casbinService: CasbinService;
  @Inject()
  dictService: DictService;
  @Inject()
  resourceService: ResourceService;

  async getUserInfo(id: number) {
    const profile = await this.prisma.user.findUnique({
      where: { id }
    });
    const _rules = await this.casbinService.getAdminGroup(profile.username);
    const roleDict = await this.dictService.getRoleDict();
    // const rules = [{ code: "SUPER_ADMIN", name: "超级管理员", enable: true }]
    const userRules = roleDict
      .filter(item => _rules.includes(item.value)) // 筛选出不在数组 a 中的对象
      .map(item => ({ code: item.value, name: item.label, enable: true })); // 转换成指定格式的对象
    const currentRole = userRules[0];
    const roles = userRules;
    const safeProfile = _.omit(profile, ['password']);
    return {
      id: profile.id,
      username: profile.username,
      profile: safeProfile,
      currentRole,
      roles
    }
  }

  // 取用户菜单树
  async getMenus(name: string) {
    // 拍平菜单的code权限列表
    const getCodeList = (list: any[]) => {
      // 递归读取children
      const codes = []
      const getCode = (curlist: any[]) => {
        for (const item of curlist) {
          codes.push(item.code);
          if (item.children && item.children.length > 0) {
            getCode(item.children);
          }
        }
      }
      getCode(list);
      return codes;
    }
    // 获取code权限校验过的code列表，[obj1,obj2,obj3,...]
    const treeData = await this.resourceService.getMenuTree();
    const objList = getCodeList(treeData);
    // 批量校验obj权限
    const requests = objList.map(obj => [name, obj, 'access']);
    // console.log('@权限校验requests: ', requests);
    // 批量校验obj权限得到结果，[true,true,false,...]
    const pass = await this.casbinService.enforcer.batchEnforce(requests);
    // console.log('@权限校验result: ', pass);
    // 得到有权限的obj列表，[obj1,obj2,...]
    const result = objList.filter((item, index) => pass[index]);
    // console.log('@权限校验result: ', result);
    // 迭代treeData检查权限，返回有权限的treeData菜单列表
    function filterArray(arr, arr2) {
      return arr.map(item => {
        const newItem = { ...item }; // 创建一个新的对象以避免修改原对象
        if (newItem.children) {
          newItem.children = filterArray(newItem.children, arr2);
        }
        return newItem;
      }).filter(item => arr2.includes(item.code) || (item.children && item.children.length > 0));
    }
    const res = filterArray(treeData, result);
    return res;
  }
}
