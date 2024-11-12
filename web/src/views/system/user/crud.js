import { h } from 'vue';
import { dict } from "@fast-crud/fast-crud";
import { addRequest, delRequest, editRequest, pageRequest } from "./api";

import { createPwd } from '@/utils';
/**
 * 定义一个CrudOptions生成器方法
 */

const validateArr = async (rule, value) => {
  if (!value) throw new Error("请选择用户的角色!");
};

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
        username: {
          title: "用户名",
          type: "text",
          search: {
            show: true,
            valueResolve({ key, value, form }) { // 利用格式转换实现模糊查询功能
              if(value) {
                // 如果查询name加上%结尾, 表示使用(contains)模糊查询
                form[key] = value + '%'
              }
            }
          },
          column: {
            resizable: true,
            width: 200
          },
          editForm:{
            component: { disabled: true },
          },
          form: {
            rule: [{ required: true, message: "请输入用户名", trigger: 'blur' }],
            helper: '权限标识，不可修改，使用大小写字母、数字和下划线组成。',
          },
        },
        nickName: {
          title: "昵称",
          type: "text",
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
            rule: [{ required: true, message: "请输入昵称", trigger: 'blur' }],
          }
        },
        system: {
          title: "系统账号",
          type: "dict-select",
          readonly: true,
          dict: dict({
            data: [
              { value: true, label: "是" },
              { value: false, label: "否" },
            ]
          }),
          search: { show: true },
        },
        password: {
          title: '密码',
          type: 'password',
          addForm: {
            rule: [{ required: true, message: "请输入密码", trigger: 'blur' }],
          },
          column: {
            show: false,
            cellRender({ value }) {
              return h('span', { style: 'color:#ed6a0c' }, '隐藏');
            },
          },
          valueBuilder(context) {
            // 只能修改密码
            context.form.password = ''
          },
          valueResolve(context) {
            // 在form表单点击保存按钮后，提交到后台之前执行转化
          },
        },
        roles: {
          title: "角色",
          type: "dict-select",
          dict: dict({
            url: '/base/dict/sys?code=role'
          }),
          form: {
            title: '角色',
            rule: [
              { required: true, message: "请选择角色" },
              { validator: validateArr, trigger: "blur" }
            ],
            component: {
              multiple: true,
            },
          },
        },
        gender: {
          title: "性别",
          type: "dict-select",
          dict: dict({
            data: [
              { value: 0, label: "女" },
              { value: 1, label: "男" },
            ]
          }),
        },
        phone: {
          title: "手机号码",
          type: "text",
        },
        email: {
          title: "邮箱",
          type: "text",
        },
        address: {
          title: "地址",
          type: "text",
        }
      },
      // 禁止naiveui在所有表单拖动
      form:{
        wrapper:{
          draggable: false,
        },
        beforeSubmit(_data) {
          // 编辑不校验密码是否必填
          // 如果填写密码，就是修改密码或者是新增账号，需要加密
          if (_data.form.password) {
            _data.form.password = createPwd(_data.form.password)
          } else {
            delete _data.form.password
            delete _data.form.passwordVersion
          }
          // return false;
        }
      }
    }
  };
}