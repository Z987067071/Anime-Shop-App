<template>
  <div class="pay-page">
    <!-- 头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="back-btn" @click="$router.back()">
          <van-icon name="arrow-left" />
        </div>
        <div class="header-title">订单支付</div>
        <div style="width: 36px"></div>
      </div>
    </div>

    <div class="page-body">
      <!-- 倒计时提示 -->
      <div class="countdown-banner" :class="{ 'timeout': timeout }">
        <van-icon :name="timeout ? 'close-circle' : 'clock'" class="banner-icon" />
        <span v-if="!timeout">
          请在 <span class="countdown-time">{{ countdownText }}</span> 内完成支付
        </span>
        <span v-else>订单已超时，已自动取消</span>
      </div>

      <!-- 金额卡片 -->
      <div class="amount-card">
        <div class="amount-bg"></div>
        <div class="amount-content">
          <p class="amount-label">应付金额</p>
          <div class="amount-value">
            <span class="amount-symbol">¥</span>
            <span class="amount-num">{{ orderDetail.payAmount || '0.00' }}</span>
          </div>
          <div class="order-no-row">
            <van-icon name="orders-o" />
            <span>{{ orderDetail.orderNo || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="section-card">
        <div class="section-title">选择支付方式</div>
        <div class="pay-options">
          <div
            class="pay-option"
            :class="{ active: payType === 2 }"
            @click="selectPayType(2)"
          >
            <div class="option-left">
              <div class="option-icon alipay">
                <img src="../assets/alipay.png" alt="支付宝" />
              </div>
              <div class="option-info">
                <span class="option-name">支付宝</span>
                <span class="option-desc">推荐使用支付宝支付</span>
              </div>
            </div>
            <div class="option-check" :class="{ checked: payType === 2 }">
              <van-icon name="success" v-if="payType === 2" />
            </div>
          </div>

          <div
            class="pay-option"
            :class="{ active: payType === 1 }"
            @click="selectPayType(1)"
          >
            <div class="option-left">
              <div class="option-icon wxpay">
                <img src="../assets/wxpay.png" alt="微信支付" />
              </div>
              <div class="option-info">
                <span class="option-name">微信支付</span>
                <span class="option-desc">使用微信钱包支付</span>
              </div>
            </div>
            <div class="option-check" :class="{ checked: payType === 1 }">
              <van-icon name="success" v-if="payType === 1" />
            </div>
          </div>
        </div>
      </div>

      <!-- 安全提示 -->
      <div class="security-tip">
        <van-icon name="shield-o" />
        <span>支付信息加密传输，安全有保障</span>
      </div>
    </div>

    <!-- 底部支付按钮 -->
    <div class="pay-footer">
      <div class="footer-amount">
        <span class="footer-label">实付</span>
        <span class="footer-price">¥{{ orderDetail.payAmount || '0.00' }}</span>
      </div>
      <div
        class="pay-btn"
        :class="{ disabled: !payType || timeout, loading: paying }"
        @click="handlePay"
      >
        <van-loading v-if="paying" size="18px" color="#fff" />
        <span v-else>{{ timeout ? '订单已超时' : '立即支付' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { payOrder as apiPayOrder, getOrderDetail, cancelOrder } from '@/api/mobile/order'
import { showToast, showFailToast, showSuccessToast } from 'vant'

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

const handlePay = async () => {
  if (!payType.value || timeout.value || paying.value) return
  paying.value = true
  try {
    const res = await apiPayOrder(orderId.value, payType.value)
    if (res.code === 0) {
      showSuccessToast('支付成功')
      setTimeout(() => router.push('/mine/orderList'), 1500)
    } else {
      showFailToast(res.msg || '支付失败')
    }
  } catch (e) {
    showFailToast('网络异常，请重试')
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

onMounted(async () => {
  await getOrder()
  startCountdown()
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})
</script>

<style scoped>
.pay-page {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  padding-top: 56px;
  padding-bottom: 80px;
}

/* 头部 */
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 56px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 16px;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  font-size: 18px;
  color: #333;
  cursor: pointer;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
}

.page-body {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 倒计时横幅 */
.countdown-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #fff7e6, #fff3d6);
  border: 1px solid #ffe58f;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  color: #d46b08;
}

.countdown-banner.timeout {
  background: linear-gradient(135deg, #fff1f0, #ffe7e6);
  border-color: #ffccc7;
  color: #cf1322;
}

.banner-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.countdown-time {
  font-weight: 700;
  font-size: 16px;
  color: #ff2442;
}

/* 金额卡片 */
.amount-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  padding: 28px 24px;
  color: #fff;
}

.amount-bg {
  position: absolute;
  top: -30px;
  right: -30px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.amount-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.amount-label {
  font-size: 14px;
  opacity: 0.85;
  margin: 0 0 8px 0;
}

.amount-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-bottom: 16px;
}

.amount-symbol {
  font-size: 20px;
  font-weight: 600;
}

.amount-num {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.order-no-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.75;
}

/* 支付方式卡片 */
.section-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 14px;
}

.pay-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pay-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  border-radius: 12px;
  border: 2px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pay-option.active {
  border-color: #ff2442;
  background: rgba(255, 36, 66, 0.03);
}

.option-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.option-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.option-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.option-desc {
  font-size: 12px;
  color: #999;
}

.option-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #fff;
  transition: all 0.2s ease;
}

.option-check.checked {
  background: #ff2442;
  border-color: #ff2442;
}

/* 安全提示 */
.security-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #bbb;
}

/* 底部 */
.pay-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
  gap: 16px;
}

.footer-amount {
  display: flex;
  flex-direction: column;
}

.footer-label {
  font-size: 12px;
  color: #999;
}

.footer-price {
  font-size: 20px;
  font-weight: 700;
  color: #ff2442;
}

.pay-btn {
  flex: 1;
  height: 48px;
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  color: #fff;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.pay-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
}

.pay-btn:active:not(.disabled) {
  opacity: 0.85;
}
</style>
