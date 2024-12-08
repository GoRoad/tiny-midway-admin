<template>
  <n-modal v-model:show="show" preset="dialog" title="设置">
    <div>
      <n-form
        ref="formRef"
        :label-width="80"
        :model="formValue"
        :rules="rules"
        label-placement="left"
      >
        <n-form-item label="基础api" path="baseAPI" feedback="Gewechat基础服务地址">
          <n-input v-model:value="formValue.baseAPI" placeholder="" />
        </n-form-item>
        <n-form-item label="文件api" path="fileAPI" feedback="Gewechat文件服务地址">
          <n-input v-model:value="formValue.fileAPI" placeholder="" />
        </n-form-item>
        <n-form-item label="回调api" path="tinyAPI" feedback="TinyAdmin与Gewechat通讯的接口地址">
          <n-input v-model:value="formValue.tinyAPI" placeholder="" />
        </n-form-item>
      </n-form>
    </div>
    <template #action>
      <n-button type="primary" @click="submit"> 提交 </n-button>
    </template>
  </n-modal>
</template>

<script setup>
import api from "@/api/wxMgt";
const props = defineProps({
  data: Object,
});
// const emit = defineEmits(['update:modelValue']);
const emit = defineEmits(['close', 'refresh']);
const show = ref(true);
const formRef = ref(null);

watch(show, (n) => {
  emit('close', false)
});

const rules = {
  baseAPI: {
    required: true,
    message: "请输入内容",
    trigger: "blur",
  },
  fileAPI: {
    required: true,
    message: "请输入内容",
    trigger: ["blur"],
  },
  tinyAPI: {
    required: true,
    message: "请输入内容",
    trigger: ["blur"],
  },
};
const formValue = ref({
  baseAPI: props.data?.baseAPI || "http://127.0.0.1:2531/v2/api",
  fileAPI: props.data?.fileAPI || "http://127.0.0.1:2532/download",
  tinyAPI: props.data?.tinyAPI || "http://127.0.0.1:7001/wxBot/Callback",
});

const submit = (e) => {
  e.preventDefault();
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      await api.setConfig(formValue.value)
      emit('refresh')
      $message.success("设置成功!");
    } else {
      console.log(errors);
      $message.error("设置失败!");
    }
  });
};
</script>
