import { request } from "@/utils";
import { dict } from "@fast-crud/fast-crud";
import { formatDate, createPermissionOpt } from "@/utils";

import { ref } from "vue";

const _loading = ref(false);

/**
 * 接口配置
 */
const API_PREFIX = "/wechat/group";

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

export const getChatroomMemberList = async ({ form }) => {
  return await request.post(API_PREFIX + "/getChatroomMemberList", form);
};

const showMemberList = async (context, row) => {
  const { data } = await getChatroomMemberList({ form: { id: row.id } });
  context.viewFormRef.value.openDialog(data)
}

/**
 * 定义一个CrudOptions生成器方法
 */
export default function ({ expose, context: _context }) {
  const opt = {
    crudOptions: {
      request: {
        pageRequest,
        addRequest,
        editRequest,
        delRequest,
      },
      columns: {
        _index: {
          title: "序号",
          form: { show: false },
          column: {
            // type: "index",
            align: "center",
            width: "55px",
            columnSetDisabled: true, //禁止在列设置中选择
            formatter: (context) => {
              let index = context.index ?? 1;
              let pagination = expose.crudBinding.value.pagination;
              return (
                ((pagination.currentPage ?? 1) - 1) * pagination.pageSize +
                index +
                1
              );
            },
          },
        },
        nickName: {
          title: "群名称",
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
            rule: [{ required: true, message: "请输入昵称", trigger: "blur" }],
            col: { span: 14 },
          },
          column: {
            // width: 180,
          },
        },
        id: {
          title: "群id",
          type: "text",
          search: {
            show: true,
          },
          form: {
            rule: [
              { required: true, message: "请输入微信id", trigger: "blur" },
            ],
            col: { span: 14 },
          },
          column: {
            // width: 200,
          },
        },
        chatRoomOwner: {
          title: "群主",
          type: "text",
          search: { show: true },
        },
        smallHeadImgUrl: {
          title: "群头像",
          type: "text",
          readonly: true,
          form: {
            col: { span: 14 },
          },
          column: {
            render(context) {
              console.log("context: ", context.row);
              return (
                <div>
                  <n-image
                    width="55"
                    height="55"
                    object-fit="scale-down"
                    src={context.row.smallHeadImgUrl}
                  ></n-image>
                </div>
              );
            },
          },
        },
        _opt: {
          title: '群成员',
          form: { show: false },
          column: {
            // width: 120,
            render(context) {
              return (
                <div>
                  <n-button onClick={() => showMemberList(_context, context.row)}>查看</n-button>
                </div>
              );
            },
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
            show: false,
          },
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
            show: false,
          },
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
        labelWidth: "120px",
        wrapper: {
          draggable: false,
        },
      },
    },
  };
  return createPermissionOpt(opt, _context);
}
