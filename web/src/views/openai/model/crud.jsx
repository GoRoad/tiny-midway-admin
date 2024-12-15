import { request } from '@/utils'
import { dict } from '@fast-crud/fast-crud'
import { formatDate, createPermissionOpt } from '@/utils'

import { ref } from 'vue'
import { useAuthStore } from '@/store'
import axios from 'axios'

const _loading = ref(false)
console.log('_loading: ', _loading);

const { accessToken } = useAuthStore()
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
  const { data } = await request.post('/openai/model/page', params)
  return data
}

export const editRequest = async ({ form, row }) => {
  const { id } = row
  return await request.put(`/openai/model/${id}`, form)
}

export const delRequest = async ({ row }) => {
  const { id } = row
  return await request.delete(`/openai/model/${id}`, {})
}

export const addRequest = async ({ form }) => {
  return await request.post('/openai/model/', form)
}

const testAi = async (form) => {
  // 不使用拦截器处理code，防止触发框架逻辑
  // 获取完整的http信息用于判断模型接口状态
  const url = import.meta.env.VITE_AXIOS_BASE_URL + '/openai/model/test'
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    params: {id: form.id},
    timeout: 6000,
  }
  try {
    _loading.value = true
    const res = await axios.get(url, config)
    const { code, data, message } = res.data
    return $message.info(`code: ${code} data: ${data} message: ${message}`)
  } catch (error) {
    const { status, message } = err
    return $message.error(`data: ${status} message: ${message}`)
  } finally {
    _loading.value = false
  }
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
        // _index: {
        //   title: '序号',
        //   type: 'text',
        //   form: { show: false },
        //   column: {
        //     // type: 'index',
        //     align: 'center',
        //     width: '55px',
        //     columnSetDisabled: true, //禁止在列设置中选择
        //     formatter: (context) => {
        //       //计算序号,你可以自定义计算规则，此处为翻页累加
        //       const index = context.index ?? 1;
        //       const pagination = crudExpose.crudBinding.value.pagination;
        //       return ((pagination.current ?? 1) - 1) * pagination.pageSize + index + 1;
        //     }
        //   }
        // },
        id: {
          title: 'id',
          type: 'text',
          // crud自定义字段，效果就是在添加和编辑时都看不到这个字段
          readonly: true,
          column: { //表格列的一些配置
            width: 70,
            sorter: 'custom', // 排序
          }
        },
        name: {
          title: '模型名称',
          type: 'text',
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
            rule: [{ required: true, message: '请输入内容', trigger: 'blur' }],
          },
          column: {
            width: 150,
          }
        },
        type: {
          title: "模型类型",
          type: "dict-select",
          search: { show: true },
          form: {
            value: 'openAi',
            helper: '不限于OpenAI，使用OpenAI接口格式的模型都能兼容',
            rule: [{ required: true, message: '请选择', trigger: 'blur' }],
          },
          dict: dict({
            data: [
              { value:'openAi', label:'OpenAi' },
              { value:'local', label:'本地模型' },
            ]
          }),
        },
        subType: {
          title: '模型能力',
          search: {
            show: true,
            rules: null,
          },
          type: 'dict-select',
          dict: dict({
            url: '/base/dict/openai/sub-types',
          }),
          form: {
            component: {
              helper: '给模型进行功能标记，请按照模型实际能力勾选',
              multiple: true,
            },
            rule: [{ required: true, message: '请选择一个模型能力' }],
          },
        },
        apiKey: {
          title: '密钥',
          type: 'text',
          form: {
            rule: [{ required: true, message: '请输入内容', trigger: 'blur' }],
          },
          search: { show: false },
          column: {
            show: false,
          }
        },
        baseURL: {
          title: 'api地址',
          type: 'text',
          form: {
            component: { placeholder: 'https://www.openai.com/v1' },
            rule: [{ required: true, message: '请输入内容', trigger: 'blur' }],
          },
          search: { show: false },
          column: {
            width: 260,
            ellipsis: true,
          }
        },
        model: {
          title: '基础模型',
          type: 'text',
          form: {
            value: 'gpt-3.5',
            helper: '如：gpt-3.5，基础模型需要与供应商的模型名称一致',
            rule: [{ required: true, message: '请输入内容', trigger: 'blur' }],
          },
          column: {
            ellipsis: true,
          }
        },
        temperature: {
          title: '温度',
          type: 'text',
          form: {
            component: { placeholder: '选填' },
            valueResolve(context) {
              context.form.temperature = +context.form.temperature
            },
          },
          column: {
            show: false,
          }
        },
        maxTokens: {
          title: 'token上限',
          type: 'text',
          form: {
            component: { placeholder: '选填' },
            valueResolve(context) {
              context.form.maxTokens = +context.form.maxTokens
            }, 
          },
          column: {
            show: false,
          }
        },
        _opt: {
          title: '测试接口',
          form: { show: false },
          column: {
            width: 100,
            render(context) {
              console.log('context scope', context.row.name);
              return (
                <div>
                  <n-button loading={_loading.value} onClick={() => testAi(context.row)}>测试</n-button>
                </div>
              );
            },
          },
        },
        // createTime: {
        //   title: '创建时间',
        //   type: 'text',
        //   addForm: { show: false },
        //   column: {
        //     formatter({ value, row, i }) {
        //       return formatDate(value)
        //     },
        //   },
        //   form: {
        //     component: { disabled: true }
        //   }
        // },
        // updateTime: {
        //   title: '更新时间',
        //   type: 'text',
        //   addForm: { show: false },
        //   column: {
        //     formatter({ value, row, i }) {
        //       return formatDate(value)
        //     },
        //   },
        //   form: {
        //     component: { disabled: true }
        //   }
        // },
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