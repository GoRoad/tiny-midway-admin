import _ from 'lodash-es'
import { usePermissionStore } from '@/store'

// 检查各个按钮是否有调用权限
const hasActionPermission = (prefix, type, btns) => {
  const path = prefix + ':' + type
  return btns.includes(path)
}

// 递归出里面的所有按钮类型
const getButtons = (arr) => {
  const btns = []
  const traverse = (items) => {
    items.forEach(({ type, code, children }) => {
      if (type === 'BUTTON') btns.push(code)
      if (children) traverse(children)
    })
  }
  traverse(arr)
  return btns
}

export const createPermissionOpt = (crudOpt, context) => {
  if (!context?.permission) return crudOpt
  const prefix = context.permission
  const permissionStore = usePermissionStore()
  const buts = getButtons(permissionStore.permissions)
  // 递归出里面的所有按钮类型
  const permissionOpt = {
    crudOptions: {
      actionbar: {
        buttons: {
          add: { show: hasActionPermission(prefix, 'add', buts) }
        }
      },
      rowHandle: {
        buttons: {
          edit: { show: hasActionPermission(prefix, 'edit', buts) },
          remove: { show: hasActionPermission(prefix , 'remove', buts) },
          view: { show: hasActionPermission(prefix, 'view', buts) }
        }
      }
    }
  }
  return _.merge(crudOpt, permissionOpt);
}