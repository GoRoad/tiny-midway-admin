<template>
  <CommonPage>
    <fs-crud ref="crudRef" v-bind="crudBinding" />
  </CommonPage>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { useFs, OnExposeContext } from "@fast-crud/fast-crud";
import createCrudOptions from "./crud.js";
// import { FirstRow } from "./crud";

//此处为组件定义
export default defineComponent({
  name: "FsCrudFirst",
  setup(props: any, ctx: any) {
    console.log('@@@ctx: ', ctx);
    // // crud组件的ref
    // const crudRef = ref();
    // // crud 配置的ref
    // const crudBinding = ref();
    // // 暴露的方法
    // const {crudExpose} = useExpose({crudRef, crudBinding});
    // // 你的crud配置
    // const {crudOptions} = createCrudOptions({crudExpose});
    // // 初始化crud配置
    // const {resetCrudOptions , appendCrudBinding} = useCrud({crudExpose, crudOptions});

    //  =======以上为fs的初始化代码=========
    //  =======你可以简写为下面这一行========
    const context: any = { props, ctx }; // 自定义变量, 将会传递给createCrudOptions, 比如直接把props,和ctx直接传过去使用
    function onExpose(e: OnExposeContext) { } //将在createOptions之前触发，可以获取到crudExpose,和context
    const { crudRef, crudBinding, crudExpose } = useFs({ createCrudOptions, onExpose, context });

    // crudExpose.doRemove = async (row: any) => {
    //   console.log("doRemove", row);
    // };

    // 页面打开后获取列表数据
    onMounted(() => {
      crudExpose.doRefresh();
    });
    return {
      crudBinding,
      crudRef
    };
  }
});
</script>