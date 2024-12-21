import { request } from "@/utils";
import { dict, compute } from "@fast-crud/fast-crud";
import { formatDate, createPermissionOpt } from "@/utils";

import { ref } from "vue";
import * as _ from "lodash";


/**
 * 接口配置
 */

export const pageRequest = async (query) => {
  const { page, form, sort } = query;
  let _sort;
  if (sort?.prop) {
    const createSort = {};
    createSort[sort.prop] = sort.asc ? "asc" : "desc";
    _sort = JSON.stringify(createSort);
  }
  const params = { ...form, sort: _sort, ...page };
  const { data } = await request.post("/wechat/ai-bot/page", params);
  return data;
};

export const editRequest = async ({ form, row }) => {
  const { id } = row;
  return await request.put(`/wechat/ai-bot/${id}`, form);
};

export const delRequest = async ({ row }) => {
  const { id } = row;
  return await request.delete(`/wechat/ai-bot/${id}`, {});
};

export const addRequest = async ({ form }) => {
  return await request.post("/wechat/ai-bot/", form);
};

const validateArr = async (rule, value) => {
  if (!value) throw new Error("请选择用户的角色!");
};

function useSearchRemote(url) {
  let lastFetchId = 0;

  const state = {
    data: ref([]),
    loading: ref(false),
  };

  const fetch = _.debounce(async (value) => {
    lastFetchId += 1;
    const fetchId = lastFetchId;
    state.data.value = [];
    state.loading.value = true;
    const { data } = await request.get(url, { params: { q: value } });
    if (fetchId !== lastFetchId) return;
    state.data.value = data;
    state.loading.value = false;
  }, 800);

  return { fetch, state };
}

/**
 * 定义一个CrudOptions生成器方法
 */
export default function ({ crudExpose, context }) {
  const { fetch: fetchUser, state: userState } = useSearchRemote('/base/dict/wechat/wx-contact-filter');
  const { fetch: fetchGroup, state: groupState } = useSearchRemote('/base/dict/wechat/wx-group-filter');
  const opt = {
    crudOptions: {
      request: {
        pageRequest,
        addRequest,
        editRequest,
        delRequest,
      },
      columns: {
        id: {
          title: "ID",
          type: "number",
          readonly: true,
          column: {
            width: 60,
            sorter: "custom",
          },
          form: { disabled: true }
        },
        name: {
          title: "机器人名称",
          type: "text",
          search: {
            show: true,
            valueResolve({ key, value, form }) {
              if (value) {
                form[key] = value + "%";
              }
            },
          },
          form: {
            rule: [{ required: true, message: "请输入名称", trigger: "blur" }],
            // col: { span: 14 },
          },
          column: {
            width: 120,
          },
        },
        wxId: {
          title: '绑定微信',
          search: {
            show: true,
            rules: null,
          },
          type: 'dict-select',
          dict: dict({
            url: '/base/dict/wechat/wx-user',
          }),
          form: {
            helper: '只有绑定微信后ai才会生效',
            // rule: [{ required: true, message: '请选择一个微信号' }],
            // col: { span: 14 },
          },
          column: {
            width: 160,
          }
        },
        modelId: {
          title: 'AI模型',
          search: {
            show: true,
            rules: null,
          },
          type: 'dict-select',
          dict: dict({
            url: '/base/dict/openai/models',
          }),
          form: {
            rule: [{ required: true, message: '请选择一个AI模型' }],
            // col: { span: 14 },
          },
          column: {
            width: 160,
          }
        },
        useDataSource: {
          title: "存取聊天记录",
          type: 'dict-switch',
          form: {
            // col: { span: 14 }
          },
          dict: dict({
            data: [
              { value: true, label: '开启' },
              { value: false, label: '关闭' },
            ],
          }),
          column: { width: 120, }
        },
        emModelId: {
          title: '嵌入模型',
          search: {
            show: true,
            rules: null,
          },
          type: 'dict-select',
          dict: dict({
            url: '/base/dict/openai/models',
          }),
          form: {
            helper: '用于向量化聊天记录的存储和搜索',
            show: compute(({ form }) => {
              const show = form?.useDataSource
              return !!show;
            }),
            rule: [{ required: true, message: '请选择一个AI模型' }],
            // col: { span: 14 },
          },
          column: {
            width: 160,
          }
        },
        singleChatPrefix: {
          title: "触发关键字",
          type: "text",
          form: {
            // rule: [{ required: true, message: "请输入关键字", trigger: "change" }],
          },
          column: { show: false },
        },
        singleListMode: {
          title: "名单模式",
          type: 'dict-radio',
          form: {
            value: 1,
          },
          dict: dict({
            data: [
              { value: 1, label: '黑名单' },
              { value: 2, label: '白名单' },
            ],
          }),
          column: { show: false }
        },
        singleListId: {
          title: '名单',
          type: 'dict-select',
          column: { show: false },
          form: {
            col: { span: 20 },
            component: {
              name: 'fs-dict-select',
              multiple: true,
              filterable: true,
              remote: true,
              'reserve-keyword': true,
              placeholder: '输入昵称搜索联系人',
              options: userState.data,
              onSearch: (query) => {
                fetchUser(query);
              },
              loading: userState.loading,
            },
          },
        },
        groupChatPrefix: {
          title: "触发关键字",
          type: "text",
          form: {
            value: 'ai ',
            // rule: [{ required: true, message: "请输入关键字", trigger: "change" }],
          },
          column: { show: false },
        },
        groupListMode: {
          title: "名单模式",
          type: 'dict-radio',
          form: {
            value: 1,
          },
          dict: dict({
            data: [
              { value: 1, label: '黑名单' },
              { value: 2, label: '白名单' },
            ],
          }),
          column: { show: false }
        },
        groupListId: {
          title: '名单',
          type: 'dict-select',
          column: { show: false },
          form: {
            col: { span: 20 },
            component: {
              name: 'fs-dict-select',
              multiple: true,
              filterable: true,
              remote: true,
              'reserve-keyword': true,
              placeholder: '输入群名称搜索微信群',
              options: groupState.data,
              onSearch: (query) => {
                fetchGroup(query);
              },
              loading: groupState.loading,
            },
          },
        },
        // workflowId: {
        //   title: "工作流",
        //   search: {
        //     show: true,
        //     rules: null,
        //   },
        //   type: 'dict-select',
        //   dict: dict({
        //     // url: '/base/dict/wechat/wx-user1',
        //   }),
        //   form: {
        //     // rule: [{ required: true, message: '请选择一个工作流' }],
        //     col: { span: 14 },
        //   },
        //   column: {
        //     show: false
        //   }
        // },
        description: {
          title: "简介",
          type: "text",
          form: {
            component: { type: "textarea", clearable: false },
            col: { span: 18 },
          },
          column: {
            ellipsis: true,
          },
        },
        prompt: {
          title: "人设与回复逻辑",
          type: "text",
          form: {
            component: { type: "textarea", rows: 15, clearable: false },
            col: { span: 18 },
          },
          column: {
            show: false,
            ellipsis: true,
          },
        },
        // plugins: {
        //   title: "插件列表",
        //   type: "array",
        //   form: {
        //     component: { type: "select", mode: "multiple" },
        //     col: { span: 14 },
        //   },
        //   column: {
        //     show: false,
        //   },
        // },
        // dataSource: {
        //   title: "数据来源",
        //   type: "array",
        //   form: {
        //     component: { type: "input", mode: "tags" },
        //     col: { span: 14 },
        //   },
        //   column: {
        //     show: true,
        //     width: 160,
        //   },
        // },
        createdAt: {
          title: "创建时间",
          type: "text",
          addForm: { show: false },
          column: {
            width: 130,
            formatter({ value }) {
              return formatDate(value);
            },
          },
          form: {
            show: false
          }
        },
        updatedAt: {
          title: "更新时间",
          type: "text",
          addForm: { show: false },
          column: {
            width: 130,
            formatter({ value }) {
              return formatDate(value);
            },
          },
          form: {
            show: false
          }
        },
        // 关联表字段的处理
        workflow: {
          title: "工作流",
          type: "text",
          form: { show: false },
          column: {
            show: false,
          },
        },
      },
      form: {
        labelWidth: "160px",
        wrapper: {
          draggable: false,
          is: "n-drawer",
          width: 400,
          // onClosed(e) {
          //   console.log("onClosed", e);
          // },
          // onOpened(e) {
          //   console.log("onOpened", e);
          // },
        },
        group: {
          groupType: 'tabs',
          accordion: false,
          groups: {
            base: {
              tab: '基础设置',
              columns: ['id', 'name', 'wxId', 'modelId', 'useDataSource', 'emModelId', 'description', 'prompt'],
              slots: {
                tab: (scope) => {
                  return (
                    <span style={{ color: scope.hasError ? 'red' : 'green' }}>
                      <div class="flex items-center">
                        <p class="mr-5">基础设置</p>
                        <i class={'i-material-symbols:check-circle-outline text-16'} />
                      </div>
                    </span>
                  );
                },
              },
            },
            singleChat: {
              tab: '私聊设置',
              columns: ['singleChatPrefix', 'singleListMode', 'singleListId'],
              slots: {
                tab: (scope) => {
                  return (
                    <span style={{ color: scope.hasError ? 'red' : 'green' }}>
                      <div class="flex items-center">
                        <p class="mr-5">私聊设置</p>
                        <i class={'i-material-symbols:error-outline text-16'} />
                      </div>
                    </span>
                  );
                },
              },
            },
            groupChat: {
              tab: '群聊设置',
              columns: ['groupChatPrefix', 'groupListMode', 'groupListId'],
              slots: {
                tab: (scope) => {
                  return (
                    <span style={{ color: scope.hasError ? 'red' : 'green' }}>
                      <div class="flex items-center">
                        <p class="mr-5">群聊设置</p>
                        <i class={'i-material-symbols:error-outline text-16'} />
                      </div>
                    </span>
                  );
                },
              },
            },
          }
        }
      },
    },
  };
  return createPermissionOpt(opt, context);
}
