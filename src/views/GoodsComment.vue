<template>
  <div class="goods-comment">
    <header class="glass-header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <van-icon name="arrow-left" />
        </div>
        <h1 class="page-title">{{ productName || '商品评论' }}</h1>
        <div class="header-action">
          <van-icon name="more-o" />
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="comment-stats" v-if="!loading">
        <div class="stat-item total">
          <span class="stat-label">总评论: </span>
          <span class="stat-num">{{ commentCount }}</span>
        </div>
      </div>

      <div class="comment-post" v-if="userStore.id">
        <textarea 
          class="comment-input"
          v-model="commentContent"
          placeholder="来说说你的使用体验吧..."
          maxlength="500"
          @input="handleInput"
        ></textarea>

        <div class="comment-upload" style="margin: 10px 0;">
          <div class="upload-preview" style="display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
            <div 
              v-for="(img, index) in uploadImages" 
              :key="index"
              style="position: relative; width: 80px; height: 80px; border-radius: 4px; overflow: hidden;"
            >
              <img 
                :src="img" 
                style="width: 100%; height: 100%; object-fit: cover;" 
                alt="预览图"
                @error="handleImgError"
              >
              <span 
                style="position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; background: rgba(0,0,0,0.5); color: white; border-radius: 50%; text-align: center; line-height: 20px; cursor: pointer;"
                @click="deleteUploadImage(index)"
              >×</span>
            </div>

            <div 
              v-if="uploadImages.length < 9"
              style="width: 80px; height: 80px; border: 1px dashed #ddd; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999; cursor: pointer;"
            >
              <input 
                type="file" 
                accept="image/jpg,image/jpeg,image/png,image/gif" 
                multiple 
                style="display: none;"
                ref="fileInput"
                @change="handleFileUpload"
              >
              <van-icon name="plus" @click="$refs.fileInput.click()" />
            </div>
          </div>
          <span style="font-size: 12px; color: #999;">最多上传9张图片，支持jpg/png/gif格式，单张不超过5MB</span>
        </div>

        <div class="post-footer">
          <span class="word-count">{{ commentContent.length }}/500</span>
          <button 
            class="post-btn"
            :disabled="!commentContent.trim() || posting"
            @click="postComment"
          >
            {{ posting ? '发布中...' : '发表评论' }}
          </button>
        </div>
      </div>

      <div class="loading-state" v-if="loading && commentList.length === 0">
        <van-loading type="spinner" />
        <span>加载评论中...</span>
      </div>

      <div class="empty-state" v-else-if="commentList.length === 0 && !loading">
        <div class="empty-icon">💬</div>
        <h3>暂无评论</h3>
        <p>快来发表第一条评论吧</p>
      </div>

      <div class="comment-list" v-else>
        <div 
          class="comment-card" 
          v-for="comment in commentList" 
          :key="comment.id"
        >
          <div class="comment-header">
            <img 
              class="avatar"
              :src="comment.userAvatar || 'https://www.helloimg.com/i/2026/01/27/69783066c0b56.png'"
              @error="handleImgError"
              alt="用户头像"
            />
            <div class="user-info">
              <h4 class="username">{{ comment.userName || '匿名用户' }}</h4>
              <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
            </div>

            <div class="like-btn" @click="toggleCommentLike(comment.id)">
              <van-icon 
                :name="comment.isLiked ? 'like' : 'like-o'"
                :class="{ liked: comment.isLiked }"
              />
              <span v-if="comment.likeCount > 0">{{ comment.likeCount }}</span>
            </div>

            <div 
              class="report-btn" 
              v-if="userStore.id && userStore.id !== comment.userId"
              @click="openReportPopup(comment.id)"
            >
              <van-icon name="warning-o" color="#ff9500" />
            </div>

            <div 
              class="delete-btn" 
              v-if="userStore.id === comment.userId || userStore.role === 'ADMIN'"
              @click="deleteComment(comment.id)"
            >
              <van-icon name="delete-o" />
            </div>
          </div>

          <div class="comment-content">
            {{ comment.content }}
          </div>

          <!-- 🔥 这里彻底修复，直接用后端返回的数组 -->
          <div class="comment-images" v-if="comment.imageUrls && comment.imageUrls.length > 0">
            <img 
              v-for="(img, index) in comment.imageUrls" 
              :key="index"
              :src="img"
              @click="previewImage(img, comment.imageUrls)"
              @error="handleImgError"
              alt="评论图片"
            />
          </div>

          <div class="reply-section">
            <div class="reply-list" v-if="comment.replyList && Array.isArray(comment.replyList) && comment.replyList.length">
              <div 
                class="reply-item" 
                v-for="reply in comment.replyList" 
                :key="reply.id"
              >
                <span class="reply-username">{{ reply.userName }}：</span>
                <span class="reply-content">{{ reply.content }}</span>
                <span 
                  class="reply-report-btn"
                  v-if="userStore.id && userStore.id !== reply.userId"
                  @click="openReportPopup(reply.id, 2)"
                >
                  <van-icon name="warning-o" size="12" color="#ff9500" />
                </span>
              </div>
            </div>

            <div class="reply-input-wrap" v-if="userStore.id">
              <input 
                type="text"
                class="reply-input"
                v-model="replyContentMap[comment.id]"
                placeholder="回复这条评论..."
                maxlength="200"
                @keyup.enter="replyComment(comment.id)"
              />
              <button 
                class="reply-btn"
                :disabled="!replyContentMap[comment.id]?.trim()"
                @click="replyComment(comment.id)"
              >
                回复
              </button>
            </div>
          </div>
        </div>

        <div class="load-more" v-if="!finished && !loading">
          <van-button 
            size="small" 
            type="default" 
            :loading="loadingMore"
            @click="loadMoreComments"
          >
            {{ loadingMore ? '加载中...' : '加载更多' }}
          </van-button>
        </div>
        
        <div class="no-more" v-else-if="commentList.length > 0">
          没有更多评论了
        </div>
      </div>
    </div>

    <van-image-preview 
      v-model:show="showPreview" 
      :images="previewImages" 
      :start-position="previewIndex"
    />

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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { showConfirmDialog, showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { 
  getProductCommentCount,
  getCommentList, 
  toggleCommentLike as CommentLike, 
  deleteComment as deleteCommentApi,
  submitComment,
  uploadCommentImage
} from '@/api/mobile/product'
import ReportPopup from '@/components/ReportPopup.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const productId = ref(route.query.productId || '')
const productName = ref(route.query.productName || '')

const loading = ref(false)
const loadingMore = ref(false)
const finished = ref(false)
const posting = ref(false)

const pageNum = ref(1)
const pageSize = ref(10)

const commentCount = ref(0)
const commentList = ref([])

const commentContent = ref('')
const uploadImages = ref([])
const fileInput = ref(null)
const replyContentMap = ref({})

const showPreview = ref(false)
const previewImages = ref([])
const previewIndex = ref(0)

const showReportPopup = ref(false)
const reportTargetId = ref(null)
const reportTargetType = ref(2)

const handleImgError = (e) => {
  e.target.src = 'https://www.helloimg.com/i/2026/01/27/69783066c0b56.png'
}

const loadCommentList = async (isLoadMore = false) => {
  if (!productId.value) return
  if (isLoadMore) loadingMore.value = true
  else loading.value = true

  try {
    const res = await getCommentList({
      productId: productId.value,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      token: userStore.token || ''
    })
    if (res.code === 0) {
      const records = res.data?.records || []
      if (isLoadMore) {
        commentList.value.push(...records)
      } else {
        commentList.value = records
      }
      finished.value = res.data?.current >= res.data?.pages
    } else {
      ElMessage.error(res.msg || '获取评论失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('网络异常')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMoreComments = () => {
  if (finished.value) return
  pageNum.value++
  loadCommentList(true)
}

const loadCommentCount = async () => {
  if (!productId.value) return
  try {
    const res = await getProductCommentCount(productId.value)
    if (res.code === 0) commentCount.value = res.data || 0
  } catch (err) {
    console.error(err)
  }
}

const handleFileUpload = async (e) => {
  const files = e.target.files
  if (!files) return
  const remain = 9 - uploadImages.value.length
  const list = Array.from(files).slice(0, remain)

  for (const file of list) {
    if (file.size > 5 * 1024 * 1024) {
      showToast('单图不能超过5MB')
      continue
    }
    try {
      const res = await uploadCommentImage(file)
      if (res.code === 0 && res.data) {
        uploadImages.value.push(res.data)
      } else {
        showToast('上传失败')
      }
    } catch (err) {
      showToast('上传异常')
    }
  }
  e.target.value = ''
}

const deleteUploadImage = (index) => {
  uploadImages.value.splice(index, 1)
}

const postComment = async () => {
  if (!commentContent.value.trim()) return
  if (!userStore.token) {
    showToast('请先登录')
    return router.push('/login')
  }

  posting.value = true
  try {
    const imgStr = uploadImages.value.filter(Boolean).join(',')
    const res = await submitComment({
      productId: productId.value,
      content: commentContent.value.trim(),
      parentId: 0,
      imageUrls: imgStr
    }, userStore.token)

    if (res.code === 0) {
      ElMessage.success('发表成功')
      commentContent.value = ''
      uploadImages.value = []
      pageNum.value = 1
      loadCommentList()
      loadCommentCount()
    } else {
      ElMessage.error(res.msg || '发表失败')
    }
  } catch (err) {
    ElMessage.error('网络异常')
  } finally {
    posting.value = false
  }
}

const toggleCommentLike = async (commentId) => {
  if (!userStore.token) return showToast('请登录')
  try {
    const res = await CommentLike(commentId, userStore.token)
    if (res.code === 0) {
      const item = commentList.value.find(c => c.id === commentId)
      if (item) {
        item.isLiked = !item.isLiked
        item.likeCount = item.isLiked ? (item.likeCount || 0) + 1 : (item.likeCount || 0) - 1
      }
    }
  } catch (err) {
    showToast('操作失败')
  }
}

const deleteComment = async (commentId) => {
  try {
    await showConfirmDialog({ title: '删除', message: '确定删除这条评论？' })
    const res = await deleteCommentApi(commentId, userStore.token)
    if (res.code === 0) {
      commentList.value = commentList.value.filter(c => c.id !== commentId)
      loadCommentCount()
      ElMessage.success('删除成功')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

const replyComment = async (parentId) => {
  const content = replyContentMap.value[parentId]
  if (!content?.trim()) return
  try {
    const res = await submitComment({
      productId: productId.value,
      content: content.trim(),
      parentId: parentId,
      imageUrls: ''
    }, userStore.token)
    if (res.code === 0) {
      ElMessage.success('回复成功')
      replyContentMap.value[parentId] = ''
      loadCommentList()
    }
  } catch (err) {
    ElMessage.error('回复失败')
  }
}

const previewImage = (img, list) => {
  previewImages.value = list
  previewIndex.value = list.indexOf(img)
  showPreview.value = true
}

const formatTime = (s) => s ? s.substring(0, 16) : ''

const handleInput = () => {
  if (commentContent.value.length > 500) {
    commentContent.value = commentContent.value.slice(0, 500)
  }
}

const goBack = () => router.back()

const openReportPopup = (targetId, type = 2) => {
  if (!userStore.id) return showToast('请先登录')
  reportTargetId.value = targetId
  reportTargetType.value = type
  showReportPopup.value = true
}

const onReportSuccess = () => {
  ElMessage.success('举报提交成功')
  showReportPopup.value = false
}

onMounted(() => {
  if (productId.value) {
    loadCommentCount()
    loadCommentList()
  } else {
    ElMessage.error('商品ID不存在')
    goBack()
  }
})
</script>

<style scoped>
.goods-comment {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 20px;
}
.glass-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0,0,0,0.05);
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
.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
.main-content {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}
.comment-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #ff2442;
}
.stat-label {
  font-size: 12px;
  color: #999;
}
.comment-post {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.comment-input {
  width: 100%;
  min-height: 80px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  box-sizing: border-box;
  resize: none;
}
.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}
.word-count {
  font-size: 12px;
  color: #999;
}
.post-btn {
  padding: 8px 20px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}
.post-btn:disabled {
  background: #ccc;
}
.loading-state {
  text-align: center;
  padding: 60px;
  color: #999;
}
.empty-state {
  text-align: center;
  padding: 80px 20px;
}
.empty-icon {
  font-size: 60px;
  margin-bottom: 16px;
}
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.comment-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
}
.user-info { flex:1; }
.username { font-size:14px; font-weight:600; color:#333; margin:0 0 4px 0; }
.comment-time { font-size:12px; color:#999; }
.like-btn { display:flex; align-items:center; gap:4px; color:#999; margin-right:12px; cursor:pointer; }
.like-btn .van-icon.liked { color:#ff2442; }
.report-btn { color:#ff9500; margin-right:12px; cursor:pointer; }
.delete-btn { color:#999; cursor:pointer; }
.comment-content { font-size:14px; color:#333; line-height:1.6; margin-bottom:12px; }
.comment-images { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px; }
.comment-images img { width:80px; height:80px; border-radius:8px; object-fit:cover; cursor:pointer; }
.reply-section { margin-top:12px; padding-top:12px; border-top:1px solid #f5f5f5; }
.reply-item { font-size:13px; margin-bottom:8px; display:flex; align-items:center; }
.reply-username { color:#409eff; font-weight:600; }
.reply-content { color:#666; flex:1; }
.reply-input-wrap { display:flex; gap:8px; }
.reply-input { flex:1; height:36px; border:1px solid #eee; border-radius:18px; padding:0 12px; font-size:13px; }
.reply-btn { padding:0 16px; background:#409eff; color:white; border:none; border-radius:18px; font-size:13px; }
.reply-btn:disabled { background:#ccc; }
.load-more { text-align:center; padding:20px; }
.no-more { text-align:center; padding:20px; color:#999; font-size:13px; }
</style>  