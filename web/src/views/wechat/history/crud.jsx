import { request } from "@/utils";
import { dict, compute } from "@fast-crud/fast-crud";
import { formatDateTime, createPermissionOpt } from "@/utils";

import { ref } from "vue";
import { ellipsisProps } from "naive-ui";

const _loading = ref(false);

/**
 * 接口配置
 */
const API_PREFIX = "/wechat/history";

export const pageRequest = async (query) => {
  const { page, form, sort } = query;
  let _sort;
  if (sort?.prop) {
    const createSort = {};
    createSort[sort.prop] = sort.asc ? "asc" : "desc";
    _sort = JSON.stringify(createSort);
  }
  const params = { ...form, sort: _sort, ...page };
  const { data } = await request.post(API_PREFIX + "/page", params);
  return data;
};

export const editRequest = async ({ form, row }) => {
  const { id } = row;
  return await request.put(API_PREFIX + `/${id}`, form);
};

export const delRequest = async ({ row }) => {
  const { id } = row;
  return await request.delete(API_PREFIX + `/${id}`, {});
};

export const addRequest = async ({ form }) => {
  return await request.post(API_PREFIX + "/", form);
};

/**
 * 定义一个CrudOptions生成器方法
 */
export default function ({ expose, context }) {
  const opt = {
    crudOptions: {
      request: {
        pageRequest,
        addRequest,
        editRequest,
        delRequest,
      },
      actionbar: { show: false },
      rowHandle: {
        align: 'center',
        width: "80",
        buttons: {
          view: { disabled:false, },
          edit: { show: false, },
          remove: { show: false },
        }
      },
      columns: {
        _index: {
          title: "序号",
          form: { show: false },
          column: {
            align: "center",
            width: "55px",
            columnSetDisabled: true, //禁止在列设置中选择
            formatter: (context) => {
              let index = context.index ?? 1;
              let pagination = expose.crudBinding.value.pagination;
              return (((pagination.currentPage ?? 1) - 1) * pagination.pageSize + index + 1);
            },
          },
        },
        'group.nickName': {
          title: "群名称",
          type: "text",
          search: {
            show: true,
          },
          column: {
            width: 120,
          },
        },
        'sender.nickName': {
          title: "发送",
          type: "text",
          search: {
            show: true,
          },
          column: {
            width: 120,
          },
        },
        'receiver.nickName': {
          title: "接收",
          type: "text",
          search: {
            show: true,
          },
          column: {
            width: 120,
          },
        },
        content: {
          title: "聊天内容",
          type: "text",
          search: {
            show: true,
            valueResolve({ key, value, form }) {
              if (value) {
                form[key] = value + "%";
              }
            },
            component: { type: "text" },
          },
          form: {
            rule: [{ required: true, message: "请输入昵称", trigger: "blur" }],
            col: { span: 14 },
            component: { type: "textarea", rows: 5 },
          },
          column: {
            width: 260,
            ellipsis: true
          },
        },
        postTime: {
          title: "创建时间",
          type: "text",
          addForm: { show: false },
          column: {
            width: 130,
            formatter({ value }) {
              return formatDateTime(value);
            },
          },
          form: {
            show: false,
          },
        },
      },
      form: {
        labelWidth: "120px",
        wrapper: {
          draggable: false,
        },
      },
    },
  };
  return createPermissionOpt(opt, context);
}
