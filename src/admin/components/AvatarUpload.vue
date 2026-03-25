<template>
  <div class="avatar-dropdown">
    <!-- 头像按钮 -->
    <el-dropdown trigger="click" @command="handleCommand">
      <div class="avatar-wrapper">
        <el-avatar :src="props.avatarUrl" class="user-avatar"></el-avatar>
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </div>
      <!-- 下拉菜单 -->
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="changeAvatar">更换头像</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 头像上传弹窗 -->
    <el-dialog v-model="avatarDialogVisible" title="更换头像" width="400px" destroy-on-close>
      <el-upload
        class="avatar-uploader"
        action="http://localhost:8080/api/admin/users/avatar/upload"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeAvatarUpload"
        :headers="uploadHeaders"
        name="file"
        :data="uploadData"
      >
        <img v-if="props.avatarUrl" :src="props.avatarUrl" class="avatar-preview" />
        <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
      </el-upload>
      <template #footer>
        <el-button @click="avatarDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="avatarDialogVisible = false">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowDown, Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  avatarUrl: {
    type: String,
    default: ''
  }
})
const user = useUserStore()


const uploadData = ref({
  userId: user.id || '1999834598331097089',
  operatorRole: user.role || 'admin'
})


const emit = defineEmits(['avatarChange'])
const avatarDialogVisible = ref(false)

const uploadHeaders = ref({
  'Authorization': 'Bearer ' + localStorage.getItem('token')
})

const handleCommand = (command) => {
  if (command === 'changeAvatar') {
    avatarDialogVisible.value = true
  }
}

const handleAvatarSuccess = (response) => {
  if (response.code === 0) {
    const newAvatarUrl = response.data
    emit('avatarChange', newAvatarUrl)
    ElMessage.success('头像上传成功！')
    avatarDialogVisible.value = false
  } else {
    ElMessage.error('头像上传失败：' + (response.msg || '服务器错误'))
  }
}

const handleUploadError = (error) => {
  console.error('上传失败详情：', error)
  if (error.response) {
    ElMessage.error(`上传失败：${error.response.data.msg || '服务器错误'}`)
  } else if (error.request) {
    ElMessage.error('上传失败：请检查后端服务是否启动，或是否配置跨域')
  } else {
    ElMessage.error(`上传失败：${error.message}`)
  }
}

const beforeAvatarUpload = (rawFile) => {
  const isImage = rawFile.type.startsWith('image/')
  const isLt2M = rawFile.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('请上传图片格式的文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB！')
    return false
  }
  return true
}
</script>

<style scoped>
.avatar-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  padding: 0 4px;
  height: 36px;
  border-radius: 18px;
  transition: background-color 0.2s;
}

.avatar-wrapper:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  width: 28px;
  height: 28px;
  margin-right: 2px;
}

.el-icon--right {
  font-size: 12px;
}

.avatar-uploader {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.avatar-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 150px;
  height: 150px;
  line-height: 150px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
}
</style>