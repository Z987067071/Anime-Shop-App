<template>
  <div class="pay-page">
    <!-- 顶部导航 -->
    <div class="nav-bar">
      <van-icon name="arrow-left" class="back-btn" @click="$router.back()" />
      <span class="nav-title">收银台</span>
    </div>

    <!-- 金额展示区 -->
    <div class="amount-section">
      <div class="amount-bg"></div>
      <p class="amount-label">应付金额（元）</p>
      <div class="amount-value">
        <span class="currency">¥</span>
        <span class="number">{{ orderDetail.payAmount || '0.00' }}</span>
      </div>
      <div class="order-meta">
        <span class="order-no">订单号：{{ orderDetail.orderNo }}</span>
      </div>
      <!-- 倒计时 -->
      <div class="countdown-bar" :class="{ urgent: countdown <= 60 }">
        <van-icon name="clock-o" />
        <span v-if="!timeout">请在 <em>{{ countdownText }}</em> 内完成支付</span>
        <span v-else class="timeout-text">订单已超时关闭</span>
      </div>
    </div>

    <!-- 支付方式 -->
    <div class="pay-section">
      <div class="section-title">选择支付方式</div>

      <!-- 微信支付 -->
      <div
        class="pay-item"
        :class="{ active: payType === 1 }"
        @click="selectPayType(1)"
      >
        <div class="pay-icon wechat">
          <img src="../assets/wxpay.png" alt="微信" />
        </div>
        <div class="pay-info">
          <span class="pay-name">微信支付</span>
          <span class="pay-desc">推荐使用微信快捷支付</span>
        </div>
        <div class="pay-check">
          <div class="check-circle" :class="{ checked: payType === 1 }">
            <van-icon v-if="payType === 1" name="success" />
          </div>
        </div>
      </div>

      <!-- 支付宝 -->
      <div
        class="pay-item"
        :class="{ active: payType === 2 }"
        @click="selectPayType(2)"
      >
        <div class="pay-icon alipay">
          <img src="../assets/alipay.png" alt="支付宝" />
        </div>
        <div class="pay-info">
          <span class="pay-name">支付宝</span>
          <span class="pay-desc">支持花呗/余额/银行卡</span>
        </div>
        <div class="pay-check">
          <div class="check-circle" :class="{ checked: payType === 2 }">
            <van-icon v-if="payType === 2" name="success" />
          </div>
        </div>
      </div>
    </div>

    <!-- 安全提示 -->
    <div class="security-tip">
      <van-icon name="shield-o" />
      <span>支付信息经过加密保护，请放心支付</span>
    </div>

    <!-- 底部支付按钮 -->
    <div class="pay-footer">
      <div class="pay-summary">
        <span class="summary-label">实付</span>
        <span class="summary-amount">¥{{ orderDetail.payAmount || '0.00' }}</span>
      </div>
      <button
        class="pay-btn"
        :class="{ disabled: !payType || timeout, loading: paying }"
        :disabled="!payType || timeout || paying"
        @click="payOrder"
      >
        <van-loading v-if="paying" size="18px" color="#fff" />
        <span v-else>{{ timeout ? '订单已关闭' : '立即支付' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { payOrder as apiPayOrder, getOrderDetail, cancelOrder } from '@/api/mobile/order'
import { showToast, showFailToast } from 'vant'

const route = useRoute()
const router = useRouter()
const orderId = ref(route.query.orderId)
const orderDetail = ref({})
const payType = ref(0)
const countdown = ref(900)
const timer = ref(null)
const timeout = ref(false)
const paying = ref(false)

const countdownText = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const getOrder = async () => {
  const res = await getOrderDetail(orderId.value)
  if (res.code === 0) {
    orderDetail.value = res.data
    timeout.value = res.data.timeout
    if (!timeout.value) {
      const createTime = new Date(res.data.createTime).getTime()
      const now = Date.now()
      const remain = 900 - Math.floor((now - createTime) / 1000)
      countdown.value = remain > 0 ? remain : 0
      if (countdown.value <= 0) {
        timeout.value = true
        await cancelOrder(orderId.value)
      }
    }
  }
}

const selectPayType = (type) => {
  if (timeout.value) return
  payType.value = type
}

const payOrder = async () => {
  if (paying.value) return
  paying.value = true
  try {
    const res = await apiPayOrder(orderId.value, payType.value)
    if (res.code === 0) {
      showToast({ message: '支付成功！', icon: 'success' })
      setTimeout(() => router.push('/mine/orderList'), 1500)
    } else {
      showFailToast(res.msg)
    }
  } finally {
    paying.value = false
  }
}

const startCountdown = () => {
  if (timeout.value) return
  timer.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer.value)
      timeout.value = true
      cancelOrder(orderId.value)
      showFailToast('订单已超时，已自动取消')
    }
  }, 1000)
}

onMounted(() => {
  getOrder()
  startCountdown()
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})
</script>

<style scoped>
/* ===== 整体页面 ===== */
.pay-page {
  min-height: 100vh;
  background: #f4f5f7;
  display: flex;
  flex-direction: column;
  padding-bottom: 80px;
}

/* ===== 顶部导航 ===== */
.nav-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}
.back-btn {
  position: absolute;
  left: 16px;
  font-size: 20px;
  color: #333;
  cursor: pointer;
}
.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
}

/* ===== 金额区 ===== */
.amount-section {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 28px 20px 32px;
  text-align: center;
  color: #fff;
}
.amount-bg {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
}
.amount-label {
  font-size: 13px;
  opacity: 0.85;
  margin: 0 0 8px;
  letter-spacing: 0.5px;
}
.amount-value {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
  margin-bottom: 10px;
}
.currency {
  font-size: 22px;
  font-weight: 500;
  padding-bottom: 4px;
  opacity: 0.9;
}
.number {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -1px;
}
.order-meta {
  margin-bottom: 14px;
}
.order-no {
  font-size: 12px;
  opacity: 0.7;
  background: rgba(255,255,255,0.15);
  padding: 3px 10px;
  border-radius: 20px;
}

/* 倒计时条 */
.countdown-bar {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(4px);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 13px;
  transition: background 0.3s;
}
.countdown-bar.urgent {
  background: rgba(255, 80, 80, 0.35);
  animation: pulse 1s infinite;
}
.countdown-bar em {
  font-style: normal;
  font-weight: 700;
  font-size: 15px;
}
.timeout-text {
  font-weight: 600;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* ===== 支付方式区 ===== */
.pay-section {
  margin: 12px 12px 0;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.section-title {
  padding: 14px 16px 10px;
  font-size: 13px;
  color: #999;
  font-weight: 500;
  letter-spacing: 0.3px;
  border-bottom: 1px solid #f5f5f5;
}
.pay-item {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f8f8f8;
  position: relative;
}
.pay-item:last-child {
  border-bottom: none;
}
.pay-item:active {
  background: #fafafa;
}
.pay-item.active {
  background: #f8f6ff;
}

/* 支付图标 */
.pay-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;
  overflow: hidden;
}
.pay-icon.wechat {
  background: #e8f8ee;
}
.pay-icon.alipay {
  background: #e8f4ff;
}
.pay-icon img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

/* 支付信息 */
.pay-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.pay-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}
.pay-desc {
  font-size: 12px;
  color: #aaa;
}

/* 选中圆圈 */
.pay-check {
  margin-left: 12px;
}
.check-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 12px;
  color: #fff;
}
.check-circle.checked {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: transparent;
}

/* ===== 安全提示 ===== */
.security-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-top: 16px;
  font-size: 12px;
  color: #bbb;
}

/* ===== 底部支付栏 ===== */
.pay-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: #fff;
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.08);
  gap: 12px;
  z-index: 100;
}
.pay-summary {
  display: flex;
  flex-direction: column;
  min-width: 80px;
}
.summary-label {
  font-size: 11px;
  color: #999;
}
.summary-amount {
  font-size: 20px;
  font-weight: 700;
  color: #e54847;
  line-height: 1.2;
}
.pay-btn {
  flex: 1;
  height: 46px;
  border: none;
  border-radius: 23px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: opacity 0.2s, transform 0.1s;
  letter-spacing: 1px;
}
.pay-btn:active:not(.disabled) {
  transform: scale(0.97);
  opacity: 0.9;
}
.pay-btn.disabled {
  background: linear-gradient(135deg, #ccc, #bbb);
  cursor: not-allowed;
}
</style>
