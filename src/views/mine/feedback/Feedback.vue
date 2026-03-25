<template>
  <div class="feedback-page">
    <!-- 玻璃拟态头部 -->
    <header class="glass-header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <van-icon name="arrow-left" />
        </div>
        <h1 class="page-title">工单反馈</h1>
        <div class="header-action" @click="goAddFeedback">
          <van-icon name="plus" />
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 状态筛选 -->
      <div class="filter-tabs">
        <span 
          v-for="tab in statusTabs" 
          :key="tab.value"
          :class="{ active: activeStatus === tab.value }"
          @click="switchTab(tab.value)"
        >
          {{ tab.label }}
        </span>
      </div>

      <!-- 加载状态 -->
      <div class="loading-state" v-if="loading">
        <van-loading type="spinner" />
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else-if="feedbackList.length === 0">
        <div class="empty-icon">📝</div>
        <h3>暂无工单</h3>
        <p>遇到问题？提交工单反馈给我们</p>
        <button class="add-btn" @click="goAddFeedback">
          提交新工单
        </button>
      </div>

      <!-- 工单列表 -->
      <div class="feedback-list" v-else>
        <div 
          v-for="item in feedbackList" 
          :key="item.id"
          class="feedback-card"
          @click="goDetail(item.id)"
        >
          <div class="card-header">
            <span class="ticket-no">工单号：{{ item.ticketNo || item.id }}</span>
            <van-tag :type="getStatusType(item.status)" size="small">
              {{ getStatusText(item.status) }}
            </van-tag>
          </div>
          
          <div class="card-content">
            <p class="feedback-text">{{ item.feedbackContent }}</p>
            <div class="image-preview" v-if="item.imageUrls && item.imageUrls.length > 0">
              <img 
                v-for="(img, idx) in item.imageUrls.slice(0, 3)" 
                :key="idx"
                :src="img" 
                @error="handleImgError"
              />
              <div class="more-images" v-if="item.imageUrls.length > 3">
                +{{ item.imageUrls.length - 3 }}
              </div>
            </div>
          </div>

          <div class="card-footer">
            <span class="create-time">{{ formatTime(item.createTime) }}</span>
            <span class="reply-count" v-if="item.replyCount > 0">
              {{ item.replyCount }} 条回复
            </span>
          </div>
        </div>

        <!-- 加载更多 -->
        <div class="load-more" v-if="hasMore">
          <van-button 
            size="small" 
            type="default" 
            :loading="loadingMore"
            @click="loadMore"
          >
            加载更多
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { getFeedbackList } from '@/api/mobile/feedback'

const router = useRouter()
const userStore = useUserStore()

// 状态筛选
const statusTabs = [
  { label: '全部', value: null },
  { label: '待处理', value: 0 },
  { label: '处理中', value: 1 },
  { label: '已解决', value: 2 }
]

const activeStatus = ref(null)
const loading = ref(false)
const loadingMore = ref(false)
const feedbackList = ref([])
const page = ref(1)
const hasMore = ref(false)

// 状态映射
const getStatusType = (status) => {
  const map = {
    0: 'warning',    // 待审核
    1: 'primary',    // 审核中
    2: 'success',    // 已解决
    3: 'danger',     // 已驳回
    4: 'default'     // 已关闭
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

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 加载工单列表
const loadFeedbackList = async (isLoadMore = false) => {
  if (!isLoadMore) {
    loading.value = true
    page.value = 1
  } else {
    loadingMore.value = true
  }

  try {
    const res = await getFeedbackList({
      userId: userStore.id,
      status: activeStatus.value,
      page: page.value,
      size: 10
    })

    if (res.code === 0) {
      const list = res.data?.records || []
      if (isLoadMore) {
        feedbackList.value.push(...list)
      } else {
        feedbackList.value = list
      }
      hasMore.value = list.length === 10
    } else {
      ElMessage.error(res.msg || '获取工单列表失败')
    }
  } catch (error) {
    console.error('获取工单列表失败：', error)
    ElMessage.error('网络异常')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 切换标签
const switchTab = (status) => {
  activeStatus.value = status
  loadFeedbackList()
}

// 加载更多
const loadMore = () => {
  page.value++
  loadFeedbackList(true)
}

// 图片错误处理
const handleImgError = (e) => {
  e.target.style.display = 'none'
}

// 跳转详情
const goDetail = (id) => {
  router.push({ name: 'FeedbackDetail', params: { id } })
}

// 跳转新增
const goAddFeedback = () => {
  router.push({ name: 'FeedbackAdd' })
}

// 返回
const goBack = () => {
  router.push({ name: 'Mine' })
}

onMounted(() => {
  if (!userStore.token) {
    ElMessage.info('请先登录')
    router.replace('/login')
    return
  }
  loadFeedbackList()
})
</script>

<style scoped>
.feedback-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 20px;
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

.header-action {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  border-radius: 50%;
  color: white;
  font-size: 18px;
}

/* 主内容区 */
.main-content {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

/* 筛选标签 */
.filter-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.filter-tabs span {
  padding: 8px 16px;
  background: white;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-tabs span.active {
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  font-weight: 500;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 60px;
  color: #999;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  color: #333;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: #999;
  margin: 0 0 24px 0;
}

.add-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
}

/* 工单卡片 */
.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feedback-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.ticket-no {
  font-size: 12px;
  color: #999;
  font-family: monospace;
}

.feedback-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 图片预览 */
.image-preview {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.image-preview img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  background: #f5f5f5;
}

.more-images {
  width: 60px;
  height: 60px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
  font-size: 12px;
  color: #999;
}

.reply-count {
  color: #ff2442;
  font-weight: 500;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 20px;
}
</style>