import _ from 'lodash-es'

import { request } from '@/utils'

/**
 * 此处本地方式模拟远程接口，实际开发，你需要替换成你的后台请求
 */
const records = [{ id: 1, name: "Hello World", type: 1 }]
export const pageRequest = async (query) => {
  const { page, form, sort } = query
  let _sort
  if (sort?.prop) {
    const createSort = {}
    createSort[sort.prop] = sort.asc ? 'asc': 'desc'
    _sort = JSON.stringify(createSort)
  }
  const params = { ...form, sort: _sort, ...page }
  const { data } = await request.post('/system/role/page', params)
  return data
}
export const editRequest = async ({ form, row }) => {
  const { id } = row
  const { data } = await request.put(`/system/role/${id}`, form)
  return data
}
export const delRequest = async ({ row }) => {
  const { id } = row
  return await request.delete(`/system/role/${id}`)
}
export const addRequest = async ({ form }) => {
  console.log('form: ', form)
  return await request.post('/system/role', form)
}

export const getTree = async () => {
  const { data } = await request.get('/base/dict/sys?code=permissions', { params: {} })
  return data
}