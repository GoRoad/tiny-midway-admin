<template>
  <CommonPage>
    <fs-crud ref="crudRef" v-bind="crudBinding">
    </fs-crud>
  </CommonPage>
</template>

<script setup>
  import { ref, onMounted } from "vue";
  import { useFs } from "@fast-crud/fast-crud";
  import createCrudOptions from "./crud";

  const context = ref('demo') // 自定义参数
  // 将在createOptions之前触发
  const onExpose = (e) => {
    // 可以获取到crudExpose,和context
    console.log(e);
  }
  const { crudRef, crudBinding, crudExpose } = useFs({ createCrudOptions, onExpose, context });
  // 页面打开后获取列表数据
  onMounted(async () => {
    crudExpose.doRefresh();
  });
</script>