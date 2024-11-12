<template>
  <CommonPage>
    <div class="flex h-full">
      <n-spin size="small" :show="treeLoading">
        <MenuTree v-model:current-menu="currentMenu" class="w-320 shrink-0" :tree-data="treeData" @refresh="initData" />
      </n-spin>

      <div class="ml-40 w-0 flex-col flex-1">
        <div>
          <n-button-group>
            <n-button @click="pickChk('all')">
              全选
            </n-button>
            <n-button @click="pickChk('inverse')">
              反选
            </n-button>
            <n-button @click="pickChk('cancel')">
              取消
            </n-button>
            <n-button type="warning" @click="handleDelete">
              删除
            </n-button>
            <n-button type="success" @click="handleUpload">
              上传
            </n-button>
          </n-button-group>
        </div>

        <div class="box flex-1 my-20 overflow-y-scroll">
          <n-empty class="mt-200" v-if="!imgs?.length" description="没有内容"></n-empty>
          <n-checkbox-group v-model:value="pickImgs">
            <n-image-group>
              <n-space :size="[20, 20]">
                <div v-for="item in imgs" class="flex-col flex-items-center">
                  <n-image v-if="item.fileType =='img'" class="w-lg h-lg pb-5" width="128" height="128" object-fit="cover" :src="item.src" />
                  <n-image v-else class="w-lg h-lg pb-5" width="128" height="128" object-fit="fill" :src="other" />
                  <n-checkbox class="" :value="item.id">
                    <n-ellipsis class="w-100">{{ item.fileName }}</n-ellipsis>
                  </n-checkbox>
                </div>
              </n-space>
            </n-image-group>
          </n-checkbox-group>
        </div>

        <div class="foot">
          <n-pagination
            :page="page.currentPage"
            :item-count="page.total"
            :page-sizes="[page.pageSize]"
            :on-update:page="handlePageChange"
            size="medium"
            show-quick-jumper
            show-size-picker />
        </div>
      </div>

      <input
        ref="fileInput"
        type="file"
        style="display: none;"
        @change="handleFileChange"
      />
    </div>
  </CommonPage>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { api } from './crud'
import MenuTree from './components/MenuTree.vue'
import baseApi from '../../../api'
import other from '@/assets/images/other.jpg'

// const img_opt = {
//   id: null,
//   name: "method-draw-image.svg",
//   src: "https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg",
// }

const config = inject('config')

const treeLoading = ref(false)
const treeData = ref([])
const currentMenu = ref(null)
const pickImgs = ref([])
// const imgs = (new Array(5)).fill(img_opt).map((item, i) => ({ ...item, id: i + 1 }))
const imgs = ref([])
const fileInput = ref(null);
const page = reactive({ currentPage: 1, pageSize: 30, total: 0 })

initData()

async function initData(data) {
  if (data) {
    getList()
  } else {
    treeLoading.value = true
    const res = await api.getTypes()
    const _data = res?.data || []
    treeData.value = _data
    // 默认当前菜单是第一个
    currentMenu.value = _data[0].id
    getList()
    treeLoading.value = false
  }
}

async function getList(currentPage = 1) {
  pickChk('cancel')
  // 查询图片列表
  const query = {
    page: { currentPage, pageSize: page.pageSize },
    form: { categoryId: currentMenu.value }
  }
  const data = await api.pageRequest(query)
  // 图片列表处理
  // 定义常见的图片 MIME 类型
  const imageMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
    'image/tiff',
    'image/x-icon',
  ];
  data.records.forEach(item => {
    item.src = config.imgHostPath + item.filePath
    // item.exname = item.filename.split('.').pop();
    const isImg = imageMimeTypes.includes(item.mimeType)
    if (isImg) {
      item.fileType = 'img'
    } else {
      item.fileType = 'other'
    }
  })
  imgs.value = data.records
  page.currentPage = data.currentPage
  page.pageSize = data.pageSize
  page.total = data.total
}

async function pickChk(type) {
  console.log('type: ', type);
  if (type === 'all') {
    pickImgs.value = imgs.value.map((item) => item.id);
  }
  if (type === 'inverse') {
    pickImgs.value = imgs.value.reduce((acc, item) => {
      if (!pickImgs.value?.includes(item.id)) acc.push(item.id);
      return acc;
    }, []);
  }
  if (type === 'cancel') {
    pickImgs.value = [];
  }
}

const handleUpload = () => {
  fileInput.value.value = ''; // 重置 input 的 value 属性
  fileInput.value.click()
}

const handleFileChange = async(event) => {
  const file = event.target.files[0]
  if (file) {
    await baseApi.uploadFile({ action: '/base/file/upload', file, onProgress: () => {}, categoryId: currentMenu.value })
    getList()
  }
}

const handleDelete = async () => {
  const ids = pickImgs.value
  if (!ids.length) return $message.warning('请选择要删除的文件')
  $dialog.confirm({
    content: `确认删除这【${ids.length}】个文件？`,
    async confirm() {
      try {
        $message.loading('正在删除', { key: 'deleteMenu' })
        await api.delRequest(ids)
        $message.success('删除成功', { key: 'deleteMenu' })
        getList()
      }
      catch (error) {
        console.error(error)
        $message.destroy('deleteMenu')
      }
    },
  })
}

const handlePageChange = async(event) => {
  getList(event)
}
</script>