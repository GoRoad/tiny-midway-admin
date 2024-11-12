/**********************************
 * @FilePath: interceptors.js
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/04 22:46:40
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/
import axios from 'axios'
import { useAuthStore } from '@/store'
import { resolveResError } from './helpers'

// 请求队列
let queue = []
// 是否刷新中
let isRefreshing = false

export function setupInterceptors(axiosInstance) {
  const SUCCESS_CODES = [0, 200]
  function resResolve(response) {
    const { data, status, config, statusText, headers } = response
    if (headers['content-type']?.includes('json')) {
      if (SUCCESS_CODES.includes(data?.code)) {
        return Promise.resolve(data)
      }
      const code = data?.code ?? status

      const needTip = config?.needTip !== false

      // 根据code处理对应的操作，并返回处理后的message
      const message = resolveResError(code, data?.message ?? statusText, needTip)

      return Promise.reject({ code, message, error: data ?? response })
    }
    return Promise.resolve(data ?? response)
  }

  axiosInstance.interceptors.request.use(reqResolve, reqReject)
  axiosInstance.interceptors.response.use(resResolve, resReject)
}

function reqResolve(config) {
  // 处理不需要token的请求
  if (config.needToken === false) {
    return config
  }

  const { accessToken, refreshToken, tokenExp, refreshTokenExp } = useAuthStore()
  if (accessToken) {
    // token: Bearer + xxx
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  // 判断 token 是否过期 1730096960
  if (useAuthStore().isExpired(tokenExp)) {
    // 判断 refreshToken 是否过期
    if (useAuthStore().isExpired(refreshTokenExp)) {
      useAuthStore().resetLoginState()
    } else {
      // 是否在刷新中
      if (!isRefreshing) {
        isRefreshing = true
        axios.post(`${import.meta.env.VITE_AXIOS_BASE_URL}/auth/refreshToken`, { token: refreshToken }, { timeout: 8000 })
          .then(({data:_data}) => {
            const { code, data } = _data
            // 校验数据结构是否正确
            const checkData = data?.accessToken && code === 0
            if (!checkData) {
              useAuthStore().resetLoginState()
            }
            // 更新token
            useAuthStore().updateToken(data)
            queue.forEach(cb => cb(data.accessToken))
            queue = []
            isRefreshing = false
          })
          .catch((err) => {
            useAuthStore().resetLoginState()
          })
      }

      return new Promise(resolve => {
        // 继续请求
        queue.push(token => {
          // 重新设置 token
          if (config.headers) {
            config.headers.Authorization = `Bearer ${token}`
          }
          resolve(config)
        })
      })
    }
  }

  return config
}

function reqReject(error) {
  return Promise.reject(error)
}

async function resReject(error) {
  console.log('http - error: ', error);
  if (!error || !error.response) {
    const code = error?.code
    /** 根据code处理对应的操作，并返回处理后的message */
    const message = resolveResError(code, error.message)
    return Promise.reject({ code, message, error })
  }

  const { data, status, config } = error.response
  const code = +data?.code ?? status

  const needTip = config?.needTip !== false
  const message = resolveResError(code, data?.message ?? error.message, needTip)
  return Promise.reject({ code, message, error: error.response?.data || error.response })
}
