import { request } from "@/utils";

export default {
  getConfig: () => request.get("/wechat/gewe/config"),
  setConfig: (data) => request.post("/wechat/gewe/config", data),
  getWxUsers: () => request.get("/wechat/gewe/wxUsers"),
  delWxUsers: (wxid) => request.get("/wechat/gewe/delWxUser", { params: { wxid } }),
  setWxUser: (data) => request.post("/wechat/gewe/wxUser", data),
  // 二维码登录
  login: (appId = '') => request.get("/wechat/gewe/login", { params: { appId } }),
  checkLogin: (params) => request.get("/wechat/gewe/checkLogin", { params }),
  logout: (appId) => request.get("/wechat/gewe/logout", { params: { appId } }),
  checkOnline: (appId) => request.get("/wechat/gewe/checkOnline", { params: { appId } }),
  setCallback: (url) => {
    return request.get("/wechat/gewe/tools/setCallback", {
      params: {
        url: encodeURIComponent(url),
      },
    });
  },
};
