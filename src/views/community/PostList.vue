<template>
  <div class="post-list-page">
    <header class="glass-header" :class="{ 'scrolled': isScrolled }">
      <div class="header-content">
        <div class="back-btn" @click="router.push('/')">
          <van-icon name="arrow-left" />
        </div>
        <div class="logo-section">
          <div class="logo-icon">💬</div>
          <h1 class="site-title">社区帖子</h1>
        </div>
        <div class="header-placeholder"></div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content" @scroll="handleScroll">
      <div class="post-list-container">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多内容了"
            @load="loadMore"
            :immediate-check="false"
            offset="100"
            class="post-list"
          >
            <!-- 空数据提示 -->
            <div v-if="postList.length === 0 && !loading" class="empty-tip">
              <div class="empty-illustration">
                <div class="floating-box">📝</div>
                <div class="shadow"></div>
              </div>
              <p class="empty-text">暂无帖子，快来发布第一条吧～</p>
              <button class="refresh-btn" @click="onRefresh">刷新试试</button>
            </div>
            
            <!-- 帖子卡片 -->
            <div
              v-for="item in postList"
              :key="item.id"
              class="post-card"
              @click="goToDetail(item.id)"
            >
              <div class="post-header">
                <div class="user-info-left">
                  <img 
                    :src="item.userAvatar || '/static/default-avatar.png'" 
                    alt="用户头像"
                    class="user-avatar"
                    @error="handleAvatarError"
                  />
                  <div class="user-info">
                    <div class="username">{{ item.userName || '匿名用户' }}</div>
                    <div class="post-time">{{ formatTime(item.createTime) }}</div>
                  </div>
                </div>
                <div class="user-id">ID: {{ item.userId }}</div>
              </div>
              
              <!-- 帖子内容区 -->
              <div class="post-body">
                <div class="post-title">{{ item.title }}</div>
                <div class="post-content">{{ ellipsis(item.content, 120) }}</div>
                
                <!-- 帖子图片 -->
                <van-grid 
                  v-if="item.imageUrls && item.imageUrls.trim()" 
                  :column-num="3" 
                  :border="false" 
                  class="post-images"
                >
                  <van-grid-item
                    v-for="(url, index) in item.imageUrls.split(',').filter(u => u.trim())"
                    :key="index"
                    @click.stop="previewImage(url, item.imageUrls.split(',').filter(u => u.trim()))"
                    class="image-item"
                  >
                    <img :src="url" class="post-image" />
                  </van-grid-item>
                </van-grid>
              </div>
              
              <div class="post-stats">
                <div class="stat-item">
                  <van-icon name="good-job-o" class="stats-icon" />
                  <span class="stats-text">{{ Number(item.likeCount) }}</span>
                </div>
                <div class="stat-item">
                  <van-icon name="comment-o" class="stats-icon" />
                  <span class="stats-text">{{ Number(item.commentCount) }}</span>
                </div>
                <div class="stat-item">
                  <van-icon name="eye-o" class="stats-icon" />
                  <span class="stats-text">{{ Number(item.viewCount) }}</span>
                </div>
              </div>
            </div>
          </van-list>
        </van-pull-refresh>
        
        <!-- 发布按钮 -->
        <div class="publish-btn-wrapper">
          <div class="promo-pulse"></div>
          <van-button
            type="primary"
            shape="round"
            class="publish-btn"
            @click="goToPublish"
          >
            <van-icon name="plus" class="publish-icon" />
          </van-button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showImagePreview } from 'vant'
import communityPostApi from '@/api/mobile/communityPost'
import { useUserStore } from '@/stores/user'

// 初始化用户仓库
const userStore = useUserStore()
const router = useRouter()

// 列表数据
const postList = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const isRequesting = ref(false)
const isScrolled = ref(false)

const handleAvatarError = (e) => {
  e.target.src = '/static/default-avatar.png'
}

// 加载帖子列表
const loadPostList = async () => {
  if (isRequesting.value) return
  isRequesting.value = true
  
  try {
    const res = await communityPostApi.getPostList({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      status: 1
    })
    if (res.code === 0) {
      const list = res.data.records || []
      const formattedList = list.map(item => ({
        ...item,
        likeCount: Number(item.likeCount) || 0,
        commentCount: Number(item.commentCount) || 0,
        viewCount: Number(item.viewCount) || 0,
        status: Number(item.status) || 1
      }))
      
      if (refreshing.value) {
        postList.value = formattedList
        refreshing.value = false
      } else {
        postList.value = [...postList.value, ...formattedList]
      }
      
      const totalPages = Number(res.data.pages) || 1
      finished.value = pageNum.value >= totalPages
    } else {
      showToast(res.msg || '加载失败')
    }
  } catch (e) {
    console.error('加载帖子失败：', e)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
    isRequesting.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  pageNum.value = 1
  finished.value = false
  loadPostList()
}

// 上拉加载更多
const loadMore = () => {
  if (loading.value || finished.value) return
  loading.value = true
  pageNum.value++
  loadPostList()
}

// 跳转详情
const goToDetail = (id) => {
  router.push(`/postList/detail/${id}`)
}

// 跳转发布帖子
const goToPublish = () => {
  router.push('/postList/addPost')
}

// 预览图片
const previewImage = (url, urls) => {
  showImagePreview({
    images: urls,
    startPosition: urls.indexOf(url),
    closeable: true
  })
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 文本截断
const ellipsis = (value, len) => {
  if (!value) return ''
  return value.length > len ? `${value.slice(0, len)}...` : value
}

// 滚动监听
const handleScroll = (e) => {
  isScrolled.value = e.target.scrollTop > 50
}


onUnmounted(() => {
  postList.value = []
  loading.value = false
  finished.value = false
  refreshing.value = false
  pageNum.value = 1
  isRequesting.value = false
})

onMounted(() => {
  loadPostList()
})
</script>

<style scoped>
.post-list-page {
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
  max-width: 600px;
  margin: 0 auto;
  justify-content: space-between;
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

.header-placeholder {
  width: 36px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 28px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.site-title {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

/* 主内容区 */
.main-content {
  padding-top: 60px;
  overflow-y: auto;
  height: 100vh;
  -webkit-overflow-scrolling: touch;
}

/* 列表容器 */
.post-list-container {
  padding: 12px 16px;
  padding-bottom: 100px;
}

.empty-tip {
  text-align: center;
  padding: 60px 20px;
}

.empty-illustration {
  position: relative;
  height: 120px;
  margin-bottom: 20px;
}

.floating-box {
  font-size: 60px;
  animation: float 3s ease-in-out infinite;
  display: inline-block;
}

.shadow {
  width: 60px;
  height: 10px;
  background: rgba(0,0,0,0.1);
  border-radius: 50%;
  margin: 10px auto 0;
  animation: shadow 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes shadow {
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(0.8); opacity: 0.05; }
}

.empty-text {
  color: #999;
  font-size: 14px;
  margin-bottom: 20px;
}

.refresh-btn {
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s;
}

.refresh-btn:active {
  transform: scale(0.95);
}

.post-list {
  --van-list-padding: 0;
}

.post-card {
  background: white;
  border-radius: 16px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transition: all 0.3s;
  cursor: pointer;
}

.post-card:active {
  transform: scale(0.98);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.user-info-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.user-id {
  font-size: 11px;
  color: #ccc;
  background: #f5f5f5;
  padding: 4px 10px;
  border-radius: 12px;
}

/* 帖子内容区 */
.post-body {
  padding: 16px;
}

.post-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 10px;
  line-height: 1.4;
  background: linear-gradient(135deg, #333 0%, #666 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.post-content {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  margin-bottom: 12px;
  white-space: pre-wrap;
}

/* 帖子图片 */
.post-images {
  margin-top: 12px;
}

.image-item {
  padding: 4px;
}

.post-image {
  width: 100%;
  height: 90px;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.3s;
}

.post-image:active {
  transform: scale(0.95);
}

/* 帖子统计信息 */
.post-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 16px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 13px;
  transition: all 0.3s;
}

.stat-item:active {
  color: #ff2442;
}

.stats-icon {
  font-size: 18px;
  color: #999;
}

.stat-item:active .stats-icon {
  color: #ff2442;
}

.stats-text {
  font-weight: 500;
}

/* 发布按钮 - 浮动风格 */
.publish-btn-wrapper {
  position: fixed;
  right: 20px;
  bottom: 80px;
  z-index: 99;
}

.promo-pulse {
  position: absolute;
  inset: -8px;
  background: rgba(255, 36, 66, 0.3);
  border-radius: 50%;
  animation: promo-pulse 2s infinite;
}

@keyframes promo-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0; }
}

.publish-btn {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  border: none;
  box-shadow: 0 8px 24px rgba(255, 36, 66, 0.4);
  animation: promo-float 3s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes promo-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.publish-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: inherit;
  z-index: -1;
}

.publish-icon {
  font-size: 24px;
  color: white;
  font-weight: bold;
}

/* 适配移动端 */
@media (max-width: 375px) {
  .post-title {
    font-size: 16px;
  }
  
  .post-content {
    font-size: 13px;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
  }
  
  .post-image {
    height: 80px;
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .post-list-page {
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  }
  
  .glass-header {
    background: rgba(26, 26, 46, 0.9);
  }
  
  .site-title {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
    -webkit-background-clip: text;
  }
  
  .post-card {
    background: #242442;
  }
  
  .post-title {
    background: linear-gradient(135deg, #e0e0e0 0%, #ffffff 100%);
    -webkit-background-clip: text;
  }
  
  .post-content {
    color: #aaa;
  }
  
  .username {
    color: #e0e0e0;
  }
  
  .post-stats {
    background: #1a1a3e;
    border-top-color: #2a2a4a;
  }
  
  .stat-item {
    color: #aaa;
  }
  
  .user-id {
    background: #2a2a4a;
    color: #666;
  }
  
  .post-header {
    border-bottom-color: #2a2a4a;
  }
}
</style>