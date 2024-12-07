import { request } from "@/utils";

export default {
  // 二维码登录
  token: () => request.get("/gewe/token"),
  login: () => request.get("/gewe/login"),
  checkLogin: (params) => request.get("/gewe/checkLogin", { params }),
  logout: (appId) => request.get("/gewe/logout", { params: { appId } }),
  checkOnline: (appId) => request.get("/gewe/checkOnline", { params: { appId } }),
  checkOnline: (url) => {
    return request.get("/gewe/tools/setCallback", {
      params: {
        url: encodeURIComponent(url),
      },
    });
  },
};
