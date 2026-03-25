<template>
  <div class="feedback-add-page">
    <!-- 玻璃拟态头部 -->
    <header class="glass-header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <van-icon name="arrow-left" />
        </div>
        <h1 class="page-title">提交反馈</h1>
        <div class="header-spacer"></div>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="main-content">
      <div class="form-card">
        <!-- 反馈内容 -->
        <div class="form-section">
          <div class="section-title">
            <van-icon name="edit" />
            <span>问题描述</span>
          </div>
          <van-field
            v-model="form.feedbackContent"
            type="textarea"
            rows="6"
            placeholder="请详细描述您遇到的问题或建议，我们会尽快处理..."
            maxlength="500"
            show-word-limit
            class="content-field"
          />
        </div>

        <!-- 图片上传 -->
        <div class="form-section">
          <div class="section-title">
            <van-icon name="photograph" />
            <span>上传图片（可选）</span>
            <span class="upload-tip">最多6张</span>
          </div>
          <div class="upload-area">
            <van-uploader
              v-model="fileList"
              multiple
              :max-count="6"
              :after-read="afterRead"
              :before-read="beforeRead"
              @delete="onDelete"
            />
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="submit-section">
          <button 
            class="submit-btn" 
            @click="submitFeedback"
            :disabled="submitting || !form.feedbackContent.trim()"
          >
            <van-loading v-if="submitting" type="spinner" size="20px" />
            <template v-else>
              <van-icon name="success" />
              <span>提交反馈</span>
            </template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { addFeedback, uploadFeedbackImage } from '@/api/mobile/feedback'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const form = ref({
  userId: userStore.id,
  feedbackContent: '',
  creator: userStore.nickname || userStore.username,
  imageUrls: []
})

const fileList = ref([])
const submitting = ref(false)

// 上传前校验
const beforeRead = (file) => {
  // 限制图片类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请上传图片文件')
    return false
  }
  
  // 限制大小 5MB
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过5MB')
    return false
  }
  
  return true
}

// 读取后上传
const afterRead = async (file) => {
  // 设置上传状态
  file.status = 'uploading'
  file.message = '上传中...'
  
  try {
    const formData = new FormData()
    formData.append('files', file.file)
    
    const res = await uploadFeedbackImage(formData)
    
    if (res.code === 0) {
      file.status = 'done'
      file.url = res.data?.[0] || file.content
      // 保存URL到表单
      form.value.imageUrls.push(res.data?.[0])
    } else {
      file.status = 'failed'
      file.message = '上传失败'
      ElMessage.error(res.msg || '图片上传失败')
    }
  } catch (error) {
    file.status = 'failed'
    file.message = '上传失败'
    ElMessage.error('网络异常，图片上传失败')
    console.error('图片上传失败：', error)
  }
}

// 删除图片
const onDelete = (file, detail) => {
  const index = detail.index
  form.value.imageUrls.splice(index, 1)
}

// 提交反馈
const submitFeedback = async () => {
  if (!form.value.feedbackContent.trim()) {
    ElMessage.warning('请输入反馈内容')
    return
  }
  
  if (form.value.feedbackContent.length < 10) {
    ElMessage.warning('反馈内容至少10个字')
    return
  }

  submitting.value = true
  
  try {
    // 过滤掉上传失败的图片
    const validImages = fileList.value
      .filter(f => f.status === 'done' && f.url)
      .map(f => f.url)
    
    form.value.imageUrls = validImages
    
    const res = await addFeedback(form.value)
    
    if (res.code === 0) {
      ElMessage.success('反馈提交成功')
      router.replace({ name: 'Feedback' })
    } else {
      ElMessage.error(res.msg || '提交失败')
    }
  } catch (error) {
    ElMessage.error('网络异常，提交失败')
    console.error('提交反馈失败：', error)
  } finally {
    submitting.value = false
  }
}

// 返回
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.feedback-add-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 玻璃拟态头部 */
.glass-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 16px;
  max-width: 600px;
  margin: 0 auto;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #333;
  font-size: 20px;
}

.back-btn:active {
  background: rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.header-spacer {
  width: 36px;
}

/* 主内容区 */
.main-content {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

/* 表单卡片 */
.form-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

/* 表单区块 */
.form-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.section-title .van-icon {
  color: #ff2442;
  font-size: 18px;
}

.upload-tip {
  margin-left: auto;
  font-size: 12px;
  color: #999;
  font-weight: normal;
}

/* 内容输入框 */
.content-field {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px;
}

:deep(.content-field .van-field__control) {
  font-size: 15px;
  line-height: 1.6;
}

:deep(.content-field .van-field__control::placeholder) {
  color: #bbb;
}

/* 上传区域 */
.upload-area {
  :deep(.van-uploader) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  :deep(.van-uploader__upload) {
    width: 80px;
    height: 80px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px dashed #ddd;
  }
  
  :deep(.van-uploader__preview-image) {
    width: 80px;
    height: 80px;
    border-radius: 8px;
  }
}

/* 提交按钮 */
.submit-section {
  margin-top: 32px;
}

.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  border: none;
  border-radius: 28px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(255, 36, 66, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):active {
  transform: scale(0.98);
}

.submit-btn .van-icon {
  font-size: 20px;
}
</style>