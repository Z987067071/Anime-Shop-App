<template>
  <div class="page">
    <!-- 头部导航 - 玻璃拟态 -->
    <header class="glass-header">
      <div class="header-content">
        <h1 class="page-title">个人中心</h1>
        <div class="header-actions">
          <div class="action-btn" @click="goMineSubPage('MineSetting')">
            <van-icon name="setting-o" />
          </div>
          <div class="action-btn" @click="showAbout = true">
            <van-icon name="info-o" />
          </div>
        </div>
      </div>
    </header>

    <!-- 用户信息卡片 - Hpoi风格 -->
    <div class="user-section">
      <div class="user-card">
        <div class="card-bg">
          <div class="bg-pattern"></div>
          <div class="bg-gradient"></div>
        </div>
        
        <div class="user-content">
          <div class="avatar-section" @click="openAvatarDialog">
            <div class="avatar-ring">
              <div class="avatar-glow"></div>
              <img
                class="avatar"
                :src="user.avatar || 'https://www.helloimg.com/i/2026/01/27/69783066c0b56.png  '"
                @error="handleAvatarError($event)"
              />
              <div class="avatar-badge">
                <van-icon name="photograph" />
              </div>
            </div>
            <div class="level-tag" v-if="user.level">LV.{{ user.level || 1 }}</div>
          </div>
          
          <div class="info-section">
            <div class="name-row">
              <!-- 点击用户名弹出修改框 -->
              <span class="name name-editable" @click="openNicknameDialog">
                {{ user.username || '未登录' }}
                <van-icon name="edit" class="edit-icon" />
              </span>
              <div class="gender-tag" v-if="user.gender">
                <van-icon :name="user.gender === 'male' ? 'male' : 'female'" />
              </div>
            </div>
            <div class="uid-row">
              <span class="uid">UID: {{ user.id || '00000000000' }}</span>
              <div class="copy-btn" @click.stop="copyUid">
                <van-icon name="description" />
              </div>
            </div>
            <div class="bio" v-if="user.bio">{{ user.bio || '这个人很懒，什么都没有写~' }}</div>
            <div class="stats-row">
              <div class="stat-item">
                <span class="stat-num">{{ user.following || 0 }}</span>
                <span class="stat-label">关注</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">{{ user.followers || 0 }}</span>
                <span class="stat-label">粉丝</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">{{ user.likes || 0 }}</span>
                <span class="stat-label">获赞</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 资产卡片 - B站会员购风格 -->
      <div class="assets-card">
        <div class="assets-header">
          <span class="assets-title">我的资产</span>
          <div class="recharge-btn" @click="goRecharge">
            <van-icon name="gold-coin" />
            <span>充值</span>
          </div>
        </div>
        <div class="assets-grid">
          <div class="asset-item" @click="goMineSubPage('MineWallet')">
            <div class="asset-icon" style="background: linear-gradient(135deg, #ff6b6b, #ff8e8e);">
              <van-icon name="balance-pay" />
            </div>
            <div class="asset-info">
              <span class="asset-num">66.6</span>
              <!-- <span class="asset-label">余额</span> -->
            </div>
          </div>
          <div class="asset-item" @click="goMineSubPage('MinePoints')">
            <div class="asset-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe);">
              <van-icon name="points" />
            </div>
            <div class="asset-info">
              <span class="asset-num">128</span>
              <!-- <span class="asset-label">积分</span> -->
            </div>
          </div>
          <div class="asset-item" @click="goMineSubPage('MineCoupons')">
            <div class="asset-icon" style="background: linear-gradient(135deg, #fa709a, #fee140);">
              <van-icon name="coupon" />
            </div>
            <div class="asset-info">
              <span class="asset-num">3</span>
              <!-- <span class="asset-label">优惠券</span> -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能菜单 - B站风格 -->
    <div class="menu-section">
      <div class="menu-group">
        <div class="group-title">我的订单</div>
        <div class="order-grid">
          <!-- 全部订单：不传 status -->
          <div class="order-item" @click="goMineSubPage('MineOrders')">
            <div class="order-icon">
              <van-icon name="orders-o" />
              <div class="badge" v-if="orderCount.all > 0">{{ orderCount.all }}</div>
            </div>
            <span>全部订单</span>
          </div>
          <!-- 待付款：status = 0 -->
          <div class="order-item" @click="goMineSubPage('MineOrders', { status: 0 })">
            <div class="order-icon">
              <van-icon name="pending-payment" />
              <div class="badge" v-if="orderCount.pending > 0">{{ orderCount.pending }}</div>
            </div>
            <span>待付款</span>
          </div>
          <!-- 待发货：status = 1 -->
          <div class="order-item" @click="goMineSubPage('MineOrders', { status: 1 })">
            <div class="order-icon">
              <van-icon name="send-gift-o" />
              <div class="badge" v-if="orderCount.unshipped > 0">{{ orderCount.unshipped }}</div>
            </div>
            <span>待发货</span>
          </div>
          <!-- 待收货：status = 2 -->
          <div class="order-item" @click="goMineSubPage('MineOrders', { status: 2 })">
            <div class="order-icon">
              <van-icon name="logistics" />
              <div class="badge" v-if="orderCount.shipping > 0">{{ orderCount.shipping }}</div>
            </div>
            <span>待收货</span>
          </div>
          <!-- 售后：status = 5（原待评价改为售后） -->
          <div class="order-item" @click="goMineSubPage('MineOrders', { status: 5 })">
            <div class="order-icon">
              <van-icon name="service-o" />
              <div class="badge" v-if="orderCount.afterSale > 0">{{ orderCount.afterSale }}</div>
            </div>
            <span>售后</span>
          </div>
        </div>
      </div>

      <div class="menu-list">
        <div class="menu-item" @click="goMineSubPage('AddressList')">
          <div class="item-icon" style="background: #e3f2fd; color: #2196f3;">
            <van-icon name="location-o" />
          </div>
          <div class="item-content">
            <span class="item-title">收货地址</span>
            <span class="item-desc">管理收货地址</span>
          </div>
          <van-icon name="arrow" class="item-arrow" />
        </div>
        
        <div class="menu-item" @click="goMineSubPage('ProductCollect')">
          <div class="item-icon" style="background: #fce4ec; color: #e91e63;">
            <van-icon name="star-o" />
          </div>
          <div class="item-content">
            <span class="item-title">我的收藏</span>
            <span class="item-desc">收藏的手办和周边</span>
          </div>
          <van-icon name="arrow" class="item-arrow" />
        </div>
        
        <div class="menu-item" @click="goMineSubPage('MineHistory')">
          <div class="item-icon" style="background: #f3e5f5; color: #9c27b0;">
            <van-icon name="clock-o" />
          </div>
          <div class="item-content">
            <span class="item-title">浏览历史</span>
            <span class="item-desc">最近浏览的商品</span>
          </div>
          <van-icon name="arrow" class="item-arrow" />
        </div>
        
        <div class="menu-item" @click="goMineSubPage('MyComicConOrder')">
          <div class="item-icon" style="background: #e8f5e9; color: #4caf50;">
            <van-icon name="paid" />
          </div>
          <div class="item-content">
            <span class="item-title">漫展票务</span>
            <span class="item-desc">我的漫展门票</span>
          </div>
          <van-icon name="arrow" class="item-arrow" />
        </div>
      </div>

      <div class="menu-list">
        <div class="menu-item" @click="goMineSubPage('Feedback')">
          <div class="item-icon" style="background: #fff3e0; color: #ff9800;">
            <van-icon name="records" />
          </div>
          <div class="item-content">
            <span class="item-title">工单反馈</span>
            <span class="item-desc">问题反馈与建议</span>
          </div>
          <van-icon name="arrow" class="item-arrow" />
        </div>
        
        <div class="menu-item logout" @click="onLogout">
          <div class="item-icon" style="background: #ffebee; color: #f44336;">
            <van-icon name="contact" />
          </div>
          <div class="item-content">
            <span class="item-title">退出登录</span>
          </div>
          <van-icon name="arrow" class="item-arrow" />
        </div>
      </div>
    </div>

    <!-- 关于我们弹窗 -->
    <van-action-sheet v-model:show="showAbout" title="关于我们" class="about-sheet">
      <div class="about-content">
        <div class="app-logo">⚔</div>
        <h2 class="app-name">Anime Shop</h2>
        <p class="app-version">Version 1.0.0</p>
        <div class="app-desc">
          <p>专为二次元爱好者打造的动漫周边商城</p>
          <p>手办、模型、漫展票务一站式服务平台</p>
        </div>
        <div class="app-links">
          <a href="#" @click.prevent>用户协议</a>
          <span class="divider">|</span>
          <a href="#" @click.prevent>隐私政策</a>
          <span class="divider">|</span>
          <a href="#" @click.prevent>开源许可</a>
        </div>
        <p class="copyright">© 2024 Anime Shop. All rights reserved.</p>
      </div>
    </van-action-sheet>

    <!-- 修改用户名弹窗 - B站风格 -->
    <van-dialog
      v-model:show="nicknameDialogVisible"
      title="修改昵称"
      width="85%"
      class="nickname-dialog"
      show-cancel-button
      :confirm-button-loading="isSubmitting"
      @confirm="handleConfirmNickname"
      @cancel="nicknameDialogVisible = false"
      confirm-button-text="确认"
      cancel-button-text="取消"
    >
      <div class="nickname-dialog-content">
        <div class="nickname-input-wrapper">
          <div class="input-label">新昵称</div>
          <van-field
            v-model="newNickname"
            placeholder="请输入新昵称 (2-16个字符)"
            maxlength="16"
            clearable
            class="nickname-field"
            :error-message="nicknameError"
          >
            <template #left-icon>
              <van-icon name="user-o" class="field-icon" />
            </template>
          </van-field>
          <div class="nickname-tips">
            <van-icon name="info-o" />
            <span>昵称支持中文、英文、数字，不含特殊符号</span>
          </div>
        </div>
      </div>
    </van-dialog>

    <!-- 头像上传弹窗 -->
    <van-dialog
      v-model:show="avatarDialogVisible"
      title="更换头像"
      width="85%"
      class="avatar-dialog"
      show-cancel-button
      @confirm="confirmAvatarChange"
    >
      <div class="avatar-upload-container">
        <div class="current-avatar" v-if="!previewUrl">
          <img :src="user.avatar || 'https://www.helloimg.com/i/2026/01/27/69783066c0b56.png  '" />
        </div>
        <van-uploader
          class="avatar-uploader"
          :after-read="handleAfterRead"
          :before-read="beforeAvatarUpload"
          accept="image/*"
          :max-size="2 * 1024 * 1024"
          :multiple="false"
        >
          <div class="upload-area" :class="{ 'has-preview': previewUrl }">
            <img v-if="previewUrl" :src="previewUrl" class="preview-img" />
            <div v-else class="upload-placeholder">
              <van-icon name="photograph" size="32" />
              <p>点击上传新头像</p>
              <span>支持 JPG/PNG，最大 2MB</span>
            </div>
          </div>
        </van-uploader>
      </div>
    </van-dialog>

    <TabBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import TabBar from '@/components/TabBar.vue'
import request from '@/utils/request'
import { editNickname } from '@/api/mobile/mine'

const router = useRouter()
const showAbout = ref(false)
const user = useUserStore()

// 订单数量（模拟数据）- 更新为5个状态
const orderCount = ref({
  all: 0,          // 全部订单
  pending: 0,      // 待付款 (status: 0)
  unshipped: 0,    // 待发货 (status: 1)
  shipping: 0,     // 待收货 (status: 2)
  afterSale: 0     // 售后 (status: 5)
})

// 头像上传相关
const avatarDialogVisible = ref(false)
const previewUrl = ref('')
const uploadFile = ref(null)

// 修改用户名相关
const nicknameDialogVisible = ref(false)
const newNickname = ref('')
const nicknameError = ref('')
const isSubmitting = ref(false)

const openAvatarDialog = () => {
  if (!user.token) {
    ElMessage.info('请先登录')
    router.replace('/login')
    return
  }
  avatarDialogVisible.value = true
  previewUrl.value = ''
  uploadFile.value = null
}

const handleAvatarError = (e) => {
  e.target.src = 'https://www.helloimg.com/i/2026/01/27/69783066c0b56.png  '
}

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请上传图片格式的文件！')
    return false
  }
  const maxSize = 2097152;
  const isLt2M = file.size <= maxSize
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB！')
    return false
  }
  return true
}

const handleAfterRead = (file) => {
  uploadFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target.result
  }
  reader.readAsDataURL(file.file)
}

const confirmAvatarChange = async () => {
  if (!uploadFile.value) {
    ElMessage.warning('请先选择要上传的头像！')
    return
  }

  try {
    const formData = new FormData()
    formData.append('file', uploadFile.value.file)
    formData.append('userId', user.id)
    formData.append('operatorRole', 'user')

    const response = await request({
      url: 'admin/users/avatar/upload',
      method: 'post',
      data: formData,
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.code === 0) {
      const newAvatarUrl = response.data
      user.avatar = newAvatarUrl
      localStorage.setItem('avatar', newAvatarUrl)
      ElMessage.success('头像更换成功！')
      avatarDialogVisible.value = false
    } else {
      ElMessage.error('头像上传失败：' + (response.msg || '服务器错误'))
    }
  } catch (error) {
    console.error('头像上传失败：', error)
    ElMessage.error('上传失败，请稍后重试')
  }
}

// ========== 修改用户名功能 ==========

const openNicknameDialog = () => {
  if (!user.token) {
    ElMessage.info('请先登录')
    router.replace('/login')
    return
  }
  // 初始化输入框为当前用户名
  newNickname.value = user.username || ''
  nicknameError.value = ''
  nicknameDialogVisible.value = true
}

// 验证昵称
const validateNickname = (nickname) => {
  if (!nickname || nickname.trim().length === 0) {
    return '昵称不能为空'
  }
  if (nickname.trim().length < 2) {
    return '昵称至少需要2个字符'
  }
  if (nickname.trim().length > 16) {
    return '昵称最多16个字符'
  }
  // 只允许中文、英文、数字
  const regex = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/
  if (!regex.test(nickname)) {
    return '昵称只能包含中文、英文和数字'
  }
  return ''
}

// 对话框关闭前处理
const handleConfirmNickname = async () => {
  // 验证
  const error = validateNickname(newNickname.value)
  if (error) {
    nicknameError.value = error
    return // 不关闭对话框，因为没调 close，按钮不会转圈
  }
  
  // 检查是否与当前昵称相同
  if (newNickname.value.trim() === user.username) {
    ElMessage.info('新昵称与当前昵称相同')
    nicknameDialogVisible.value = false
    return
  }

  isSubmitting.value = true
  
  try {
    const res = await editNickname({
      userId: user.id,
      newNickname: newNickname.value.trim()
    })
    
    if (res.code === 0) {
      user.username = newNickname.value.trim()
      localStorage.setItem('username', newNickname.value.trim())
      ElMessage.success('昵称修改成功！')
      nicknameDialogVisible.value = false
    } else {
      nicknameError.value = res.msg || '修改失败，请重试'
    }
  } catch (error) {
    console.error('修改昵称失败：', error)
    nicknameError.value = '网络错误，请稍后重试'
  } finally {
    isSubmitting.value = false
  }
}

const copyUid = () => {
  const uid = user.id || '00000000000'
  navigator.clipboard?.writeText(uid).then(() => {
    ElMessage.success('UID已复制')
  }).catch(() => {
    ElMessage.info('UID: ' + uid)
  })
}

const goRecharge = () => {
  ElMessage.info('充值功能开发中')
}

onMounted(() => {
  if (!user.token) {
    router.replace('/login')
    ElMessage.info('请先登录')
  }
})

const goMineSubPage = (pageName, query = {}) => {
  try {
    router.push({ name: pageName, query })
  } catch (error) {
    ElMessage.warning('页面暂未开发')
  }
}

function onLogout () {
  user.logout()
  ElMessage.success('退出登录成功')
  router.replace('/login')
}
</script>

<style scoped>
/* ===== 基础样式 ===== */
.page {
  background: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 80px;
}

/* ===== 玻璃拟态头部 ===== */
.glass-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
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

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #666;
  font-size: 20px;
  transition: all 0.3s;
}

.action-btn:active {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(0.95);
}

/* ===== 用户区域 ===== */
.user-section {
  padding-top: 66px;
  padding-left: 16px;
  padding-right: 16px;
}

/* 用户卡片 - Hpoi风格 */
.user-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bg-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%);
}

.user-content {
  position: relative;
  padding: 24px 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

/* 头像区域 */
.avatar-section {
  position: relative;
  flex-shrink: 0;
}

.avatar-ring {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%);
  cursor: pointer;
  transition: transform 0.3s;
}

.avatar-ring:active {
  transform: scale(0.95);
}

.avatar-glow {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  opacity: 0;
  filter: blur(8px);
  transition: opacity 0.3s;
}

.avatar-section:hover .avatar-glow {
  opacity: 0.6;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
}

.avatar-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: #ff2442;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  border: 2px solid #fff;
}

.level-tag {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  color: #333;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 10px;
  border: 2px solid #fff;
}

/* 信息区域 */
.info-section {
  flex: 1;
  color: white;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.name {
  font-size: 20px;
  font-weight: 700;
}

/* 可编辑的用户名样式 */
.name-editable {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  margin: -4px -8px;
  border-radius: 8px;
  transition: all 0.3s;
  position: relative;
}

.name-editable:hover {
  background: rgba(255, 255, 255, 0.15);
}

.name-editable:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.25);
}

.edit-icon {
  font-size: 14px;
  opacity: 0.7;
  transition: all 0.3s;
}

.name-editable:hover .edit-icon {
  opacity: 1;
  transform: translateX(2px);
}

.gender-tag {
  width: 20px;
  height: 20px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.uid-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  opacity: 0.9;
}

.uid {
  font-size: 13px;
  font-family: monospace;
}

.copy-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.2);
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.copy-btn:active {
  background: rgba(255,255,255,0.3);
  transform: scale(0.95);
}

.bio {
  font-size: 13px;
  opacity: 0.8;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stats-row {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-num {
  font-size: 18px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

/* ===== 资产卡片 ===== */
.assets-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.assets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.assets-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.recharge-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  color: white;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.3s;
}

.recharge-btn:active {
  transform: scale(0.95);
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.asset-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.asset-item:active {
  background: #f0f2f5;
  transform: scale(0.98);
}

.asset-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.asset-info {
  display: flex;
  flex-direction: column;
}

.asset-num {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.asset-label {
  font-size: 12px;
  color: #999;
}

/* ===== 菜单区域 ===== */
.menu-section {
  padding: 16px;
}

.menu-group {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.group-title {
  font-size: 15px;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
  padding-left: 4px;
}

/* 订单网格 - 改为5列 */
.order-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
}

.order-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 2px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.order-item:active {
  background: #f5f7fa;
  transform: scale(0.95);
}

.order-icon {
  position: relative;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 12px;
  color: #666;
  font-size: 22px;
}

.order-icon .badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #ff2442;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

.order-item span {
  font-size: 12px;
  color: #666;
}

/* 菜单列表 */
.menu-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background 0.3s;
  border-bottom: 1px solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #f8f9fa;
}

.menu-item.logout:active {
  background: #ffebee;
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-title {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.item-desc {
  font-size: 12px;
  color: #999;
}

.item-arrow {
  color: #ccc;
  font-size: 16px;
}

/* ===== 关于我们弹窗 ===== */
.about-sheet :deep(.van-action-sheet__header) {
  font-weight: 700;
}

.about-content {
  padding: 24px;
  text-align: center;
}

.app-logo {
  font-size: 60px;
  margin-bottom: 12px;
}

.app-name {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px 0;
}

.app-version {
  font-size: 13px;
  color: #999;
  margin-bottom: 16px;
}

.app-desc {
  color: #666;
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 20px;
}

.app-desc p {
  margin: 0;
}

.app-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 13px;
}

.app-links a {
  color: #666;
  text-decoration: none;
}

.app-links .divider {
  color: #ddd;
}

.copyright {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* ===== 修改昵称弹窗 - B站风格 ===== */
.nickname-dialog :deep(.van-dialog__header) {
  font-weight: 700;
  padding-top: 20px;
  color: #333;
}

.nickname-dialog :deep(.van-dialog__confirm) {
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  color: white;
  border: none;
}

.nickname-dialog :deep(.van-dialog__confirm):active {
  opacity: 0.9;
}

.nickname-dialog-content {
  padding: 20px 24px;
}

.nickname-input-wrapper {
  width: 100%;
}

.input-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.nickname-field {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 12px;
}

.nickname-field :deep(.van-field__body) {
  padding: 8px 4px;
}

.field-icon {
  color: #ff2442;
  margin: 8px;
  font-size: 18px;
}

.nickname-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #999;
}

.nickname-tips .van-icon {
  font-size: 14px;
  color: #ff9800;
}

/* ===== 头像上传弹窗 ===== */
.avatar-dialog :deep(.van-dialog__header) {
  font-weight: 700;
  padding-top: 20px;
}

.avatar-upload-container {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.current-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #f5f5f5;
}

.current-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-area {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 2px dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.3s;
}

.upload-area.has-preview {
  border-style: solid;
  border-color: #ff2442;
}

.upload-area:active {
  background: #f8f9fa;
  border-color: #ff2442;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  text-align: center;
  color: #999;
}

.upload-placeholder p {
  font-size: 14px;
  margin: 8px 0 4px;
}

.upload-placeholder span {
  font-size: 12px;
  color: #bbb;
}

/* ===== TabBar ===== */
:deep(.van-tabbar) {
  height: 50px;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
}
</style>