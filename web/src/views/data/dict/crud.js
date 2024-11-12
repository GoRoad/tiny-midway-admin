import { request } from '@/utils'
import { formatDate } from '@/utils'
import { dict } from '@fast-crud/fast-crud';
/**
 * 接口配置
 */

export const pageRequest = async (query) => {
  const { page, form, sort } = query
  let _sort
  if (sort?.prop) {
    const createSort = {}
    createSort[sort.prop] = sort.asc ? 'asc' : 'desc'
    _sort = JSON.stringify(createSort)
  }
  const params = { ...form, sort: _sort, ...page }
  const { data } = await request.post('/data/dict/page', params)
  return data
}

export const editRequest = async ({ form, row }) => {
  const { id } = row
  return await request.put(`/data/dict/${id}`, form)
}

export const delRequest = async ({ row }) => {
  const { id } = row
  return await request.delete(`/data/dict/${id}`, {})
}

export const addRequest = async ({ form }) => {
  return await request.post('/data/dict', form)
}

const ADD_EDIT_JSON_OPT = {
  component: {
    mode: 'code'
  },
  col: {span:24},
  valueBuilder({ form }) {
    if (form.json == null) {
      return
    }
    form.json = JSON.parse(form.json)
  },
  valueResolve({ form }) {
    if (form.json == null) {
      return
    }
    form.json = JSON.stringify(form.json)
  },
}

const VIEW_JSON_OPT = {
  col: {span:24},
  component: {
    modes: ['view'],
    mode: 'view'
  },
  valueBuilder({ form }) {
    if (form.json == null) {
      return
    }
    form.json = JSON.parse(form.json)
  },
}

/**
 * 定义一个CrudOptions生成器方法
 */
export default function ({ crudExpose, context }) {
  return {
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
          title: '字典名称',
          type: 'text', //字段类型，fs会根据字段类型，生成出一些默认配置
          search: {
            show: true,
            valueResolve({ key, value, form }) { // 利用格式转换实现模糊查询功能
              if (value) {
                // 如果查询name加上%结尾, 表示使用(contains)模糊查询
                form[key] = value + '%'
              }
            }
          },
          form: {
            rule: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
            component: {
              maxlength: 5, // 原生属性要写在这里
              props: {
                type: 'text',
                showWordLimit: true,
              },
            },
          },
        },
        code: {
          title: '编码名称',
          type: 'text',
          form: {
            rule: [{ required: true, pattern: /^(?!.*[^\w]).{3,16}$/, message: '长度为3-16，不能包含特殊字符', trigger: 'blur' }],
          }
        },
        remark: {
          title: '描述',
          type: 'text',
          form: {
            helper: '建议添加字典的功能描述',
          }
        },
        json: {
          title: 'json',
          type: 'json',
          column: {
            show: false
          },
          addForm: ADD_EDIT_JSON_OPT,
          editForm: ADD_EDIT_JSON_OPT,
          viewForm: VIEW_JSON_OPT,
        },
        enabled: {
          title: '启用',
          type: 'dict-radio',
          search: { show: true },
          dict: dict({
            data: [
              { value: true, label: '启用' },
              { value: false, label: '禁用' },
            ]
          }),
          form: {
            value: true,
          },
        },
        createTime: {
          title: '创建时间',
          type: 'text', //字段类型，fs会根据字段类型，生成出一些默认配置
          addForm: { show: false },
          column: {
            formatter({ value, row, i }) {
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
            formatter({ value, row, i }) {
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
  };
}