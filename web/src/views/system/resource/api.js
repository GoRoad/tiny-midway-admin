/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2024/04/01 15:52:04
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { request } from '@/utils'
import axios from 'axios'

export default {
  getMenuTree: () => request.get('/system/resource/list'),
  getButtons: ({ parentId }) => request.get(`/permission/button/${parentId}`),
  getComponents: () => axios.get(`${import.meta.env.VITE_PUBLIC_PATH}components.json`),
  addPermission: data => request.post('/system/resource', data),
  savePermission: (id, data) => request.put(`/system/resource/${id}`, data),
  deletePermission: id => request.delete(`/system/resource/${id}`),
}
