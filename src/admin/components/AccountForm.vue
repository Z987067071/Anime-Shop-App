<!-- src/admin/components/AccountForm.vue -->
<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleModelValueChange"
    :title="isEdit ? '编辑账户' : '新增账户'"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="accountFormRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="账号" prop="username" v-if="!isEdit">
        <el-input 
          v-model="formData.username" 
          placeholder="请输入登录账号" 
          :disabled="isEdit" 
        />
      </el-form-item>
      <el-form-item label="密码" prop="password" v-if="!isEdit">
        <el-input 
          v-model="formData.password" 
          type="password" 
          placeholder="请输入登录密码（6-20位）" 
        />
      </el-form-item>
      <el-form-item label="身份(Role)" prop="role">
        <el-select v-model="formData.role" placeholder="请选择账户角色">
          <el-option label="超级管理员" value="admin" />
          <el-option label="经理" value="manager" />
          <el-option label="组长" value="leader" />
          <el-option label="组员" value="member" />
          <el-option label="普通用户" value="consumer" />
        </el-select>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input 
          v-model="formData.email" 
          placeholder="请输入邮箱（选填）" 
        />
      </el-form-item>
      <el-form-item label="用户名" prop="nickname">
        <el-input 
          v-model="formData.nickname" 
          placeholder="请输入用户昵称" 
        />
      </el-form-item>
      <el-form-item label="手机号" prop="tel">
        <el-input 
          v-model="formData.tel" 
          placeholder="请输入手机号（选填）" 
        />
      </el-form-item>
      <el-form-item label="身份证号" prop="idCard">
        <el-input 
          v-model="formData.idCard" 
          placeholder="请输入身份证号（选填）" 
        />
      </el-form-item>
      <el-form-item label="账户状态" prop="status" v-if="isEdit">
        <el-select v-model="formData.status" placeholder="请选择账户状态">
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  initData: {
    type: Object,
    default: () => ({})
  },
  operatorRole: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'submit', 'update:model-value'])

const accountFormRef = ref(null)

const formData = reactive({
  id: '',
  username: '',
  password: '',
  role: '',
  email: '',
  nickname: '',
  tel: '',
  idCard: '',
  status: '1'
})

const formRules = reactive({
  username: [
    { required: true, message: '请输入登录账号', trigger: 'blur' },
    { min: 4, max: 20, message: '账号长度为4-20位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入登录密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择账户角色', trigger: 'change' }],
  nickname: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  tel: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  idCard: [
    { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, 
      message: '身份证号格式错误', trigger: 'blur' }
  ],
  email: [
    { pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/, 
      message: '邮箱格式错误', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择账户状态', trigger: 'change' }
  ]
})

watch(
  () => props.initData,
  (newVal) => {
    if (props.isEdit && newVal) {
      Object.assign(formData, {
        id: String(newVal.id) || '',
        username: newVal.username || '',
        role: newVal.role || '',
        email: newVal.email || '',
        nickname: newVal.nickname || '',
        tel: newVal.tel || '',
        idCard: newVal.idCard || '',
        status: newVal.status === 0 || newVal.status === 1 ? String(newVal.status) : '1'
      })
    }
  },
  { immediate: true, deep: true }
)

const handleModelValueChange = (newValue) => {
  emit('update:model-value', newValue)
  if (!newValue) {
    resetForm()
    emit('close')
  }
}

const handleClose = () => {
  resetForm()
  emit('close')
  emit('update:model-value', false)
}

const resetForm = () => {
  accountFormRef.value?.resetFields()
  Object.assign(formData, {
    id: '',
    username: '',
    password: '',
    role: '',
    email: '',
    nickname: '',
    tel: '',
    idCard: '',
    status: '1'
  })
}

const handleSubmit = () => {
  accountFormRef.value.validate((valid) => {
    if (valid) {
      const submitData = {
        ...formData,
        operatorRole: props.operatorRole
      }

      if (!props.isEdit) {
        delete submitData.status;
        delete submitData.id;
      } else {
        if (submitData.status) {
          submitData.status = Number(submitData.status)
        }
      }
      
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === undefined || submitData[key] === null) {
          delete submitData[key]
        }
      })
      if (!props.isEdit) {
        delete submitData.id
      }
      
      emit('submit', submitData)
      handleModelValueChange(false)
      resetForm()
    }
  })
}
</script>

<style scoped>
.el-form-item {
  margin-bottom: 18px;
}
</style>