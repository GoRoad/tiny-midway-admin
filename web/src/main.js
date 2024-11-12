/**********************************
 * @Description: 入口文件
 * @FilePath: main.js
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/04 22:41:32
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { createApp } from 'vue'
import App from './App.vue'
import { setupDirectives } from './directives'

import { setupRouter } from './router'
import { setupStore } from './store'
import { setupNaiveDiscreteApi, setupFastCrud } from './utils'
import '@/styles/global.scss'
import '@/styles/reset.css'
import 'uno.css'

import config from './config/config.default.js'
import ui from "@fast-crud/ui-naive";
import Naive from 'naive-ui'

async function bootstrap() {
  const app = createApp(App)
  setupStore(app)
  setupDirectives(app)
  await setupRouter(app)
  setupNaiveDiscreteApi()
  app.provide('config', config)
  // 安装FastCrud必须要先全局安装Naive-ui
  app.use(Naive)
  // 先安装Naive-ui接口
  app.use(ui)
  // FastCrud初始化
  setupFastCrud(app)
  app.mount('#app')
}

bootstrap()
