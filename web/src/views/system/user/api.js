import _ from "lodash-es";
import { request } from '@/utils'

/**
 * 此处本地方式模拟远程接口，实际开发，你需要替换成你的后台请求
 */

export const pageRequest = async (query) => {
  const { page, form, sort } = query
  let _sort
  if (sort?.prop) {
    const createSort = {}
    createSort[sort.prop] = sort.asc ? 'asc': 'desc'
    _sort = JSON.stringify(createSort)
  }
  const params = { ...form, sort: _sort, ...page }
  const { data } = await request.post('/system/user/page', params)
  return data
};
export const editRequest = async ({ form, row }) => {
  console.log('form, row: ', form, row);
  const { id } = row
  return await request.put(`/system/user/${id}`, form)
};
export const delRequest = async ({ row }) => {
  const { id } = row
  return await request.delete(`/system/user/${id}`)
};
export const addRequest = async ({ form }) => {
  return await request.post('/system/user', form)
};