<template>
  <div class="publish-page">
    <header class="glass-header" :class="{ 'scrolled': isScrolled }">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <van-icon name="arrow-left" />
        </div>
        <h1 class="site-title">发布帖子</h1>
        <div class="header-placeholder"></div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content" @scroll="handleScroll">
      <div class="form-container">
        <van-form @submit="onSubmit" class="custom-form">
          <div class="input-card">
            <div class="input-label">
              <span class="label-icon">✏️</span>
              <span class="label-text">标题</span>
              <span class="label-required">*</span>
            </div>
            <van-field
              v-model="postForm.title"
              name="title"
              placeholder="请输入帖子标题（最多200字）"
              :rules="[{ required: true, message: '请输入标题' }, { max: 200, message: '标题最多200字' }]"
              rows="1"
              class="custom-field"
            />
          </div>
          
          <!-- 内容输入 -->
          <div class="input-card">
            <div class="input-label">
              <span class="label-icon">📝</span>
              <span class="label-text">内容</span>
              <span class="label-required">*</span>
            </div>
            <van-field
              v-model="postForm.content"
              name="content"
              placeholder="请输入帖子内容（最多5000字）"
              :rules="[{ required: true, message: '请输入内容' }, { max: 5000, message: '内容最多5000字' }]"
              type="textarea"
              rows="6"
              autosize
              class="custom-field textarea-field"
            />
          </div>
          
          <!-- 图片上传 -->
          <div class="input-card upload-card">
            <div class="input-label">
              <span class="label-icon">🖼️</span>
              <span class="label-text">图片</span>
              <span class="label-optional">（可选，最多9张）</span>
            </div>
            <div class="uploader-wrapper">
              <van-uploader
                v-model="fileList"
                multiple
                :max-count="9"
                :after-read="afterRead"
                @delete="onDeleteImage"
                upload-icon="plus"
                class="custom-uploader"
              />
            </div>
          </div>
          
          <!-- 提交按钮 -->
          <div class="submit-section">
            <van-button 
              type="primary" 
              native-type="submit" 
              :loading="submitting"
              class="submit-btn"
              block
            >
              <span class="btn-text">发布帖子</span>
              <van-icon name="success" class="btn-icon" />
            </van-button>
          </div>
        </van-form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, closeToast } from 'vant'
import { useUserStore } from '@/stores/user'
import communityPostApi from '@/api/mobile/communityPost'

const router = useRouter()
const submitting = ref(false)
const fileList = ref([])
const userStore = useUserStore()

const postForm = ref({
  title: '',
  content: '',
  imageUrlsList: [],
  userId: userStore.id ? Number(userStore.id) : '',
  userAvatar: userStore.avatar || '', 
  userName: userStore.username || ''
})
const isScrolled = ref(false)

const goBack = () => {
  router.go(-1)
}

const handleScroll = (e) => {
  isScrolled.value = e.target.scrollTop > 50
}


const afterRead = async (file) => {
  try {
    const loadingToast = showToast({
      type: 'loading',
      message: '图片上传中...',
      forbidClick: true,
      duration: 0
    })
    
    const uploadFormData = new FormData()
    uploadFormData.append('file', file.file)
    
    const res = await communityPostApi.uploadPostImage(uploadFormData)
    if (res.code === 0) {
      postForm.value.imageUrlsList.push(res.data)
      file.status = 'success'
    } else {
      file.status = 'failed'
      showToast({
        type: 'fail',
        message: res.msg || '图片上传失败'
      })
    }
  } catch (e) {
    file.status = 'failed'
    console.error('图片上传失败：', e)
    showToast({
      type: 'fail',
      message: '图片上传失败，请重试'
    })
  } finally {
    closeToast()
  }
}

const onDeleteImage = (index) => {
  postForm.value.imageUrlsList.splice(index, 1)
}

const onSubmit = async () => {
  if (!postForm.value.userId) {
    showToast({ type: 'warning', message: '请先登录' })
    router.push('/login')
    return
  }
  if (!postForm.value.userName) {
    showToast({ type: 'warning', message: '用户名不能为空' })
    return
  }

  if (submitting.value) return
  
  submitting.value = true
  try {
    const loadingToast = showToast({
      type: 'loading',
      message: '发布中...',
      forbidClick: true,
      duration: 0
    })
    
    const res = await communityPostApi.publishPost(postForm.value)
    if (res.code === 0) {
      showToast({
        type: 'success',
        message: '发布成功'
      })
      setTimeout(() => {
        router.push('/postList')
      }, 1500)
    } else {
      showToast({
        type: 'fail',
        message: res.msg || '发布失败'
      })
    }
  } catch (e) {
    console.error('发布失败：', e)
    showToast({
      type: 'fail',
      message: '发布失败，请重试'
    })
  } finally {
    submitting.value = false
    closeToast()
  }
}

onMounted(() => {
  if (userStore.id) {
    postForm.value.userId = Number(userStore.id)
    postForm.value.userAvatar = userStore.avatar || ''
    postForm.value.userName = userStore.username || ''
  }
})
</script>

<style scoped>
.publish-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff5f7 0%, #ffffff 100%);
  padding-bottom: 60px;
}

.glass-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.glass-header.scrolled {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 6px 16px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 600px;
  margin: 0 auto;
  height: 44px;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:active {
  background: #eee;
  transform: scale(0.95);
}

.back-btn .van-icon {
  font-size: 20px;
  color: #333;
  font-weight: bold;
}

.site-title {
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.header-placeholder {
  width: 36px;
}

/* 主内容区 */
.main-content {
  padding-top: 70px;
  overflow-y: auto;
  height: 100vh;
  -webkit-overflow-scrolling: touch;
}

/* 表单容器 */
.form-container {
  padding: 12px 16px;
}

/* 输入卡片 - 新拟态风格 */
.input-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transition: all 0.3s;
}

.input-card:active {
  transform: scale(0.99);
}

.input-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.label-icon {
  font-size: 18px;
}

.label-text {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.label-required {
  color: #ff2442;
  font-weight: bold;
}

.label-optional {
  font-size: 12px;
  color: #999;
  font-weight: normal;
}

/* 自定义输入框 */
.custom-field {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px;
  font-size: 15px;
}

.custom-field :deep(.van-field__control) {
  color: #333;
}

.custom-field :deep(.van-field__control::placeholder) {
  color: #bbb;
}

.textarea-field :deep(.van-field__control) {
  min-height: 120px;
  line-height: 1.6;
}

/* 上传区域 */
.upload-card {
  padding-bottom: 20px;
}

.uploader-wrapper {
  margin-top: 8px;
}

.custom-uploader :deep(.van-uploader__upload) {
  width: 80px;
  height: 80px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #ddd;
  margin: 0;
}

.custom-uploader :deep(.van-uploader__upload:active) {
  background: #f0f0f0;
  border-color: #ff2442;
}

.custom-uploader :deep(.van-uploader__upload-icon) {
  color: #ccc;
  font-size: 24px;
}

.custom-uploader :deep(.van-uploader__preview) {
  margin: 0 8px 8px 0;
}

.custom-uploader :deep(.van-uploader__preview-image) {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
}

/* 提交区域 */
.submit-section {
  margin-top: 24px;
  padding: 0 4px;
}

.submit-btn {
  height: 48px;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(255, 36, 66, 0.3);
  transition: all 0.3s;
}

.submit-btn:active {
  transform: scale(0.98);
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.2);
}

.submit-btn :deep(.van-button__content) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-text {
  letter-spacing: 2px;
}

.btn-icon {
  font-size: 18px;
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .publish-page {
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  }
  
  .glass-header {
    background: rgba(26, 26, 46, 0.9);
  }
  
  .site-title {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
    -webkit-background-clip: text;
  }
  
  .back-btn {
    background: #2a2a4a;
  }
  
  .back-btn .van-icon {
    color: #e0e0e0;
  }
  
  .input-card {
    background: #242442;
  }
  
  .label-text {
    color: #e0e0e0;
  }
  
  .custom-field {
    background: #1a1a3e;
  }
  
  .custom-field :deep(.van-field__control) {
    color: #e0e0e0;
  }
  
  .custom-field :deep(.van-field__control::placeholder) {
    color: #666;
  }
  
  .custom-uploader :deep(.van-uploader__upload) {
    background: #1a1a3e;
    border-color: #2a2a4a;
  }
  
  .custom-uploader :deep(.van-uploader__upload-icon) {
    color: #666;
  }
}

/* 适配移动端 */
@media (max-width: 375px) {
  .form-container {
    padding: 8px 12px;
  }
  
  .input-card {
    padding: 12px;
  }
  
  .site-title {
    font-size: 16px;
  }
}
</style>