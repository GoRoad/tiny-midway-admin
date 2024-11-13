import { request } from '@/utils'
import { dict } from '@fast-crud/fast-crud'
import { formatDate, createPermissionOpt } from '@/utils'
/**
 * 接口配置
 */

export const pageRequest = async (query) => {
  const { page, form, sort } = query
  let _sort
  if (sort?.prop) {
    const createSort = {}
    createSort[sort.prop] = sort.asc ? 'asc': 'desc'
    _sort = JSON.stringify(createSort)
  }
  const params = { ...form, sort: _sort, ...page }
  const { data } = await request.post('/demo/crud/page', params)
  return data
}

export const editRequest = async ({ form, row }) => {
  const { id } = row
  return await request.put(`/demo/crud/${id}`, form)
}

export const delRequest = async ({ row }) => {
  const { id } = row
  return await request.delete(`/demo/crud/${id}`, {})
}

export const addRequest = async ({ form }) => {
  return await request.post('/demo/crud', form)
}

/**
 * 定义一个CrudOptions生成器方法
 */
export default function ({ crudExpose, context }) {
  const opt = {
    crudOptions: {
      // 在这里自定义你的crudOptions配置
      request: {
        pageRequest,
        addRequest,
        editRequest,
        delRequest
      },
      //这里定义两个字段
      columns: {
        _index: {
          title: '序号',
          type: 'text',
          form: { show: false },
          column: {
            // type: 'index',
            align: 'center',
            width: '55px',
            columnSetDisabled: true, //禁止在列设置中选择
            formatter: (context) => {
              //计算序号,你可以自定义计算规则，此处为翻页累加
              const index = context.index ?? 1;
              const pagination = crudExpose.crudBinding.value.pagination;
              return ((pagination.current ?? 1) - 1) * pagination.pageSize + index + 1;
            }
          }
        },
        id: {
          title: 'id',
          type: 'text', //字段类型，fs会根据字段类型，生成出一些默认配置
          // crud自定义字段，效果就是在添加和编辑时都看不到这个字段
          readonly: true,
          column: { //表格列的一些配置
            width: 80,
            sorter: 'custom', // 排序
          }
        },
        name: {
          title: '姓名',
          type: 'text', //字段类型，fs会根据字段类型，生成出一些默认配置
          search: {
            show: true,
            valueResolve({ key, value, form }) { // 利用格式转换实现模糊查询功能
              if(value) {
                // 如果查询name加上%结尾, 表示使用(contains)模糊查询
                form[key] = value + '%'
              }
            }
          },
          form: {
            helper: '添加和编辑时必填，编辑时额外需要校验长度',
            rule: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
            component: {
              maxlength: 12, // 原生属性要写在这里
              props: {
                type: 'text',
                showWordLimit: true,
              },
            },
          },
          editForm: {
            rule: [{ required: true, pattern: /^.{2,12}$/, message: '长度为2-12', trigger: 'blur' }],
          },
        },
        desc: {
          title: '描述',
          type: 'text', //字段类型，fs会根据字段类型，生成出一些默认配置
          column: { //表格列的一些配置
            resizable: true,
            width: 200
          }
        },
        gender: {
          title: "性别",
          type: "dict-select",
          search: { show: true },
          dict: dict({
            url: '/base/dict?code=gender'
          }),
        },
        createTime: {
          title: '创建时间',
          type: 'text', //字段类型，fs会根据字段类型，生成出一些默认配置
          addForm: { show: false },
          column: {
            formatter({value, row, i}){
              return formatDate(value)
            },
          },
          form: {
            component: { disabled: true }
          }
        },
        updateTime: {
          title: '更新时间',
          type: 'text', //字段类型，fs会根据字段类型，生成出一些默认配置
          addForm: { show: false },
          column: {
            formatter({value, row, i}){
              return formatDate(value)
            },
          },
          form: {
            component: { disabled: true }
          }
        },
      },
      // 禁止naiveui在所有表单拖动
      form: {
        wrapper: {
          draggable: false,
        }
      }
    }
  }
  // 按钮权限处理
  return createPermissionOpt(opt, context)
}