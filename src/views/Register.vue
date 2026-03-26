<template>
  <div class="register-page">
    <header class="glass-header">
      <div class="header-content">
        <div class="back-btn" @click="$router.back()">
          <van-icon name="arrow-left" />
        </div>
        <h1 class="page-title">注册</h1>
        <div class="header-spacer"></div>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo-icon">🎉</div>
        <h2 class="logo-text">加入 Anime Shop</h2>
        <p class="logo-slogan">开启你的二次元之旅</p>
      </div>

      <!-- 注册卡片 -->
      <div class="register-card">
        <div class="card-header">
          <span class="header-title">创建账号</span>
          <span class="header-subtitle">填写以下信息完成注册</span>
        </div>

        <van-form @submit="onSubmit" class="register-form">
          <!-- 用户名 -->
          <div class="form-item">
            <div class="item-icon">
              <van-icon name="user-o" />
            </div>
            <van-field
              v-model="form.username"
              placeholder="请输入用户名"
              :rules="[{ required: true, message: '请输入用户名' }]"
              class="custom-field"
            />
          </div>

          <!-- 密码 -->
          <div class="form-item">
            <div class="item-icon">
              <van-icon name="lock" />
            </div>
            <van-field
              v-model="form.password"
              type="password"
              placeholder="请输入密码 (6-20位)"
              :rules="[{ required: true, message: '请输入密码' }]"
              class="custom-field"
            />
          </div>

          <!-- 确认密码 -->
          <div class="form-item">
            <div class="item-icon">
              <van-icon name="certificate" />
            </div>
            <van-field
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              :rules="[{ required: true, message: '请再次输入密码' }]"
              class="custom-field"
            />
          </div>

          <!-- 验证码 -->
          <div class="form-item captcha-item">
            <div class="item-icon">
              <van-icon name="shield-o" />
            </div>
            <van-field
              v-model="form.captcha"
              placeholder="请输入验证码"
              :rules="[{ required: true, message: '请输入验证码' }]"
              class="custom-field captcha-field"
            />
            <div class="captcha-img" @click="getCaptcha">
              <img :src="captchaImg" alt="验证码" v-if="captchaImg" />
              <span v-else>点击刷新</span>
            </div>
          </div>

          <!-- 注册按钮 -->
          <div class="submit-section">
            <button class="submit-btn" type="submit">
              <van-icon name="sign" />
              <span>立即注册</span>
            </button>
          </div>
        </van-form>

        <!-- 底部链接 -->
        <div class="form-footer">
          <span class="link-text" @click="$router.replace('/login')">
            已有账号？<span class="highlight">去登录</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import request from '../utils/request'

onMounted(() => {
  getCaptcha()
})

const router = useRouter()
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  captcha: ''
})
const captchaImg = ref('')

const getCaptcha = async () => {
  try {
    const { data } = await request.get('/captcha/img', { params: { username: form.username } })
    captchaImg.value = data
  } catch (e) {
    showFailToast('获取验证码失败')
  }
}

const onSubmit = async () => {
  if (form.password !== form.confirmPassword) {
    return showFailToast('两次输入的密码不一致')
  }
  
  if (form.password.length < 6 || form.password.length > 20) {
    return showFailToast('密码长度应为6-20位')
  }

  try {
    const { code, msg } = await request.post('/register', form)
    if (code !== 0) {
      getCaptcha()
      return showFailToast(msg)
    }
    showSuccessToast('注册成功')
    router.replace('/login')
  } catch (e) {
    getCaptcha()
    showFailToast('网络错误')
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff5f7 0%, #f5f7fa 100%);
}

.glass-header {
  position: sticky;
  top: 0;
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

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #333;
  font-size: 20px;
  transition: all 0.3s;
}

.back-btn:active {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(0.95);
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

/* ===== 主内容区 ===== */
.main-content {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

/* ===== Logo区域 ===== */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.logo-icon {
  font-size: 60px;
  margin-bottom: 12px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.1); }
}

.logo-text {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 8px 0;
}

.logo-slogan {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* ===== 注册卡片 ===== */
.register-card {
  background: white;
  border-radius: 24px;
  padding: 28px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 28px;
}

.header-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
}

.header-subtitle {
  font-size: 14px;
  color: #999;
}

/* ===== 表单项 ===== */
.form-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 4px;
  background: #f8f9fa;
  border-radius: 16px;
  border: 1px solid transparent;
  transition: all 0.3s;
}

.form-item:focus-within {
  background: #fff;
  border-color: #ff2442;
  box-shadow: 0 0 0 3px rgba(255, 36, 66, 0.1);
}

.item-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  color: #ff2442;
  font-size: 20px;
  flex-shrink: 0;
}

.custom-field {
  flex: 1;
  background: transparent;
  padding: 0;
}

:deep(.custom-field .van-field__control) {
  font-size: 15px;
  color: #333;
  height: 44px;
}

:deep(.custom-field .van-field__control::placeholder) {
  color: #bbb;
}

/* 验证码特殊布局 */
.captcha-item {
  gap: 8px;
}

.captcha-field {
  flex: 1;
}

.captcha-img {
  width: 100px;
  height: 44px;
  background: #f0f0f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
}

.captcha-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ===== 提交区域 ===== */
.submit-section {
  margin-top: 28px;
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

.submit-btn:active {
  transform: scale(0.98);
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.2);
}

.submit-btn .van-icon {
  font-size: 20px;
}

/* ===== 底部链接 ===== */
.form-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f5f5f5;
}

.link-text {
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.highlight {
  color: #ff2442;
  font-weight: 600;
}

/* ===== 深色模式 ===== */
@media (prefers-color-scheme: dark) {
  .register-page {
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
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
  
  .logo-text {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
    -webkit-background-clip: text;
  }
  
  .logo-slogan {
    color: #888;
  }
  
  .register-card {
    background: #242442;
  }
  
  .header-title {
    color: #e0e0e0;
  }
  
  .form-item {
    background: #1a1a2e;
  }
  
  .form-item:focus-within {
    background: #242442;
  }
  
  .item-icon {
    background: #2a2a4a;
  }
  
  :deep(.custom-field .van-field__control) {
    color: #e0e0e0;
  }
  
  .link-text {
    color: #aaa;
  }
}
</style>