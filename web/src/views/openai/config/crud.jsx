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
  const res = await request.get('/openai/model/test', { params: {modelName: form.name} })
  $message.info(res.data || '测试失败')
  return
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
            width: 80,
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
        },
        type: {
          title: "模型类型",
          type: "dict-select",
          search: { show: true },
          form: {
            value: 'openAi',
            rule: [{ required: true, message: '请选择', trigger: 'blur' }],
          },
          dict: dict({
            data: [
              { value:'openAi', label:'OpenAi' },
              { value:'local', label:'本地模型' },
            ]
          }),
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
          form: {
            value: 'gpt-3.5',
            helper: '如：gpt-3.5，基础模型需要与供应商的模型名称一致',
            rule: [{ required: true, message: '请输入内容', trigger: 'blur' }],
          },
          type: 'text',
        },
        temperature: {
          title: '温度',
          type: 'text',
          column: {
            show: false,
          }
        },
        maxTokens: {
          title: 'token上限',
          type: 'text',
          column: {
            show: false,
          }
        },
        updateTime: {
          title: '验证可用性',
          form: { show: false },
          column: {
            render(context) {
              console.log('context scope', context.row.name);
              return (
                <div>
                  <n-button onClick={ () => testAi(context.row) }>测试</n-button>
                </div>
              );
            },
          },
        },
        createTime: {
          title: '创建时间',
          type: 'text',
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