<template>
  <div class="login-page">
    <header class="glass-header">
      <div class="header-content">
        <div class="back-btn" @click="$router.back()">
          <van-icon name="arrow-left" />
        </div>
        <h1 class="page-title">登录</h1>
        <div class="header-spacer"></div>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo-icon">🍻</div>
        <h2 class="logo-text">Anime Shop</h2>
        <p class="logo-slogan">二次元爱好者的聚集地</p>
      </div>

      <!-- 登录卡片 -->
      <div class="login-card">
        <div class="card-header">
          <span class="header-title">欢迎回来</span>
          <span class="header-subtitle">请登录您的账号</span>
        </div>

        <van-form @submit="onSubmit" class="login-form">
          <!-- 账号 -->
          <div class="form-item">
            <div class="item-icon">
              <van-icon name="user-o" />
            </div>
            <van-field
              v-model="form.username"
              placeholder="请输入账号/手机号"
              :rules="[{ required: true, message: '请输入账号' }]"
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
            <div class="captcha-img" @click="refreshCaptcha">
              <img :src="captchaUrl" alt="验证码" v-if="captchaUrl" />
              <span v-else>点击刷新</span>
            </div>
          </div>

          <!-- 登录按钮 -->
          <div class="submit-section">
            <button class="submit-btn" type="submit">
              <van-icon name="log-in" />
              <span>立即登录</span>
            </button>
          </div>
        </van-form>

        <!-- 底部链接 -->
        <div class="form-footer">
          <span class="link-text" @click="$router.replace('/register')">
            还没有账号？<span class="highlight">去注册</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { showFailToast, showSuccessToast } from 'vant'
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '../utils/request'

const user = useUserStore()
const router = useRouter()
const form = reactive({ username: '', password: '', captcha: '' })
const captchaUrl = ref('')

const refreshCaptcha = () => {
  // captchaUrl.value = `/api/captcha?t=${Date.now()}`
}

onMounted(() => {
  refreshCaptcha()
})

const onSubmit = async () => {
  try {
    const { code, data, msg } = await request.post('/login', form)
    if (code !== 0) {
      refreshCaptcha()
      return showFailToast(msg)
    }
    user.login(data.token, data.role, data.nickname, data.avatar, data.id)
    showSuccessToast('登录成功')
    router.replace('/')
  } catch (e) {
    refreshCaptcha()
    showFailToast('登录失败: ' + e)
    user.logout()
  }
}
</script>

<style scoped>
.login-page {
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

.main-content {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.logo-icon {
  font-size: 60px;
  margin-bottom: 12px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
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

.login-card {
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

@media (prefers-color-scheme: dark) {
  .login-page {
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
  
  .login-card {
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