import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const main = async () => {
  console.log('Start seeding ...');
  const ADMIN_ROLE_NAME = 'admin_role';
  const GUEST_ROLE_NAME = 'guest_role';
  // 创建内置的超级管理员角色
  await prisma.role.create({
    data: {
      name: '系统管理员',
      code: ADMIN_ROLE_NAME,
      system: true,
    },
  });
  // 默认新建的用户都是来宾角色
  await prisma.role.create({
    data: {
      name: '来宾',
      code: GUEST_ROLE_NAME,
      system: true,
    },
  });
  // 创建内置的超级管理员角色 root
  await prisma.$transaction(async (client) => {
    await client.user.create({
      data: {
        username: 'root',
        nickName: '超级管理员',
        system: true,
        password: '$2b$10$dWS9VrIbCuXhn2faiukhWeXSyD0vS6Fn62GCxq8HHHrt0sOGKguzq',
      },
    });
    await client.user.create({
      data: {
        username: 'admin',
        nickName: '管理员',
        password: '$2b$10$dWS9VrIbCuXhn2faiukhWeXSyD0vS6Fn62GCxq8HHHrt0sOGKguzq',
      },
    });
    // 添加角色权限
    await client.casbinRule.create({
      data: {
        ptype: 'g',
        v0: 'root',
        v1: ADMIN_ROLE_NAME,
      },
    });
    await client.casbinRule.create({
      data: {
        ptype: 'g',
        v0: 'admin',
        v1: ADMIN_ROLE_NAME,
      },
    });
  })

  /**
   * 插入数据到数据库中
   *
   * @param table 要插入数据的表
   * @param keys 要插入数据的字段名称数组
   * @param values 要插入的数据值数组，数组中的元素顺序与 keys 数组中的字段名称顺序相对应
   * @param whereIndex 指定哪个字段作为查询条件，用于在插入后获取刚插入的数据。默认为 -1，表示不查询刚插入的数据
   * @returns 如果 whereIndex 大于 -1，则返回刚插入的数据；否则返回 true
   */
  const insertSql = async (table: string, keys: string[], values: any[], whereIndex: number = -1) => {
    // 生成插入语句
    const insertQuery = `
      INSERT INTO "${table}" (${keys.map(key => `"${key}"`).join(', ')})
      VALUES (${values.map((_, i) => `$${i + 1}`).join(', ')});
    `;

    // 执行插入操作
    await prisma.$executeRawUnsafe(insertQuery, ...values);

    if (whereIndex > -1) {
      // 返回刚插入的数据
      return await prisma.resource.findFirst({
        where: {
          name: values[whereIndex]
        }
      });
    } else {
      return { id: null };
    }
  };

  // 插入资源数据
  const resourceKeys = ["name", "code", "type", "parent_id", "path", "redirect", "icon", "component", "layout", "keepAlive", "method", "description", "show", "enable", "order", "createTime", "updateTime"];
  // 基础功能
  let parent = await insertSql('resource', resourceKeys, Array.of<any>('基础功能', 'Base', 'MENU', null, null, null, 'i-fe:grid', null, '', null, null, null, 1, 1, 0, 1729182565455, 1729182565455), 0) as any;
  await insertSql('resource', resourceKeys, Array.of<any>('图标 Icon', 'Icon', 'MENU', parent.id, '/base/icon', null, 'i-fe:feather', '/src/views/base/unocss-icon.vue', '', null, null, null, 1, 1, 0, 1729182631376, 1729182631376));
  await insertSql('resource', resourceKeys, Array.of<any>('基础组件', 'BaseComponents', 'MENU', parent.id, '/base/components', null, 'i-me:awesome', '/src/views/base/index.vue', '', null, null, null, 1, 1, 1, 1729182694990, 1729182694990));
  await insertSql('resource', resourceKeys, Array.of<any>('Unocss', 'Unocss', 'MENU', parent.id, '/base/unocss', null, 'i-me:awesome', '/src/views/base/unocss.vue', '', null, null, null, 1, 1, 2, 1729182757663, 1729182757663));
  await insertSql('resource', resourceKeys, Array.of<any>('KeepAlive', 'KeepAlive', 'MENU', parent.id, '/base/keep-alive', null, 'i-me:awesome', '/src/views/base/keep-alive.vue', '', 1, null, null, 1, 1, 3, 1729182816011, 1729182816011));
  await insertSql('resource', resourceKeys, Array.of<any>('MeModal', 'TestModal', 'MENU', parent.id, '/testModal', null, 'i-me:dialog', '/src/views/base/test-modal.vue', '', null, null, null, 1, 1, 4, 1729182852055, 1729182852055));
  // 业务示例Demo
  parent = await insertSql('resource', resourceKeys, Array.of<any>('业务示例', 'Demo', 'MENU', null, null, null, 'i-fe:grid', null, '', null, null, null, 1, 1, 1, 1729182885385, 1729182885385), 0);
  await insertSql('resource', resourceKeys, Array.of<any>('图片上传', 'ImgUpload', 'MENU', parent.id, '/demo/upload', null, 'i-fe:image', '/src/views/demo/upload/index.vue', '', 1, null, null, 1, 1, 0, 1729182922104, 1729182922104));
  await insertSql('resource', resourceKeys, Array.of<any>('CRUD表单', 'CrudDemo', 'MENU', parent.id, '/demo/crud', null, 'i-fe:database', '/src/views/demo/crud/index.vue', '', 1, null, null, 1, 1, 0, 1729182922104, 1729182922104));
  await insertSql('resource', resourceKeys, Array.of<any>('富文本', 'DemoRichText', 'MENU', parent.id, '/demo/rich-text', null, 'i-fe:database', '/src/views/demo/rich-text/index.vue', '', 1, null, null, 1, 1, 0, 1729182922104, 1729182922104));
  // 数据管理
  parent = await insertSql('resource', resourceKeys, Array.of<any>('数据管理', 'Data', 'MENU', null, null, null, 'i-fe:grid', null, '', null, null, null, 1, 1, 1, 1729182885385, 1729182885385), 0);
  await insertSql('resource', resourceKeys, Array.of<any>('数据字典', 'DataDict', 'MENU', parent.id, '/data/dict', null, 'i-fe:book', '/src/views/data/dict/index.vue', '', 1, null, null, 1, 1, 0, 1729182922104, 1729182922104));
  await insertSql('resource', resourceKeys, Array.of<any>('文件管理', 'DataFile', 'MENU', parent.id, '/data/file', null, 'i-fe:file', '/src/views/data/file/index.vue', '', 1, null, null, 1, 1, 0, 1729182922104, 1729182922104));
  // 系统管理
  parent = await insertSql('resource', resourceKeys, Array.of<any>('系统管理', 'SysMgt', 'MENU', null, null, null, 'i-fe:grid', null, '', null, null, null, 1, 1, 2, 1729217819578, 1729217819578), 0);
  await insertSql('resource', resourceKeys, Array.of<any>('资源管理', 'ResourceMgt', 'MENU', parent.id, '/system/resource', null, 'i-fe:list', '/src/views/system/resource/index.vue', '', null, null, null, 1, 1, 0, 1729218241039, 1729218241039));
  await insertSql('resource', resourceKeys, Array.of<any>('角色管理', 'RoleMgt', 'MENU', parent.id, '/system/role', null, 'i-fe:user-check', '/src/views/system/role/index.vue', '', null, null, null, 1, 1, 1, 1729218286003, 1729218286003));
  parent = await insertSql('resource', resourceKeys, Array.of<any>('用户管理', 'UserMgt', 'MENU', parent.id, '/system/user', null, 'i-fe:users', '/src/views/system/user/index.vue', '', null, null, null, 1, 1, 2, 1729218355262, 1729218355262), 0);
  // 角色管理下面添加一个按钮
  await insertSql('resource', resourceKeys, Array.of<any>('删除', 'UserBtnDel', 'BUTTON', parent.id, null, null, null, null, '', null, null, null, 1, 1, 0, 1729218654933, 1729218654933));
  // 插入个人资料菜单
  await insertSql('resource', resourceKeys, Array.of<any>('个人资料', 'UserProfile', 'MENU', null, '/profile', null, 'i-fe:user', '/src/views/profile/index.vue', '', null, null, null, 0, 1, 3, 1729218405995, 1729218405995));

  // 插入admin角色资源权限
  const casinbKeys = ["ptype", "v0", "v1", "v2", "v3", "v4", "v5"];
  const acessCodes= ['Base', 'Icon', 'BaseComponents', 'Unocss', 'KeepAlive', 'TestModal', 'Demo', 'ImgUpload', 'CrudDemo', 'DemoRichText', 'Data', 'DataDict', 'DataFile', 'SysMgt', 'ResourceMgt', 'RoleMgt', 'UserMgt', 'UserBtnDel', 'UserProfile'];
  for (const code of acessCodes) {
    await insertSql('casbin_rule', casinbKeys, Array.of<any>('p', ADMIN_ROLE_NAME, code, 'access', null, null, null));
  }

  // 插入文件管理
  await prisma.fileCategory.create({
    data: {
      name: '其他',
      system: true
    },
  });

  // 插入字典
  await prisma.dict.create({
    data: {
      name: '性别',
      code: 'gender',
      json: '[{"label":"女","value":0},{"label":"男","value":1}]',
      remark: '0女1男',
      enabled: true
    },
  });

  // 示例数据
  await prisma.demo.create({
    data: {
      name: '性别',
      gender: 1,
      desc: '这是一个例子'
    },
  });
  console.log('Seeding finished.');
};
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
