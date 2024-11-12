import { useColumns, useMerge } from "@fast-crud/fast-crud";
import { request } from '@/utils'
import { FsExtendsEditor, FsExtendsJson, FsExtendsUploader } from '@fast-crud/fast-extends';
import { FastCrud } from "@fast-crud/fast-crud";
import api from '../api';

import "@fast-crud/fast-crud/dist/style.css";
import '@fast-crud/fast-extends/dist/style.css';

import config from "../config/config.default";

export const CRUDOptions = {
  // i18n, //i18n配置，可选，默认使用中文，具体用法请看demo里的 src/i18n/index.js 文件
  // 此处配置公共的dictRequest（字典请求）
  async dictRequest({ dict }) {
    const res = await request({ url: dict.url })
    return res.data; //根据dict的url，异步返回一个字典数组
  },
  //公共crud配置
  commonOptions() {
    return {
      request: {
        //接口请求配置
        //你项目后台接口大概率与fast-crud所需要的返回结构不一致，所以需要配置此项
        //请参考文档http://fast-crud.docmirror.cn/api/crud-options/request.html
        transformQuery: ({ page, form, sort }) => {
          //转换为你pageRequest所需要的请求参数结构
          return { page, form, sort };
        },
        transformRes: ({ res }) => {
          //将pageRequest的返回数据，转换为fast-crud所需要的格式
          //return {records,currentPage,pageSize,total};
          return { ...res }
        }
      },
      //你可以在此处配置你的其他crudOptions公共配置
    };
  },
}

export function setupCRUDMerge() {
  // 全局配置 crud自定义字段配置简化逻辑
  const { registerMergeColumnPlugin } = useColumns();
  const { merge } = useMerge()
  registerMergeColumnPlugin({
    name: 'readonly-plugin',
    order: 1,
    handle: (columnProps, crudOptions) => {
      // 你可以在此处做你自己的处理
      // 比如你可以定义一个readonly的公共属性，处理该字段只读，不能编辑
      if (columnProps.readonly) {
        // 合并column配置
        // 意思是，当用户给这个字段配置了columns[key].readonly = true
        // 就相当于配置了 {form: {show: false},viewForm: {show: true}}
        merge(columnProps, {
          form: { show: false },
          viewForm: { show: true },
        });
      }
      return columnProps;
    }
  })
}

export function setupFastCrud(app, opts = {}) {
  app.use(FastCrud, CRUDOptions)
  // 注册全局插件，要写在vue.use(FastCrud)，初始化之后
  setupCRUDMerge()
  // 注册editor组件
  app.use(FsExtendsEditor, {
    //编辑器的公共配置
    wangEditor: {
      editorConfig: {
        MENU_CONF: {},
      },
      toolbarConfig: {},
    },
  });
  // 注册json组件
  app.use(FsExtendsJson);
  // 注册uploader组件
  app.use(FsExtendsUploader, {
    defaultType: 'cos',
    cos: { // ‌‌腾讯云COS
      keepName: true,
      domain: 'https://xxx.cos.ap-guangzhou.myqcloud.com',
      bucket: 'xxx',
      region: 'ap-guangzhou',
      secretId: '', // 本地签名模式存储在前端不安全
      secretKey: '', // 本地签名模式存储在前端不安全（不安全，生产环境不推荐）
      async getAuthorization() {
        // 不传secretKey代表使用临时签名模式,此时此参数必传（安全，生产环境推荐）
        // 返回结构如下
        // ret.data:{
        //   TmpSecretId,
        //   TmpSecretKey,
        //   XCosSecurityToken,
        //   ExpiredTime, // SDK 在 ExpiredTime 时间前，不会再次调用 getAuthorization
        // }
        const ret = await request({
          url: '/api/upload/cos/getAuthorization',
          method: 'get',
        });
        console.log('cos', ret);
        return ret;
      },
      successHandle(ret) {
        // 上传完成后可以在此处处理结果，修改url什么的
        console.log('success cos:', ret);
        return ret;
      },
    },
    alioss: { // 阿里云OSS
      keepName: true,
      domain: 'https://xxx.oss-cn-shenzhen.aliyuncs.com',
      bucket: 'xxx',
      region: 'oss-cn-shenzhen',
      accessKeyId: '', // 本地签名模式存储在前端不安全
      accessKeySecret: '', // 本地签名模式存储在前端不安全（不安全，生产环境不推荐）
      async getAuthorization() {
        // 使用服务器返回的ak,sk,token等信息
        // 返回格式
        // ret.data:{
        //   "securityToken": "wg...",
        //   "accessKeySecret": "8c...",
        //   "accessKeyId": "STS.NV4h..",
        //   "expiration": "2024-11-06T10:41:22Z"
        // }
        const ret = await request({
          url: '/api/upload/alioss/getAuthorization',
          method: 'get',
        });
        console.log('alioss', ret);
        return ret;
      },
      sdkOpts: {
        // sdk配置
        secure: true, // 默认为非https上传,为了安全，设置为true
      },
      successHandle(ret) {
        // 上传完成后可以在此处处理结果，修改url什么的
        console.log('success alioss:', ret);
        return ret;
      },
    },
    form: {
      keepName: true,
      action: '/base/file/upload',
      name: 'file',
      withCredentials: false,
      uploadRequest: api.uploadFile,
      successHandle(ret) {
        const fileInfo = ret.data[0]
        const { filePath } = fileInfo
        const url = config.imgHostPath + filePath
        // 回显图片需要图片url和key(uuid或者文件名)
        return {
          url,
          key: filePath,
        };
      },
    },
  })
}