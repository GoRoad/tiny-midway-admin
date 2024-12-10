import { request } from "@/utils";
import { dict } from "@fast-crud/fast-crud";
import { formatDate, createPermissionOpt } from "@/utils";

import { ref } from "vue";
import { useAuthStore } from "@/store";
import axios from "axios";

const _loading = ref(false);
console.log("_loading: ", _loading);

const { accessToken } = useAuthStore();
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

/**
 * 定义一个CrudOptions生成器方法
 */
export default function ({ crudExpose, context }) {
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
            col: { span: 14 },
          },
          column: {
            width: 100,
          },
        },
        description: {
          title: "简介",
          type: "text",
          form: {
            component: { type: "textarea", clearable: false },
            col: { span: 14 },
          },
          column: {
            width: 380,
            ellipsis: true,
          },
        },
        prompt: {
          title: "人设与回复逻辑",
          type: "text",
          form: {
            component: { type: "textarea", rows: 15, clearable: false },
            col: { span: 14 },
          },
          column: {
            show: true,
            ellipsis: true,
          },
        },
        plugins: {
          title: "插件列表",
          type: "array",
          form: {
            component: { type: "select", mode: "multiple" },
            col: { span: 14 },
          },
          column: {
            show: false,
          },
        },
        useDataSource: {
          title: "数据源权限",
          type: 'dict-switch',
          form: {
            col: { span: 14 }
          },
          dict: dict({
            data: [
              { value: true, label: '开启' },
              { value: false, label: '关闭' },
            ],
          }),
          column: { width: 120, }
        },
        dataSource: {
          title: "数据来源",
          type: "array",
          form: {
            component: { type: "input", mode: "tags" },
            col: { span: 14 },
          },
          column: {
            show: false,
          },
        },
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
        wx: {
          title: "绑定微信",
          type: "text",
          form: { show: false },
          column: {
            show: false,
          },
        },
      },
      form: {
        labelWidth: "120px",
        wrapper: {
          draggable: false,
          is: "n-drawer",
          width: 400,
          onClosed(e) {
            console.log("onClosed", e);
          },
          onOpened(e) {
            console.log("onOpened", e);
          },
        },
      },
    },
  };
  return createPermissionOpt(opt, context);
}
