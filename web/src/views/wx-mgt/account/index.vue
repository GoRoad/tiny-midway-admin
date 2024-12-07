<template>
  <CommonPage show-footer>
    <n-space size="large" class="mb-20">
      <n-card title="服务配置">
        <n-space>
          <n-table class="mb-20" :single-line="false">
            <thead>
              <tr>
                <th width="120">配置项</th>
                <th width="300">值</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>基础api</td>
                <td>aaa</td>
              </tr>
              <tr>
                <td>文件api</td>
                <td>bbb</td>
              </tr>
              <tr>
                <td>回调api</td>
                <td>bbb</td>
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
                  <th width="120">昵称</th>
                  <th width="200">微信号</th>
                  <th width="300">wxid</th>
                  <th width="180">登录设备</th>
                  <th width="120">状态</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              </tbody>
            </n-table>
          </n-space>
          <n-space>
            <n-button @Click="toLogin" type="info">
              <i class="i-material-symbols:qr-code mr-4 text-18" />
              登录微信
            </n-button>
            <n-button  @Click="toInfo" type="primary">
            <i class="i-majesticons:eye-line mr-4 text-18" />
            刷新状态
          </n-button>
            <n-button @Click="toLogout" type="warning">
              <i
                class="i-material-symbols:power-settings-circle-outline mr-4 text-18"
              />
              下线
            </n-button>
            <n-button type="error">
              <i class="i-material-symbols:delete-outline mr-4 text-18" />
              删除
            </n-button>
          </n-space>
        </n-card>
      </n-spin>
    </n-space>

    <GeweForm v-if="showGewe" @close="showGewe = false" />
    <n-modal v-model:show="loginModal.show" :on-after-leave="stopCheckLogin" preset="dialog" title="微信扫码" style="width: 330px;">
      <n-image :src="loginModal.img" width="268" height="268"></n-image>
      <p class="text-center">{{ loginModal.status }}</p>
    </n-modal>
  </CommonPage>
</template>

<script setup>
import { onBeforeUnmount } from "vue";
import api from "@/api/wxMgt";
import GeweForm from "./components/geweForm.vue";

const showGewe = ref(false);
const wxLoading = ref(false);

const loginModal = reactive({
  timer: null,
  uuid: null,
  appId: null,
  loginInfo: null,
  show: false,
  img: null,
  status: ''
})

const toLogin = async () => {
  loginModal.status = ''
  wxLoading.value = true;
  try {
    const login = await api.login();
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

const stopCheckLogin = () => {
  loginModal.timer && clearTimeout(loginModal.timer)
}

const checkLoginStatus = async () => {
  loginModal.status = '检查中...'
  try {
    const checkLogin = await api.checkLogin({
      appId: loginModal.appId,
      uuid: loginModal.uuid
    });
    // console.log('checkLogin: ', checkLogin);
    if (checkLogin.data.loginInfo) {
      loginModal.loginInfo = checkLogin.data.loginInfo
      setCallBackUrl()
      loginModal.status = `【${checkLogin.data.loginInfo.nickName}】 登录成功`
    } else {
      loginModal.status = '未登录，重新检查...'
      loginModal.timer = setTimeout(checkLoginStatus, 5000)
    }
  } catch (error) {
    console.error('error: ', error);
    stopCheckLogin()
  }
}

const setCallBackUrl = async () => {
  const { data } = await api.checkOnline('http://localhost');
  if (data) {
    $message.success("回调接口验证成功！");
  } else {
    $message.error("回调接口验证失败！");
  }
}

const toLogout = async () => {
  const { data } = await api.logout('wx_dl-59z-pJEwnUNljtl4F0');
  console.log('data: ', data);
}

const toInfo = async () => {
  const { data } = await api.checkOnline('wx_dl-59z-pJEwnUNljtl4F0');
  console.log('data: ', data);
}
</script>
