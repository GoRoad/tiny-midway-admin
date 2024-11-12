import { Provide, Inject } from '@midwayjs/core';
import { PrismaClient, Resource } from '@prisma/client';
import { CasbinService } from '../../base/service/casbin.service';

@Provide()
export class ResourceService {
  @Inject()
  prisma: PrismaClient;
  @Inject()
  casbinService: CasbinService;

  async getAllRouters() {
    return this.prisma.resource.findMany({
      orderBy: {
        order: 'asc',
      },
    });
  }

  async getMenuTree() {
    // 获取所有菜单项
    const menus = await this.prisma.resource.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    // 构建树形结构
    const menuMap = new Map<number, Resource>();
    const rootMenus: Resource[] = [];

    // 将所有菜单项添加到 menuMap 中
    menus.forEach(menu => {
      const menuWithChildren: any = { ...menu, children: [] };
      menuMap.set(menu.id, menuWithChildren);
    });

    // 递归构建树形结构
    const buildTree = (menu: any) => {
      const children = menus.filter(m => m.parentId === menu.id);
      children.forEach(child => {
        const childMenu = menuMap.get(child.id)!;
        menu.children.push(childMenu);
        buildTree(childMenu);
      });
    };

    // 处理根菜单项
    menus.forEach(menu => {
      if (menu.parentId === null) {
        const rootMenu = menuMap.get(menu.id)!;
        rootMenus.push(rootMenu);
        buildTree(rootMenu);
      }
    });

    return rootMenus;
  }

  async createMenu(data: any) {
    // 事务操作

    return this.prisma.resource.create({
      data,
    });
  }

  async updateMenu(id: number, data: any) {
    // 过滤code，不允许修改，防止跟权限表对不上
    delete data.code;
    return this.prisma.resource.update({
      where: { id },
      data,
    });
  }

  async deleteMenu(id: number) {
    // 判断是否有子菜单
    const children = await this.prisma.resource.findMany({
      where: { parentId: id },
    });
    // 如果有子菜单，则不能删除
    if (children.length > 0) {
      throw new Error('该菜单下有子菜单&按钮，请先删除子菜单&按钮!');
    }
    // 删除权限
    const resource = await this.prisma.resource.findUnique({
      where: { id },
    });
    await this.casbinService.clearDBRulesByV1('p', resource.code);
    return this.prisma.resource.delete({
      where: { id },
    });
  }
}
