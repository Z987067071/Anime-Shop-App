<template>
  <div class="feedback-detail-page">
    <header class="glass-header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <van-icon name="arrow-left" />
        </div>
        <h1 class="page-title">工单详情</h1>
        <div class="header-spacer"></div>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="main-content" v-if="detail">
      <!-- 工单信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <div class="ticket-info">
            <span class="ticket-no">工单号：{{ detail.ticketNo || detail.id }}</span>
            <van-tag :type="getStatusType(detail.status)" size="small">
              {{ getStatusText(detail.status) }}
            </van-tag>
          </div>
          <span class="create-time">{{ formatTime(detail.createTime) }}</span>
        </div>

        <div class="feedback-content">
          <p>{{ detail.feedbackContent }}</p>
        </div>

        <!-- 图片列表 -->
        <div class="image-list" v-if="detail.imageUrls && detail.imageUrls.length > 0">
          <img 
            v-for="(img, idx) in detail.imageUrls" 
            :key="idx"
            :src="img" 
            @click="previewImage(idx)"
            @error="handleImgError"
          />
        </div>
      </div>

      <!-- 回复列表 -->
      <div class="reply-section">
        <div class="section-title">
          <van-icon name="chat-o" />
          <span>处理记录</span>
          <span class="reply-count">{{ replies.length }} 条</span>
          <van-icon 
            v-if="!loadingReplies" 
            name="replay" 
            class="refresh-btn"
            @click="refreshReplies"
          />
          <van-loading v-else type="spinner" size="14px" class="refresh-loading" />
        </div>

        <!-- 回复列表内容 -->
        <div v-if="replies.length > 0" class="reply-list">
          <div 
            v-for="(reply, idx) in replies" 
            :key="reply.id || idx"
            class="reply-item"
            :class="{ 'is-admin': reply.isAdmin }"
          >
            <div class="reply-header">
              <div class="user-info">
                <div class="avatar" :class="{ 'admin-avatar': reply.isAdmin }">
                  {{ reply.isAdmin ? '👨‍💼' : '🙍‍♂️' }}
                </div>
                <span class="username">{{ reply.creator || (reply.isAdmin ? '客服' : '我') }}</span>
                <van-tag v-if="reply.isAdmin" type="danger" size="mini" class="admin-tag">官方</van-tag>
              </div>
              <span class="reply-time">{{ formatTime(reply.createTime) }}</span>
            </div>
            <div class="reply-content">
              <p>{{ reply.content }}</p>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-replies">
          <van-icon name="chat-o" size="48" color="#ddd" />
          <p>暂无回复，耐心等待客服处理哦~</p>
        </div>
      </div>

      <div class="bottom-spacer"></div>
    </div>

    <!-- 加载状态 -->
    <div class="loading-state" v-else>
      <van-loading type="spinner" />
      <span>加载中...</span>
    </div>

    <div class="action-section" v-if="detail && canReply">
      <div class="input-wrapper">
        <van-field
          v-model="replyContent"
          type="textarea"
          rows="1"
          autosize
          placeholder="补充说明..."
          maxlength="300"
          show-word-limit
          class="reply-input"
          @focus="onInputFocus"
          @blur="onInputBlur"
        />
        <button 
          class="reply-btn" 
          @click="submitReply"
          :disabled="!replyContent.trim() || submitting"
        >
          <van-loading v-if="submitting" type="spinner" size="16px" color="#fff" />
          <van-icon v-else name="guide-o" size="20" />
        </button>
      </div>
    </div>

    <div class="closed-tip" v-if="detail && detail.status === 4">
      <van-icon name="info-o" />
      <span>该工单已关闭，如有问题请提交新工单</span>
    </div>

    <!-- 图片预览 -->
    <van-image-preview
      v-model:show="showPreview"
      :images="previewImages"
      :start-position="previewIndex"
      @close="showPreview = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { getFeedbackDetail, addFeedbackReply, getFeedbackReplyList } from '@/api/mobile/feedback'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const feedbackId = route.params.id
const detail = ref(null)
const replies = ref([])
const replyContent = ref('')
const submitting = ref(false)
const loading = ref(false)
const loadingReplies = ref(false)

const showPreview = ref(false)
const previewImages = ref([])
const previewIndex = ref(0)

let pollTimer = null

const getStatusType = (status) => {
  const map = {
    0: 'warning',
    1: 'primary',
    2: 'success',
    3: 'danger',
    4: 'default'
  }
  return map[status] || 'default'
}

const getStatusText = (status) => {
  const map = {
    0: '待审核',
    1: '审核中',
    2: '已解决',
    3: '已驳回',
    4: '已关闭'
  }
  return map[status] || '未知'
}

const canReply = computed(() => {
  return detail.value && [0, 1].includes(detail.value.status)
})

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return `今天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  
  if (diff < 48 * 60 * 60 * 1000 && date.getDate() === now.getDate() - 1) {
    return `昨天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const loadDetail = async () => {
  loading.value = true
  try {
    const res = await getFeedbackDetail({
      id: feedbackId,
      userId: userStore.id
    })
    
    if (res.code === 0) {
      detail.value = res.data
      previewImages.value = res.data.imageUrls || []
      await loadReplies()
    } else {
      ElMessage.error(res.msg || '获取详情失败')
      router.back()
    }
  } catch (error) {
    ElMessage.error('网络异常')
    router.back()
  } finally {
    loading.value = false
  }
}

const loadReplies = async () => {
  loadingReplies.value = true
  try {
    const res = await getFeedbackReplyList(feedbackId)
    if (res.code === 0) {
      replies.value = res.data || []
    } else {
      console.error('获取回复列表失败:', res.msg)
    }
  } catch (error) {
    console.error('获取回复列表异常:', error)
  } finally {
    loadingReplies.value = false
  }
}

const refreshReplies = () => {
  if (loadingReplies.value) return
  loadReplies()
}

const previewImage = (index) => {
  previewIndex.value = index
  showPreview.value = true
}

// 图片错误处理
const handleImgError = (e) => {
  e.target.style.display = 'none'
}

// 提交回复
const submitReply = async () => {
  const content = replyContent.value.trim()
  if (!content) return
  
  submitting.value = true
  try {
    const res = await addFeedbackReply({
      feedbackId: feedbackId,
      userId: userStore.id,
      content: content,
      isAdmin: 0,
      replyer: userStore.username
    })
    
    if (res.code === 0) {
      ElMessage.success('发送成功')
      replyContent.value = ''
      await loadReplies()
      scrollToBottom()
    } else {
      ElMessage.error(res.msg || '发送失败')
    }
  } catch (error) {
    ElMessage.error('网络异常')
  } finally {
    submitting.value = false
  }
}

const scrollToBottom = () => {
  setTimeout(() => {
    const replyList = document.querySelector('.reply-list')
    if (replyList) {
      replyList.scrollTop = replyList.scrollHeight
    }
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }, 100)
}

const onInputFocus = () => {
  setTimeout(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }, 300)
}

const onInputBlur = () => {
  // 可以在这里处理失焦逻辑
}

const startPolling = () => {
  pollTimer = setInterval(() => {
    if (document.visibilityState === 'visible') {
      loadReplies()
    }
  }, 30000)
}

// 停止轮询
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// 返回
const goBack = () => {
  router.back()
}

onMounted(() => {
  if (!userStore.token) {
    ElMessage.info('请先登录')
    router.replace('/login')
    return
  }
  loadDetail()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.feedback-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 100px;
}

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

/* 信息卡片 */
.info-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.ticket-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ticket-no {
  font-size: 13px;
  color: #999;
  font-family: monospace;
}

.create-time {
  font-size: 12px;
  color: #bbb;
}

.feedback-content {
  font-size: 15px;
  color: #333;
  line-height: 1.8;
  margin-bottom: 16px;
}

.feedback-content p {
  margin: 0;
}

/* 图片列表 */
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-list img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  background: #f5f5f5;
  cursor: pointer;
}

/* 回复区域 */
.reply-section {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  min-height: 200px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.section-title .van-icon {
  color: #ff2442;
}

.reply-count {
  margin-left: auto;
  font-size: 12px;
  color: #999;
  font-weight: normal;
  margin-right: 8px;
}

.refresh-btn {
  color: #999;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.3s;
}

.refresh-btn:active {
  transform: rotate(180deg);
  color: #ff2442;
}

.refresh-loading {
  margin-left: 4px;
}

/* 空状态 */
.empty-replies {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
}

.empty-replies p {
  margin-top: 12px;
  font-size: 13px;
}

/* 回复列表 */
.reply-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.reply-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reply-item.is-admin {
  align-items: flex-end;
}

.reply-item.is-admin .reply-header {
  flex-direction: row-reverse;
}

.reply-item.is-admin .user-info {
  flex-direction: row-reverse;
}

.reply-item.is-admin .reply-content {
  background: linear-gradient(135deg, #fff5f7 0%, #ffeef1 100%);
  border-radius: 16px 16px 4px 16px;
  border: 1px solid rgba(255, 36, 66, 0.1);
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.avatar {
  font-size: 20px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
}

.avatar.admin-avatar {
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
}

.username {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.admin-tag {
  margin-left: 4px;
}

.reply-time {
  font-size: 11px;
  color: #bbb;
}

.reply-content {
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 16px 16px 16px 4px;
  max-width: 85%;
  word-break: break-all;
}

.reply-content p {
  margin: 0;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

/* 底部占位 */
.bottom-spacer {
  height: 80px;
}

/* 操作区域 */
.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 12px 16px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  max-width: 600px;
  margin: 0 auto;
  z-index: 99;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: #f8f9fa;
  border-radius: 24px;
  padding: 8px 8px 8px 16px;
}

.reply-input {
  flex: 1;
  background: transparent;
  padding: 0;
}

:deep(.reply-input .van-field__control) {
  font-size: 14px;
  line-height: 1.5;
  max-height: 100px;
}

:deep(.reply-input .van-field__word-limit) {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.reply-btn {
  width: 40px;
  height: 40px;
  min-width: 40px;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.3);
}

.reply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.reply-btn:not(:disabled):active {
  transform: scale(0.9);
}

/* 已关闭提示 */
.closed-tip {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #fff3e0;
  color: #ff9800;
  border-radius: 24px;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 100px 20px;
  color: #999;
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .feedback-detail-page {
    background: #1a1a2e;
  }
  
  .glass-header {
    background: rgba(26, 26, 46, 0.95);
  }
  
  .page-title {
    color: #fff;
  }
  
  .back-btn {
    color: #fff;
  }
  
  .info-card,
  .reply-section {
    background: #242442;
  }
  
  .ticket-no,
  .create-time {
    color: #888;
  }
  
  .feedback-content {
    color: #e0e0e0;
  }
  
  .section-title {
    color: #e0e0e0;
  }
  
  .refresh-btn {
    color: #666;
  }
  
  .empty-replies {
    color: #666;
  }
  
  .reply-content {
    background: #1a1a2e;
  }
  
  .reply-content p {
    color: #e0e0e0;
  }
  
  .reply-item.is-admin .reply-content {
    background: linear-gradient(135deg, #2a1f3d 0%, #3d1f2f 100%);
    border-color: rgba(255, 36, 66, 0.2);
  }
  
  .action-section {
    background: #242442;
  }
  
  .input-wrapper {
    background: #1a1a2e;
  }
  
  :deep(.reply-input .van-field__control) {
    color: #e0e0e0;
  }
  
  .avatar {
    background: #333;
  }
}
</style>