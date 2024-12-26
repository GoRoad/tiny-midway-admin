<template>
  <div class="root">
    <n-modal
      v-model:show="show"
      :mask-closable="true"
      preset="dialog"
      :title="data.nickName"
      content="你确认"
      positive-text="关闭"
      negative-text=""
      @positive-click="onPositive"
      @negative-click="onNegative">
      <p>成员数: {{ data?.contacts?.length }}</p>
      <div class="box mt-24">
        <n-infinite-scroll style="height: 350px;" :distance="10" @load="handleLoad">
          <div v-for="(item, index) in list" :key="item.key" class="message">
            <img class="avatar" :src="item.smallHeadImgUrl" alt="">
            <span> {{ item.nickName }} ({{ item.id }})</span>
          </div>
          <div v-if="loading" class="text">加载中...</div>
          <div v-if="noMore" class="text">没有更多了</div>
        </n-infinite-scroll>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
  import { ref, onMounted } from "vue";

  const show = ref(false);
  const loading = ref(false);
  const data = reactive({});
  const list = ref([]);

  // const noMore = computed(() => list.value.length > 16)
  const noMore = ref(false);

  onMounted(async () => {

  });

  const openDialog = (row) => {
    console.log('@row: ', row);
    show.value = true;
    Object.assign(data, row);
    list.value = data?.contacts || []
  };

  const handleLoad = () => {
    // console.log('@handleLoad: ');
    // loading.value = true;
    // list.value = data?.contacts || []
    // loading.value = false
  };

  // 暴露变量
  defineExpose({
    openDialog,
  });
</script>

<style lang="scss" scoped>
  .root {
  }
  .box {
  }
  .message {
    border: 1px solid #ccc;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding: 10px;

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin-right: 10px;
    }
  }

</style>