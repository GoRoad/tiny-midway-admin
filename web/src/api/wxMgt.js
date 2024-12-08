import { request } from "@/utils";

export default {
  getConfig: () => request.get("/gewe/config"),
  setConfig: (data) => request.post("/gewe/config", data),
  getWxUsers: () => request.get("/gewe/wxUsers"),
  delWxUsers: (wxid) => request.get("/gewe/delWxUser", { params: { wxid } }),
  setWxUser: (data) => request.post("/gewe/wxUser", data),
  // 二维码登录
  login: (appId = '') => request.get("/gewe/login", { params: { appId } }),
  checkLogin: (params) => request.get("/gewe/checkLogin", { params }),
  logout: (appId) => request.get("/gewe/logout", { params: { appId } }),
  checkOnline: (appId) => request.get("/gewe/checkOnline", { params: { appId } }),
  setCallback: (url) => {
    return request.get("/gewe/tools/setCallback", {
      params: {
        url: encodeURIComponent(url),
      },
    });
  },
};
