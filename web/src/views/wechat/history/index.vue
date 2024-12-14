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

  // 将在createOptions之前触发
  const onExpose = (e) => {
    // 可以获取到crudExpose,和context
    console.log(e);
  }
  const { crudRef, crudBinding, crudExpose } = useFs({
    createCrudOptions,
    onExpose,
    // 控制按钮是否展示，需要在资源管理中配置按钮code
    // 比如demo:crud:add、demo:crud:edit、demo:crud:xxx
    // 然后在角色管理分配给对应角色，刷新页面就生效了
    // 这里只用配置前缀，代码会自校验add、edit、view、remove
    // context: { permission: "demo:crud" }
  });
  // 页面打开后获取列表数据
  onMounted(async () => {
    crudExpose.doRefresh();
  });
</script>