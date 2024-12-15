<template>
  <CommonPage show-footer>
    <n-space size="large" class="mb-20">
      <n-card title="服务配置">
        <n-space>
          <n-table class="mb-20" :single-line="false">
            <thead>
              <tr>
                <th width="100">配置项</th>
                <th width="500">值</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>基础api</td>
                <td>{{ geweConfig.baseAPI }}</td>
              </tr>
              <tr>
                <td>文件api</td>
                <td>{{ geweConfig.fileAPI }}</td>
              </tr>
              <tr>
                <td>回调api</td>
                <td>{{ geweConfig.tinyAPI }}</td>
              </tr>
            </tbody>
          </n-table>
        </n-space>
        <n-space>
          <n-button @click="showGewe = true" type="info">设置</n-button>
          <n-button @click="setCallBackUrl" type="tertiary"> 验证 </n-button>
        </n-space>
      </n-card>

      <!-- <n-card title="微信账号">
        <n-space>
          <n-table class="mb-20" :single-line="false">
            <thead>
              <tr>
                <th width="120">昵称</th>
                <th width="300">微信号</th>
                <th width="120">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>基础api</td>
                <td>wx123</td>
                <td>在线</td>
              </tr>
              <tr>
                <td>基础api</td>
                <td>wx123</td>
                <td>在线</td>
              </tr>
            </tbody>
          </n-table>
        </n-space>
        <n-space>
          <n-button type="info">
            <i class="i-material-symbols:add mr-4 text-18" />
            新增
          </n-button>
          <n-button type="error">
            <i class="i-material-symbols:delete-outline mr-4 text-18" />
            删除
          </n-button>
          <n-button type="warning">
            <i class="i-material-symbols:edit-outline mr-4 text-18" />
            编辑
          </n-button>
          <n-button type="primary">
            <i class="i-majesticons:eye-line mr-4 text-18" />
            查看
          </n-button>
        </n-space>
      </n-card> -->
    </n-space>

    <n-space size="large">
      <n-spin :show="wxLoading">
        <n-card title="微信账号">
          <n-space>
            <n-table class="mb-20" :single-line="false">
              <thead>
                <tr>
                  <th width="160">昵称</th>
                  <th width="160">微信号</th>
                  <th width="200">wxId</th>
                  <th width="220">登录设备</th>
                  <th width="60">状态</th>
                  <th width="160">登录时间</th>
                  <th width="80">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in wxUsers">
                  <td>{{ item.nickName }}</td>
                  <td>{{ item.alias }}</td>
                  <td>{{ item.wxId }}</td>
                  <td>{{ item.appId }}</td>
                  <td>{{ item.status == 1 ? '在线' : '离线' }}</td>
                  <td>{{ item.loginAt ? dayjs(item.loginAt).format('YYYY-MM-DD HH:mm') : '' }}</td>
                  <td>
                    <n-dropdown trigger="click" size="large" :options="options" @select="e => handleSelect(e, item)">
                      <n-button>操作</n-button>
                    </n-dropdown>
                  </td>
                </tr>
              </tbody>
            </n-table>
          </n-space>
          <n-space>
            <n-button @Click="toLogin" type="info">
              <i class="i-material-symbols:qr-code mr-4 text-18" />
              扫码登录新微信
            </n-button>
            <!-- <n-button  @Click="toInfo" type="primary">
            <i class="i-majesticons:eye-line mr-4 text-18" />
            刷新状态
          </n-button>
            <n-button @Click="toLogout" type="warning">
              <i
                class="i-material-symbols:power-settings-circle-outline mr-4 text-18"
              />
              下线
            </n-button>
            <n-button @click="deleteWxUser" type="error">
              <i class="i-material-symbols:delete-outline mr-4 text-18" />
              删除
            </n-button> -->
          </n-space>
        </n-card>
      </n-spin>
    </n-space>

    <GeweForm v-if="showGewe" @close="showGewe = false" :data="geweConfig" @refresh="getConfig" />
    <n-modal v-model:show="loginModal.show" :on-after-leave="wxClose" preset="dialog" title="请使用微信扫码" style="width: 330px;">
      <n-image :src="loginModal.img" width="268" height="268"></n-image>
      <p class="text-center">{{ loginModal.status }}</p>
    </n-modal>
  </CommonPage>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import api from "@/api/wxMgt";
import GeweForm from "./components/geweForm.vue";

import dayjs from 'dayjs'

const showGewe = ref(false);
const wxLoading = ref(false);

const options = ref([
  { label: '登录', key: '1', icon: renderIcon('i-ic:baseline-wechat text-18') },
  { label: '下线', key: '2', icon: renderIcon('i-material-symbols:cloud-off-outline text-18') },
  { label: '刷新状态', key: '3', icon: renderIcon('i-majesticons:eye-line text-18') },
  { label: '删除', key: '4', icon: renderIcon('i-material-symbols:delete-outline text-18') },
])
const loginModal = reactive({
  timer: null,
  uuid: null,
  appId: null,
  loginInfo: null,
  show: false,
  img: null,
  status: ''
})

const geweConfig = ref({})
const wxUsers = ref([])

function renderIcon(icon) {
  return () => {
    return h('i', {
      class: icon
    })
  }
}

const toLogin = async (item) => {
  loginModal.status = ''
  wxLoading.value = true;
  const appId = item?.appId || ''
  try {
    const login = await api.login(appId);
    loginModal.img = login.data.qrImgBase64;
    loginModal.appId = login.data.appId;
    loginModal.uuid = login.data.uuid;
    loginModal.show = true;
    checkLoginStatus()
  } finally {
    wxLoading.value = false;
  }
};

onBeforeUnmount(() => {
  stopCheckLogin()
})

onMounted(async () => {
  getConfig()
  getWxUsers()
})

const wxClose = () => {
  getWxUsers()
  stopCheckLogin()
}

const getConfig = async () => {
  const { data } = await api.getConfig()
  if (data) {
    geweConfig.value = data
  }
}

const getWxUsers = async () => {
  wxLoading.value = true
  try {
    const { data } = await api.getWxUsers()
    if (data) wxUsers.value = data
  } finally {
    wxLoading.value = false
  }
}

const setWxUser = async (data) => {
  const { data: _data } = await api.setWxUser(data)
  const index = wxUsers.value.findIndex(item => item.wxid === _data.wxid)
  if (index !== -1) {
    wxUsers.value.splice(index, 1, _data)
  }
}

const stopCheckLogin = () => {
  loginModal.timer && clearTimeout(loginModal.timer)
}

const checkLoginStatus = async () => {
  loginModal.status = '登录检查中...'
  try {
    const checkLogin = await api.checkLogin({
      appId: loginModal.appId,
      uuid: loginModal.uuid,
    });
    // console.log('checkLogin: ', checkLogin);
    if (checkLogin.data?.loginInfo) {
      loginModal.loginInfo = checkLogin.data.loginInfo
      setCallBackUrl()
      // 更新微信登录信息
      const wxInfo = {
        appId: loginModal.appId,
        status: 1,
        loginAt: new Date(),
        alias: loginModal.loginInfo.alias,
        mobile: loginModal.loginInfo.mobile,
        nickName: loginModal.loginInfo.nickName,
        uin: loginModal.loginInfo.uin,
        wxId: loginModal.loginInfo.wxid,
      }
      await setWxUser(wxInfo)
      loginModal.status = `【${checkLogin.data.loginInfo.nickName}】 登录成功`
    } else {
      loginModal.status = '未登录，准备重新检查...'
      loginModal.timer = setTimeout(checkLoginStatus, 5000)
    }
  } catch (error) {
    console.error('error: ', error);
    stopCheckLogin()
  }
}

const setCallBackUrl = async () => {
  if (!geweConfig.value?.tinyAPI) return $message.success("回调地址未设置！");
  const { data } = await api.setCallback(geweConfig.value.tinyAPI);
  if (data) {
    $message.success("回调接口验证成功！");
  } else {
    $message.error("回调接口验证失败！");
  }
}

const toLogout = async (item) => {
  if (!item.appId) return $message.error("请先登录微信！");
  await api.logout(item.appId);
  setWxUser({ ...item, status: 0 })
  $message.success("操作成功！");
}

const toInfo = async (item) => {
  if (!item?.appId) return $message.error("请先登录微信！");
  const { data } = await api.checkOnline(item.appId);
  const newStatus = data ? 1 : 0
  if (newStatus === item.status) return
  setWxUser({ ...item, status: newStatus })
}

const deleteWxUser = async (item) => {
  $dialog.confirm({
    title: '危险操作',
    content: '删除登录信息会同时删除登录设备，同一个号应避免重复创建设备，以免触发风控。是否继续删除？',
    async confirm() {
      await api.delWxUsers(item.wxid)
      getWxUsers()
      $message.success('删除成功')
    },
    cancel() {
    },
  })
}

const handleSelect = (key, row) => {
  if (key == 1) toLogin(row)
  if (key == 2) toLogout(row)
  if (key == 3) toInfo(row)
  if (key == 4) deleteWxUser(row)
}
</script>
