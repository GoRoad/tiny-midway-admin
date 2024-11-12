<template>
  <div>
    <n-space vertical :size="12">
      <div class="flex pl-10">
        <n-input v-model:value="pattern" placeholder="新增分类名称" clearable />
        <NButton class="ml-12" type="primary" @click="handleAdd()">
          <i class="i-material-symbols:add mr-4 text-14" />
          新增
        </NButton>
      </div>
      <n-menu
        :options="treeData"
        key-field="id"
        label-field="name"
        :value="currentMenu"
        :on-update:value="onSelect"
        :render-extra="renderMenuEx"
        :render-icon="renderMenuIcon"
      />
    </n-space>

  </div>
</template>

<script setup>
import { NButton } from 'naive-ui'
import { withModifiers } from 'vue'
import { api } from '../crud'

const props = defineProps({
  treeData: {
    type: Array,
    default: () => [],
  },
  currentMenu: {
    type: Number,
    default: () => null,
  },
})
const emit = defineEmits(['refresh', 'update:currentMenu'])

const pattern = ref('')

async function handleAdd() {
  await api.addType(pattern.value)
  pattern.value = ''
  emit('refresh')
}

function onSelect(keys, option) {
  emit('update:currentMenu', keys)
  emit('refresh', option)
}

function renderMenuEx(opt) {
  return [
    h(
      NButton,
      {
        text: true,
        type: 'error',
        size: 'tiny',
        style: 'margin-left: 50px;',
        onClick: withModifiers(() => handleDelete(opt), ['stop']),
      },
      { default: () => '删除' },
    ),
  ]
}

function renderMenuIcon(option) {
  return h('i', { class: `${option.icon}?mask text-16` })
}

function handleDelete(item) {
  $dialog.confirm({
    content: `确认删除分类【${item.name}】？`,
    async confirm() {
      try {
        $message.loading('正在删除', { key: 'deleteMenu' })
        await api.delType(item.id)
        $message.success('删除成功', { key: 'deleteMenu' })
        emit('refresh')
      }
      catch (error) {
        console.error(error)
        $message.destroy('deleteMenu')
      }
    },
  })
}
</script>
