import { Provide, Inject } from '@midwayjs/core';
import { PrismaClient, Resource } from '@prisma/client';

@Provide()
export class DictService {
  @Inject()
  prisma: PrismaClient;

  async getDictFromDB(code: string) {
    const str = await this.prisma.dict.findFirst(
      {
        where: {code, enabled: true},
        select: {
          json: true,
        },
      },
    );
    return str?.json ? JSON.parse(str.json) : null;
  }

  async getMenuDict() {
    // 获取所有菜单项
    const menus = await this.prisma.resource.findMany({
      where: {
        enable: true
      },
      orderBy: {
        order: 'asc',
      },
      select: {
        id: true,
        parentId: true,
        name: true,
        code: true,
      }
    });

    // 构建树形结构
    const menuMap = new Map<number, Resource>();
    const rootMenus: Resource[] = [];

    // 将所有菜单项添加到 menuMap 中
    menus.forEach(menu => {
      const menuWithChildren: any = {
        id: menu.id,
        parentId: menu.parentId,
        name: menu.name,
        code: menu.code,
        children: []
      };
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

  async getRoleDict() {
    const data = await this.prisma.role.findMany();
    return data.map(item => ({ value: item.code, label: item.name }));
  }

  async getWxUserDict() {
    const data = await this.prisma.wxUser.findMany();
    const res = data.map(item => {
      return { value: item.wxId, label: item.nickName }
    })
    return res
  }

  async aiModelDict() {
    const data = await this.prisma.aIModelConfig.findMany();
    const res = data.map(item => {
      return { value: item.id, label: item.name }
    })
    return res
  }
  
  async openaiSubTypes() {
    return [
      { value: 1, label: '对话' },
      { value: 2, label: '嵌入' },
      { value: 3, label: '视觉' },
      { value: 4, label: '视频' },
      { value: 5, label: '语音' },
      { value: 6, label: '生图' },
      { value: 7, label: 'tools' },
      { value: 8, label: '排序' },
    ]
  }

  async getWxContactFilterDict(q: string = undefined) {
    const data = await this.prisma.wxContact.findMany({
      where: {
        nickName: {
          contains: q,
        },
      },
    });
    const res = data.map(item => {
      return { value: item.id, label: item.nickName }
    })
    return res
  }

  async getWxGroupFilterDict(q: string = undefined) {
    const data = await this.prisma.wxGroup.findMany({
      where: {
        nickName: {
          contains: q,
        },
      },
    });
    const res = data.map(item => {
      return { value: item.id, label: item.nickName }
    })
    return res
  }

  async aiToolDict() {
    const data = await this.prisma.tool.findMany();
    const res = data.map(item => {
      return { value: item.id, label: item.name }
    })
    return res
  }
}
