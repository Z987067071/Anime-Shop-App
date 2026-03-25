<template>
  <el-dialog
    v-model="visible"
    title="重置密码"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
      autocomplete="off"
    >
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="formData.newPassword"
          type="password"
          placeholder="请输入6-20位密码"
          show-password
          maxlength="20"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
          maxlength="20"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button 
        type="primary" 
        @click="handleConfirm"
        :loading="loading"
      >
        确认重置
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  userId: {
    type: [String, Number],
    required: true
  },
  operatorRole: {
    type: String,
    required: true
  },
  resetPasswordApi: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'success', 'fail'])
const visible = ref(props.modelValue)
const loading = ref(false)
const formRef = ref(null)
const formData = reactive({
  newPassword: '',
  confirmPassword: ''
})

const formRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在6-20位之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) return callback()
        if (value !== formData.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      formRef.value?.resetFields()
      formData.newPassword = ''
      formData.confirmPassword = ''
    }
  },
  { immediate: true }
)

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleConfirm = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    const res = await props.resetPasswordApi({
      id: props.userId,
      newPassword: formData.newPassword,
      operatorRole: props.operatorRole
    })

    if (res.code === 0) {
      ElMessage.success('密码重置成功')
      emit('success')
      visible.value = false
    } else {
      ElMessage.error(res.msg || '密码重置失败')
      emit('fail', res)
    }
  } catch (error) {
    if (error.name !== 'ValidationError') {
      ElMessage.error('系统异常，请稍后重试')
      emit('fail', error)
    }
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.el-input {
  width: 100%;
}
</style>