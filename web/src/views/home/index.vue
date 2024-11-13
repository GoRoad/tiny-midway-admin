<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:28:22
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <AppPage show-footer>
    <div class="flex">
      <n-card class="min-w-200 w-30%">
        <div class="flex items-center">
          <n-avatar round :size="60" :src="userStore.avatar" class="flex-shrink-0" />
          <div class="ml-20 flex-col">
            <span class="text-20 opacity-80">
              Hello, {{ userStore.nickName ?? userStore.username }}
            </span>
            <span class="mt-4 opacity-50">当前角色：{{ userStore.currentRole?.name }}</span>
          </div>
        </div>

        <p class="mt-28 text-14 opacity-60">
          一个人几乎可以在任何他怀有无限热忱的事情上成功。
        </p>
        <p class="mt-12 text-right text-12 opacity-40">
          —— 查尔斯·史考伯
        </p>
      </n-card>
      <n-card class="ml-12 w-70%" title="✨ 欢迎使用 Tiny-Midway-Admin">
        <template #header-extra>
          <a
            class="text-14 text-primary text-highlight hover:underline hover:opacity-80"
            href="#"
            target="_blank"
            @click.prevent="message?.info('来都来了帮忙点个Star呗...')"
          >
          {{ version }}
          </a>
        </template>

        <p class="opacity-60">基于如下项目修改开发</p>
        <p class="opacity-60">
          ⚡ 感谢 <a class="text-orange" href="https://github.com/zclzone/vue-naive-admin/tree/2.x" target="_blank">vue-naive-admin</a> 的开源
        </p>
        <p class="opacity-60">
          ⚡ 感谢 <a class="text-orange" href="https://github.com/midwayjs/midway" target="_blank">midway-js</a> 的开源
        </p>
        <footer class="mt-12 flex items-center justify-end">
          <n-button
            type="primary"
            ghost
            tag="a"
            href="https://github.com/34892002/tiny-midway-admin/blob/main/README.md"
            target="__blank"
          >
            Readme
          </n-button>
          <n-button
            type="primary"
            class="ml-12"
            tag="a"
            href="https://github.com/34892002/tiny-midway-admin"
            target="__blank"
          >
            代码仓库
          </n-button>
        </footer>
      </n-card>
    </div>
    <div class="mt-12 flex">
      <n-card class="w-50%" title="💯 特性" segmented>
        <template #header-extra>
          <span class="opacity-90 text-highlight">👏 历经十几次重构和细节打磨</span>
        </template>

        <ul class="opacity-90">
          <li class="py-4">
            🚀 后端
            <b>MidwayJs</b>
            技术栈:
            <span class="text-highlight">Prisma + Casbin + TypeScript</span>
          </li>
          <li class="py-4">
            🔐 基于 Casbin，
            <span class="text-highlight">菜单、接口、按钮</span>
            ，全部可控，RBAC模型权限管理
          </li>
          <li class="py-4">
            👏 使用 Prisma，
            <span class="text-highlight">框架支持</span>
            PostgreSQL、MySQL、SQLite、MongoDB、SQLServer、CockroachDB
          </li>
          <li class="py-4">
            ⚡️ 封装 Crud
            ，五分钟
            <span class="text-highlight">增</span>、
            <span class="text-highlight">删</span>、
            <span class="text-highlight">改</span>、
            <span class="text-highlight">查</span>、
            接口全搞定
          </li>
          <li class="py-4">
            ✨ 支持 Refresh Token，
            <span class="text-highlight">无感刷新</span>
            ，用户登录态可控，安全与体验缺一不可
          </li>
          <br>
          <li class="py-4">
            🆒 前端
            <b>Vue3</b>
            技术栈:
            <span class="text-highlight">Vite + Pinia + Naive UI</span>
          </li>
          <li class="py-4">
            🍇 使用
            <b>iconify + unocss</b>
            框架:
            <span class="text-highlight">Unocss</span>
            ，优雅、轻量、易用，图标支持自定义，支持动态渲染
          </li>
          <li class="py-4">
            ⚡️ 基于 Fast-Crud
            ，集成
            <span class="text-highlight">CRUD</span>
            表格、分页查询标准组件，包含
            <span class="text-highlight">富文本</span>、
            <span class="text-highlight">JSON</span>、
            <span class="text-highlight">上传</span>
            等业务组件，支持COS、OSS、本地上传模式，助力快速开发
          </li>
          <li class="py-4">
            🎨 <span class="text-highlight">扁平化路由</span> 设计，每一个组件都可以是一个页面，告别多级路由 KeepAlive 难实现问题
          </li>
        </ul>

        <!-- <n-divider class="mb-0! mt-12!">
          <p class="text-14 opacity-60">
            👉点击
            <b class="mx-2 transition hover:text-primary">
              <a href="https://isme.top" target="_blank">更多</a>
            </b>
            查看更多实用功能，持续开发中...
          </p>
        </n-divider> -->
      </n-card>

      <n-card class="ml-12 w-50%" title="🛠️ 技术栈" segmented>
        <VChart :option="skillOption" autoresize />
      </n-card>
    </div>

    <n-card class="mt-12" title="⚡️ 趋势" segmented>
      <div class="h-400">
        <VChart :option="trendOption" autoresize />
      </div>
    </n-card>
  </AppPage>
</template>

<script setup>
import { useUserStore } from '@/store'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

const version = import.meta.env.VITE_VERSION
const userStore = useUserStore()

echarts.use([
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
  PieChart,
])

const trendOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: '#999',
      },
    },
  },
  legend: {
    top: '5%',
    data: ['star', 'fork'],
  },
  xAxis: [
    {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisPointer: {
        type: 'shadow',
      },
    },
  ],
  yAxis: [
    {
      type: 'value',
      min: 0,
      max: 3000,
      interval: 500,
      axisLabel: {
        formatter: '{value}',
      },
    },
    {
      type: 'value',
      min: 0,
      max: 500,
      interval: 100,
      axisLabel: {
        formatter: '{value}',
      },
    },
  ],
  series: [
    {
      name: 'star',
      type: 'line',
      data: [200, 320, 520, 550, 600, 805, 888, 950, 1300, 2503, 2702, 2712],
    },
    {
      name: 'fork',
      yAxisIndex: 1,
      type: 'bar',
      data: [40, 72, 110, 115, 121, 175, 180, 201, 260, 398, 423, 455],
    },
  ],
}

const skillOption = {
  tooltip: {
    trigger: 'item',
    formatter({ name, value }) {
      return `${name} ${value}%`
    },
  },
  legend: {
    left: 'center',
  },
  series: [
    {
      top: '12%',
      type: 'pie',
      radius: ['35%', '90%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 36,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        { value: 38.5, name: 'Vue' },
        { value: 37.0, name: 'JavaScript' },
        { value: 6.5, name: 'CSS' },
        { value: 6.2, name: 'HTML' },
        { value: 1.8, name: 'Other' },
      ],
    },
  ],
}

const message = $message
</script>
