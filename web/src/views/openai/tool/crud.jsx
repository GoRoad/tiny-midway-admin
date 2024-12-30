import { request } from "@/utils";
// import { dict } from "@fast-crud/fast-crud";
import { createPermissionOpt } from "@/utils";

// import { ref } from "vue";

import { EditorView, basicSetup } from "codemirror";
import { javascript, esLint } from "@codemirror/lang-javascript";
import { oneDark } from '@codemirror/theme-one-dark';
import { linter, lintGutter } from "@codemirror/lint";
import * as eslint from "eslint-linter-browserify";

// const _loading = ref(false);
// console.log('@crud_loading: ', _loading);

/**
 * 接口配置
 */
const API_PREFIX = "/openai/tool/";

export const pageRequest = async (query) => {
  const { page, form, sort } = query;
  let _sort;
  if (sort?.prop) {
    const createSort = {};
    createSort[sort.prop] = sort.asc ? "asc" : "desc";
    _sort = JSON.stringify(createSort);
  }
  const params = { ...form, sort: _sort, ...page };
  const { data } = await request.post(API_PREFIX + "page", params);
  return data;
};

export const editRequest = async ({ form, row }) => {
  const { id } = row;
  return await request.put(API_PREFIX + id, form);
};

export const delRequest = async ({ row }) => {
  const { id } = row;
  return await request.delete(API_PREFIX + id, {});
};

export const addRequest = async ({ form }) => {
  return await request.post(API_PREFIX, form);
};


/**
 * 定义一个CrudOptions生成器方法
 */
export default function ({ crudExpose, context }) {
  var edit = null;
  const config = {
    languageOptions: {
      globals: {
        z: "readonly",
        console: "readonly",
        makeHttpRequest: "readonly",
        _: "readonly",
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    rules: {
      semi: ["error", "always"],
      // "no-unused-vars": "error",
      "no-undef": "error",
    },
  };
  const loadEditor = (e, val) => {
    // 默认示例
    const fragment = 'const result = {res: `从${args.from}到${args.to}距离是50公里`};'
    const def_code = `// 最基础的工具模板，创建工具必须使用schema、func两个对象
const schema = z.object({
  from: z.string().describe("起点位置"),
  to: z.string().describe("终点位置"),
});

const func = async (args) => {
  // 这里可以使用 await
  // 仅可调用以下API
  // console、 lodash as _、 makeHttpRequest
  // makeHttpRequest() 用于调用后端接口
  console.log("工具被调用，参数: ", args);
  // 必须返回字符串，某些模型需要返回JSON字符串才能识别
  ${fragment}
  return JSON.stringify(result);
};`;
    const img = e.currentTarget;
    const parent = img.parentNode;
    edit = new EditorView({
      doc: val ? val : def_code,
      readOnly: true,
      extensions: [basicSetup, javascript(), linter(esLint(new eslint.Linter(), config)), lintGutter(), oneDark],
      parent,
    });
  };
  const opt = {
    crudOptions: {
      // 在这里自定义你的crudOptions配置
      request: {
        pageRequest,
        addRequest,
        editRequest,
        delRequest,
      },
      //这里定义两个字段
      columns: {
        id: {
          title: "id",
          type: "text",
          // crud自定义字段，效果就是在添加和编辑时都看不到这个字段
          readonly: true,
          column: {
            //表格列的一些配置
            width: 70,
            sorter: "custom", // 排序
          },
        },
        name: {
          title: "工具名称",
          type: "text",
          search: {
            show: true,
            valueResolve({ key, value, form }) {
              // 利用格式转换实现模糊查询功能
              if (value) {
                // 如果查询name加上%结尾, 表示使用(contains)模糊查询
                form[key] = value + "%";
              }
            },
          },
          form: {
            rule: [{ required: true, message: "请输入内容", trigger: "blur" }],
          },
          column: {
            width: 150,
          },
        },
        funcName: {
          title: "函数名称",
          type: "text",
          form: {
            component: { placeholder: "函数名称，智能体据此判断工具的用途", },
            rule: [
              { required: true, message: "请输入内容", trigger: "blur" },
              // 正则检查智能输入英文
              { pattern: /^[a-zA-Z]+$/, message: "请输入英文", trigger: "blur" }
            ],
          }
        },
        description: {
          title: "工具简介",
          type: "text",
          form: {
            component: { placeholder: "工具简介，智能体据此判断工具的用途", },
            rule: [{ required: true, message: "请输入内容", trigger: "blur" }],
          },
        },
        code: {
          title: "源码",
          type: "text",
          valueResolve({ key, value, form }) {
            form[key] = edit?.state.doc.toString();
          },
          form: {
            helper: '**风险提示：源码使用的vm模块存在逃逸漏洞，可能导致恶意代码突破沙盒限制。请不要输入任何不受信任的代码。详见nodejs官方文档',
            component: {
              height: 100,
              render(context) {
                return (
                  <div style="width: 100%; height: 100%">
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/6lk6AAA" onLoad={(e) => loadEditor(e, context.value)} />
                  </div>
                );
              },
            },
            col: { span: 24 },
          },
          column: {
            show: false,
          },
        },
      },
      // 禁止naiveui在所有表单拖动
      form: {
        wrapper: {
          draggable: false,
        },
      },
    },
  };
  // 按钮权限处理
  return createPermissionOpt(opt, context);
}
