<template>
  <div class="pay-page">
    <!-- 订单信息 -->
    <div class="order-info">
      <h3>订单支付</h3>
      <p>订单编号：{{ orderDetail.orderNo }}</p>
      <p>应付金额：¥{{ orderDetail.payAmount }}</p>
      <p>剩余支付时间：<span class="countdown" :style="{color: timeout ? 'red' : 'black'}">{{ countdownText }}</span></p>
    </div>

    <!-- 支付方式选择 -->
    <div class="pay-type">
      <h4>选择支付方式</h4>
      <div class="type-item" @click="selectPayType(2)" :class="{active: payType === 2}">
        <img src="../assets/alipay.png" alt="支付宝">
        <span>支付宝支付</span>
      </div>
      <div class="type-item" @click="selectPayType(1)" :class="{active: payType === 1}">
        <img src="../assets/wxpay.png" alt="微信支付">
        <span>微信支付</span>
      </div>
    </div>

    <!-- 支付按钮 -->
    <button class="pay-btn" @click="payOrder" :disabled="!payType || timeout">
      {{ timeout ? '订单已超时' : '立即支付' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { payOrder as apiPayOrder, getOrderDetail, cancelOrder } from '@/api/mobile/order'
import { showToast, showFailToast } from 'vant'

const route = useRoute()
const router = useRouter()
const orderId = ref(route.query.orderId) // 从路由获取订单ID
const orderDetail = ref({})
const payType = ref(0) // 1=支付宝，2=微信
const countdown = ref(900) // 15分钟=900秒
const timer = ref(null)
const timeout = ref(false)

// 格式化倒计时（00:00）
const countdownText = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// 获取订单详情
const getOrder = async () => {
  const res = await getOrderDetail(orderId.value)
  if (res.code === 0) {
    orderDetail.value = res.data
    timeout.value = res.data.timeout
    // 计算剩余时间（如果未超时）
    if (!timeout.value) {
      const createTime = new Date(res.data.createTime).getTime()
      const now = Date.now()
      const remain = 900 - Math.floor((now - createTime) / 1000)
      countdown.value = remain > 0 ? remain : 0
      if (countdown.value <= 0) {
        timeout.value = true
        // 自动取消订单（前端触发，后端定时任务兜底）
        await cancelOrder(orderId.value)
      }
    }
  }
}

// 选择支付方式
const selectPayType = (type) => {
  payType.value = type
}

// 模拟支付
const payOrder = async () => {
  const res = await apiPayOrder(orderId.value, payType.value)
  if (res.code === 0) {
    showToast('支付成功！')
    setTimeout(() => {
      router.push('/mine/orderList')
    }, 1500)
  } else {
    showFailToast(res.msg)
  }
}

// 倒计时逻辑
const startCountdown = () => {
  if (timeout.value) return
  timer.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer.value)
      timeout.value = true
      // 自动取消订单
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
  // 页面销毁清除定时器
  if (timer.value) clearInterval(timer.value)
})
</script>

<style scoped>
.pay-page {
  padding: 20px;
}
.order-info {
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 20px;
}
.countdown {
  font-weight: bold;
}
.pay-type {
  margin-bottom: 30px;
}
.type-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
}
.type-item.active {
  border-color: #007bff;
  background: #e8f4ff;
}
.type-item img {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}
.pay-btn {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}
.pay-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>