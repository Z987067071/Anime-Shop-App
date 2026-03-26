<template>
  <div class="post-detail-page">
    <header class="glass-header" :class="{ 'scrolled': isScrolled }">
      <div class="header-content">
        <div class="back-btn" @click="router.back()">
          <van-icon name="arrow-left" />
        </div>
        <h1 class="site-title">帖子详情</h1>
        <div class="report-btn" @click="openReportPopup(3, post.id)">
          <van-icon name="warning-o" size="20" color="#999" />
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content" @scroll="handleScroll">
      <div class="detail-container">
        <!-- 帖子卡片 -->
        <div class="post-card">
          <!-- 帖子头部 -->
          <div class="post-header">
            <img 
              :src="post.userAvatar || ''" 
              alt="用户头像"
              class="avatar"
              @error="handleAvatarError"
            />
            <div class="user-info">
              <div class="username">{{ post.userName || '匿名用户' }}</div>
              <div class="create-time">{{ formatTime(post.createTime) }}</div>
            </div>
          </div>

          <!-- 帖子内容 -->
          <div class="post-body">
            <h1 class="post-title">{{ post.title }}</h1>
            <div class="post-content">{{ post.content }}</div>
            
            <van-grid 
              v-if="post.imageUrlsList && post.imageUrlsList.length" 
              :column-num="3" 
              :border="false"
              class="post-images"
            >
              <van-grid-item
                v-for="(url, index) in post.imageUrlsList"
                :key="index"
                @click="previewImage(url, post.imageUrlsList)"
                class="image-item"
              >
                <img :src="url" class="post-image" />
              </van-grid-item>
            </van-grid>
          </div>

          <!-- 帖子操作栏 -->
          <div class="post-actions">
            <div 
              class="action-item" 
              :class="{ 'active': post.isLiked }"
              @click="toggleLike"
            >
              <div class="action-icon">
                <van-icon name="good-job-o" :class="{ 'liked': post.isLiked }" />
              </div>
              <span class="action-count">{{ Number(post.likeCount) }}</span>
              <span class="action-label">赞</span>
            </div>
            
            <div class="action-item" @click="focusComment">
              <div class="action-icon">
                <van-icon name="comment" />
              </div>
              <span class="action-count">{{ Number(post.commentCount) }}</span>
              <span class="action-label">评论</span>
            </div>
            
            <div class="action-item">
              <div class="action-icon">
                <van-icon name="eye" />
              </div>
              <span class="action-count">{{ Number(post.viewCount) }}</span>
              <span class="action-label">浏览</span>
            </div>
          </div>
        </div>

        <!-- 评论区卡片 -->
        <div class="comment-card" ref="commentRef">
          <div class="comment-header">
            <div class="header-title">
              <span class="title-icon">💬</span>
              <span>评论区</span>
              <span class="comment-count">{{ Number(post.commentCount) }}</span>
            </div>
          </div>
          
          <!-- 发布评论输入框 -->
          <div class="comment-input-section">
            <div class="input-wrapper">
              <van-field
                v-model="commentContent"
                placeholder="说点什么..."
                rows="2"
                type="textarea"
                class="comment-input"
                maxlength="500"
                show-word-limit
              />
              
              <van-uploader
                v-model="uploaderFiles"
                multiple
                :max-count="3"
                accept="image/*"
                :before-read="beforeUpload"
                :after-read="afterUpload"
                :before-delete="beforeDeleteFile"
                upload-icon="photo"
                class="comment-uploader"
                :upload-text="''"
              />
              
              <div class="send-btn-wrapper">
                <van-button 
                  type="primary" 
                  size="small"
                  class="send-btn"
                  @click="publishComment"
                  :disabled="!commentContent.trim() && uploaderFiles.every(file => !file.url)"
                >
                  发布
                </van-button>
              </div>
            </div>
          </div>

          <!-- 评论列表 -->
          <van-list
            v-model:loading="commentLoading"
            :finished="commentFinished"
            finished-text="没有更多评论了"
            @load="loadMoreComments"
            class="comment-list"
          >
            <div v-if="commentList.length === 0 && !commentLoading" class="empty-comments">
              暂无评论，快来抢沙发吧~
            </div>
            
            <div 
              v-for="item in commentList" 
              :key="item.id"
              class="comment-item"
            >
              <img 
                :src="item.userAvatar || ''" 
                alt="评论用户头像"
                class="comment-avatar"
                @error="handleAvatarError"
              />
              <div class="comment-main">
                <div class="comment-user">{{ item.userName || '匿名用户' }}</div>
                <div class="comment-content">{{ item.content }}</div>
                
                <van-grid 
                  v-if="item.imageUrls && item.imageUrls.length" 
                  :column-num="3" 
                  :border="false"
                  class="comment-images"
                >
                  <van-grid-item
                    v-for="(url, index) in item.imageUrls.slice(0,3)"
                    :key="index"
                    @click="previewImage(url, item.imageUrls)"
                    class="image-item"
                  >
                    <img :src="url" class="comment-image" />
                  </van-grid-item>
                </van-grid>
                
                <!-- 评论操作 -->
                <div class="comment-actions">
                  <span class="comment-time">{{ formatTime(item.createTime) }}</span>
                  <div class="action-btns">
                    <span 
                      class="action-btn" 
                      :class="{ 'liked': item.isLiked }"
                      @click="likeComment(item)"
                    >
                      <van-icon name="good-job-o" />
                      {{ Number(item.likeCount || 0) }}
                    </span>
                    <span class="action-btn" @click="replyComment(item)">
                      <van-icon name="reply" size="14" /> 回复
                    </span>
                    <!-- 评论举报按钮 -->
                    <span 
                      class="action-btn report-comment-btn"
                      @click="openReportPopup(4, item.id)"
                    >
                      <van-icon name="warning-o" size="14" /> 举报
                    </span>
                    <span 
                      v-if="item.userId === userStore.id" 
                      class="action-btn delete-btn"
                      @click="deleteComment(item.id)"
                    >
                      <van-icon name="delete" size="14" /> 删除
                    </span>
                  </div>
                </div>

                <div class="reply-list" v-if="item.replyList && item.replyList.length">
                  <div 
                    v-for="reply in item.replyList" 
                    :key="reply.id"
                    class="reply-item"
                  >
                    <span class="reply-user">{{ reply.userName }}：</span>
                    <span class="reply-content">{{ reply.content }}</span>
                    <!-- 回复举报按钮 -->
                    <span 
                      class="reply-report-btn"
                      @click="openReportPopup(4, reply.id)"
                    >
                      <van-icon name="warning-o" size="12" /> 举报
                    </span>
                  </div>
                </div>
                <div v-if="replyCommentId === item.id" class="reply-input-wrapper">
                  <van-field
                    v-model="replyContentMap[item.id]"
                    placeholder="回复TA..."
                    size="small"
                    class="reply-input"
                    @keyup.enter="publishReply(item.id)"
                    maxlength="200"
                  />
                  <van-button 
                    type="primary" 
                    size="mini"
                    @click="publishReply(item.id)"
                    :disabled="!replyContentMap[item.id]?.trim()"
                  >
                    发送
                  </van-button>
                </div>
              </div>
            </div>
          </van-list>
        </div>
      </div>
    </main>

    <ReportPopup 
      :show="showReportPopup"
      :target-type="reportTargetType"
      :target-id="reportTargetId"
      @close="showReportPopup = false"
      @success="onReportSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showImagePreview } from 'vant'
import { useUserStore } from '@/stores/user'
import communityPostApi from '@/api/mobile/communityPost'
import ReportPopup from '@/components/ReportPopup.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const postId = route.params.id
const isScrolled = ref(false)

const uploadLock = ref(false)

const post = reactive({
  id: '',
  userId: '',
  title: '',
  content: '',
  imageUrlsList: [],
  likeCount: 0,
  commentCount: 0,
  viewCount: 0,
  createTime: '',
  updateTime: '',
  isLiked: false,
  userName: '',
  userAvatar: '',
  status: 0
})

const commentList = ref([])
const commentLoading = ref(false)
const commentFinished = ref(false)
const commentPageNum = ref(1)
const commentPageSize = ref(20)
const commentContent = ref('')
const replyCommentId = ref('')
const replyContentMap = ref({}) 
const commentRef = ref(null)
const likeLoading = ref(false)

const uploaderFiles = ref([])
const commentImageUrls = ref([])

const showReportPopup = ref(false)
const reportTargetType = ref(0)
const reportTargetId = ref(0)

const handleAvatarError = (e) => {
  e.target.src = ''
}

const handleScroll = (e) => {
  isScrolled.value = e.target.scrollTop > 50
}

const openReportPopup = (type, id) => {
  if (!id) {
    showToast('举报目标不存在')
    return
  }
  reportTargetType.value = type
  reportTargetId.value = id
  showReportPopup.value = true
}

const onReportSuccess = () => {
  showToast('举报提交成功')
  showReportPopup.value = false
}

const loadPostDetail = async () => {
  try {
    const res = await communityPostApi.getPostDetail(postId)
    if (res.code === 0) {
      Object.assign(post, res.data)
      // 同步后端最新评论数
      // const countRes = await communityPostApi.getCommentCount(postId)
      // if (countRes.code === 0) {
      //   post.commentCount = countRes.data || 0
      // }
    }
  } catch (e) {
    console.error('加载帖子详情失败：', e)
    showToast('加载失败')
    router.back()
  }
}

// 加载回复列表 - 新增方法
const loadCommentReplies = async (commentId) => {
  try {
    const res = await communityPostApi.getCommunityCommentList({
      postId,
      parentId: commentId,
      pageNum: 1,
      pageSize: 50 
    })
    const replies = res.data?.records || []
    replies.forEach(reply => {
      reply.isLiked = reply.isLiked || false
      reply.likeCount = Number(reply.likeCount || 0)
    })
    return replies
  } catch (e) {
    console.error(`加载评论${commentId}的回复失败：`, e)
    return []
  }
}

const loadMoreComments = async () => {
  if (commentFinished.value) return
  
  commentLoading.value = true
  
  try {
    const res = await communityPostApi.getCommunityCommentList({
      postId,
      pageNum: commentPageNum.value,
      pageSize: commentPageSize.value,
      parentId: 0
    })
    
    if (res.code === 0) {
      const list = res.data.records || []
      
      for (const item of list) {
        item.isLiked = item.isLiked || false
        item.replyList = item.replyList || []
        item.replyList.forEach(reply => {
          reply.isLiked = reply.isLiked || false
        })
      }
      
      if (commentPageNum.value === 1) {
        commentList.value = list
      } else {
        commentList.value.push(...list)
      }
      
      if (list.length < commentPageSize.value) {
        commentFinished.value = true
      } else {
        commentPageNum.value++
      }
    }
  } catch (e) {
    console.error('加载评论失败：', e)
    showToast('评论加载失败')
  } finally {
    commentLoading.value = false
  }
}

const refreshComments = async () => {
  commentPageNum.value = 1
  commentFinished.value = false
  commentList.value = []
  await loadPostDetail()
  await loadMoreComments()
  // 刷新后同步最新评论数
  // const countRes = await communityPostApi.getCommentCount(postId)
  // if (countRes.code === 0) {
  //   post.commentCount = countRes.data || 0
  // }
}

// 帖子点赞
const toggleLike = async () => {
  if (likeLoading.value) return
  if (!userStore.token) {
    showToast('请先登录')
    router.push('/login')
    return
  }

  try {
    likeLoading.value = true
    const res = await communityPostApi.likePost(postId)
    if (res.code === 0 && res.data) {
      post.isLiked = res.data.isLiked
      post.likeCount = res.data.likeCount
      // 强制刷新视图
      commentList.value = [...commentList.value]
      showToast(post.isLiked ? '点赞成功' : '取消点赞')
    } else {
      showToast(res.msg || '操作失败')
    }
  } catch (e) {
    console.error('点赞失败：', e)
    showToast('点赞失败，请稍后重试')
  } finally {
    likeLoading.value = false
  }
}

// 上传前校验
const beforeUpload = (file) => {
  if (uploadLock.value) {
    showToast('请等待上一张图片上传完成')
    return false
  }
  
  if (!userStore.token) {
    showToast('请先登录')
    router.push('/login')
    return false
  }
  
  const isImage = file.type.indexOf('image/') === 0
  if (!isImage) {
    showToast('请选择图片文件')
    return false
  }
  
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    showToast('图片大小不能超过5MB')
    return false
  }
  
  uploadLock.value = true
  return true
}

// 上传图片
const afterUpload = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file.file)
    
    const res = await communityPostApi.uploadCommunityCommentImage(formData)
    if (res.code === 0) {
      file.status = 'success'
      file.url = res.data
      if (!commentImageUrls.value.includes(res.data)) {
        commentImageUrls.value.push(res.data)
      }
    } else {
      file.status = 'failed'
      showToast(`图片上传失败：${res.msg}`)
    }
  } catch (e) {
    file.status = 'failed'
    console.error('图片上传失败：', e)
    showToast('图片上传失败，请重试')
  } finally {
    uploadLock.value = false
  }
}

// 删除文件
const beforeDeleteFile = (file) => {
  if (file.url) {
    const index = commentImageUrls.value.indexOf(file.url)
    if (index > -1) {
      commentImageUrls.value.splice(index, 1)
    }
  }
  return true
}

// 发布评论
const publishComment = async () => {
  if (!userStore.token) {
    showToast('请先登录')
    router.push('/login')
    return
  }
  
  const hasContent = commentContent.value.trim()
  const hasImage = commentImageUrls.value.length > 0
  if (!hasContent && !hasImage) {
    showToast('请输入评论内容或上传图片')
    return
  }
  
  try {
    const res = await communityPostApi.publishCommunityComment({
      postId,
      parentId: 0,
      content: commentContent.value,
      imageUrls: commentImageUrls.value.join(',') 
    })
    
    if (res.code === 0) {
      showToast('发布成功')
      commentContent.value = ''
      uploaderFiles.value = []
      commentImageUrls.value = []
      
      await refreshComments()
    } else {
      showToast(res.msg || '发布失败')
    }
  } catch (e) {
    console.error('发布评论失败：', e)
    showToast('发布失败')
  }
}

// 评论点赞
const likeComment = async (commentItem) => {
  if (!userStore.token) {
    showToast('请先登录')
    router.push('/login')
    return
  }
  
  if (likeLoading.value) return
  likeLoading.value = true
  
  try {
    const res = await communityPostApi.toggleCommunityCommentLike(commentItem.id)
    if (res.code === 0 && res.data) {
      commentItem.isLiked = res.data.isLiked
      commentItem.likeCount = res.data.likeCount
      commentList.value = [...commentList.value]
      showToast(commentItem.isLiked ? '点赞成功' : '取消点赞')
    } else {
      showToast(res.msg || '操作失败')
    }
  } catch (e) {
    console.error('评论点赞失败：', e)
    showToast('操作失败')
  } finally {
    likeLoading.value = false
  }
}

// 删除评论
const deleteComment = async (commentId) => {  
  try {
    const confirmDelete = window.confirm('确定删除这条评论吗？')
    if (!confirmDelete) return
    
    const res = await communityPostApi.deleteCommunityComment(commentId)
    if (res.code === 0) {
      showToast('删除成功')
      commentList.value = commentList.value.filter(item => item.id !== commentId)
      await refreshComments()
    } else {
      showToast(res.msg || '删除失败')
    }
  } catch (e) {
    console.error('删除评论失败：', e)
    showToast('删除失败')
  }
}

// 回复评论
const replyComment = (item) => {
  replyCommentId.value = item.id
  if (!replyContentMap.value[item.id]) {
    replyContentMap.value[item.id] = ''
  }
  setTimeout(() => {
    const input = document.querySelector(`.reply-input-wrapper[data-comment-id="${item.id}"] .reply-input`)
    input?.focus()
  }, 100)
}

// 发布回复
const publishReply = async (parentId) => {
  if (!userStore.token) {
    showToast('请先登录')
    router.push('/login')
    return
  }
  
  const replyContent = replyContentMap.value[parentId]
  if (!replyContent?.trim()) {
    showToast('请输入回复内容')
    return
  }
  
  try {
    const res = await communityPostApi.publishCommunityComment({
      postId,
      parentId,
      content: replyContent,
      imageUrls: ''
    })
    
    if (res.code === 0) {
      showToast('回复成功')
      replyContentMap.value[parentId] = ''
      replyCommentId.value = ''
      await refreshComments()
    } else {
      showToast(res.msg || '回复失败')
    }
  } catch (e) {
    console.error('发布回复失败：', e)
    showToast('回复失败')
  }
}

// 预览图片
const previewImage = (url, urls) => {
  showImagePreview({
    images: urls,
    startPosition: urls.indexOf(url)
  })
}

// 聚焦评论区
const focusComment = () => {
  commentRef.value?.scrollIntoView({ behavior: 'smooth' })
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  return time.replace('T', ' ').slice(0, 16)
}

onMounted(() => {
  loadPostDetail()
  loadMoreComments()
})
</script>

<style scoped>
.post-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff5f7 0%, #ffffff 100%);
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

/* 新增举报按钮样式 */
.report-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
}

.report-btn:hover {
  background: #f5f5f5;
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

.main-content {
  padding-top: 70px;
  overflow-y: auto;
  height: 100vh;
  -webkit-overflow-scrolling: touch;
}

.detail-container {
  padding: 12px 16px;
  padding-bottom: 40px;
}

.post-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  object-fit: cover;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  object-fit: cover;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.create-time {
  font-size: 12px;
  color: #999;
}

.post-body {
  margin-bottom: 16px;
}

.post-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
  line-height: 1.4;
  background: linear-gradient(135deg, #333 0%, #666 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.post-content {
  font-size: 15px;
  line-height: 1.7;
  color: #555;
  margin-bottom: 16px;
  white-space: pre-wrap;
}

.post-images {
  margin-top: 12px;
}

.image-item {
  padding: 4px;
}

.post-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.3s;
}

.post-image:active {
  transform: scale(0.95);
}

.post-actions {
  display: flex;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid #f5f5f5;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.3s;
  padding: 8px 16px;
  border-radius: 12px;
}

.action-item:active {
  background: #f5f5f5;
  transform: scale(0.95);
}

.action-item.active {
  color: #ff2442;
}

.action-icon {
  font-size: 24px;
  color: #999;
  transition: all 0.3s;
}

.action-icon .liked {
  color: #ff2442;
}

.action-item.active .action-icon {
  color: #ff2442;
}

.action-count {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.action-label {
  font-size: 12px;
  color: #999;
}

.comment-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}

.comment-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.title-icon {
  font-size: 20px;
}

.comment-count {
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 600;
}

.comment-input-section {
  margin-bottom: 20px;
}

.input-wrapper {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 12px;
}

.comment-input {
  background: transparent;
  padding: 0;
  font-size: 15px;
}

.comment-input :deep(.van-field__control) {
  color: #333;
}

.comment-input :deep(.van-field__control::placeholder) {
  color: #bbb;
}

.comment-uploader {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.comment-uploader :deep(.van-uploader__upload) {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: #f5f5f5;
  flex-shrink: 0;
}

.comment-uploader :deep(.van-uploader__preview-list) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 !important;
}

.comment-uploader :deep(.van-uploader__preview) {
  width: 60px;
  height: 60px;
  margin: 0 !important;
  flex-shrink: 0;
}

.comment-uploader :deep(.van-uploader__preview-image) {
  border-radius: 8px;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.send-btn-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.send-btn {
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  border: none;
  border-radius: 20px;
  padding: 0 20px;
  height: 36px;
  font-weight: 600;
}

.send-btn:disabled {
  opacity: 0.5;
}

.comment-list {
  margin-top: 8px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-main {
  flex: 1;
}

.comment-user {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  margin-bottom: 10px;
}

.comment-images {
  margin-bottom: 10px;
}

.comment-image {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

.comment-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  flex-wrap: wrap;
}

.comment-time {
  font-size: 12px;
  color: #999;
  width: 100%;
  margin-bottom: 6px;
}

.action-btns {
  display: flex;
  gap: 16px;
  width: 100%;
  justify-content: flex-start;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #999;
  cursor: pointer;
  transition: all 0.3s;
  padding: 4px 8px;
  border-radius: 12px;
}

/* 举报按钮样式 */
.report-comment-btn {
  color: #ff6666;
}

.action-btn:active {
  background: #f5f5f5;
}

.action-btn.liked {
  color: #ff2442;
}

.delete-btn {
  color: #ff4757;
}

.reply-list {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
}

.reply-item {
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 6px;
  color: #555;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-user {
  color: #ff2442;
  font-weight: 600;
}

.reply-content {
  flex: 1;
  margin-left: 4px;
}

/* 回复举报按钮样式 */
.reply-report-btn {
  color: #ff6666;
  cursor: pointer;
  margin-left: 8px;
}

.reply-input-wrapper {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  align-items: center;
  position: relative; 
}

.reply-input {
  flex: 1;
  background: #f8f9fa;
  border-radius: 20px;
  padding: 8px 16px;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .post-detail-page {
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
  
  .post-card,
  .comment-card {
    background: #242442;
  }
  
  .post-title {
    background: linear-gradient(135deg, #e0e0e0 0%, #ffffff 100%);
    -webkit-background-clip: text;
  }
  
  .post-content {
    color: #aaa;
  }
  
  .username,
  .comment-user {
    color: #e0e0e0;
  }
  
  .action-count {
    color: #e0e0e0;
  }
  
  .input-wrapper,
  .reply-list,
  .reply-input {
    background: #1a1a3e;
  }
  
  .comment-input :deep(.van-field__control) {
    color: #e0e0e0;
  }
  
  .header-title {
    color: #e0e0e0;
  }
  
  .reply-item,
  .reply-content {
    color: #aaa;
  }
}

/* 移动端适配 */
@media (max-width: 375px) {
  .detail-container {
    padding: 8px 12px;
  }
  
  .post-title {
    font-size: 17px;
  }
  
  .post-content {
    font-size: 14px;
  }
  
  .comment-uploader :deep(.van-uploader__upload),
  .comment-uploader :deep(.van-uploader__preview) {
    width: 50px;
    height: 50px;
  }
  
  .comment-image {
    height: 70px;
  }
}
</style>