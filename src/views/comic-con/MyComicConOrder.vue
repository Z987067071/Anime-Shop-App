<template>
  <div class="ticket-order-page">
    <!-- 顶部导航 -->
    <div class="nav-bar">
      <van-icon name="arrow-left" class="back-btn" @click="router.back()" />
      <span class="nav-title">我的票务订单</span>
    </div>

    <!-- 状态标签栏 -->
    <van-tabs
      v-model:active="activeTab"
      class="order-tabs"
      sticky
      offset-top="48"
      @change="handleTabChange"
      :line-width="20"
      :line-height="3"
    >
      <van-tab title="全部" name="all" />
      <van-tab title="待支付" name="unpaid" />
      <van-tab title="已支付" name="paid" />
      <van-tab title="已核销" name="verified" />
      <van-tab title="已退票" name="refunded" />
    </van-tabs>

    <!-- 订单列表 -->
    <div class="order-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多订单了"
          @load="onLoad"
        >
          <!-- 空状态 -->
          <div class="empty-wrap" v-if="filteredOrderList.length === 0 && !loading">
            <div class="empty-icon">🎫</div>
            <p class="empty-text">暂无票务订单</p>
            <van-button round type="primary" size="small" class="empty-btn" @click="router.push('/comic-con/list')">
              去逛漫展
            </van-button>
          </div>

          <!-- 订单卡片 -->
          <div
            v-for="order in filteredOrderList"
            :key="order.orderId"
            class="order-card"
          >
            <!-- 卡片头部：漫展封面 + 基础信息 -->
            <div class="card-header">
              <div class="banner-wrap">
                <img :src="order.comicConBanner" class="banner-img" alt="漫展封面"
                  @error="(e) => e.target.src = 'https://www.helloimg.com/i/2026/01/27/69783066c0b56.png'" />
                <div class="banner-overlay"></div>
              </div>
              <div class="header-info">
                <div class="comic-name">{{ order.comicConName }}</div>
                <div class="ticket-meta">
                  <span class="ticket-type-tag">{{ order.ticketType }}</span>
                  <span class="ticket-count">× {{ order.ticketCount || 1 }} 张</span>
                </div>
                <div class="order-no-row">
                  <van-icon name="orders-o" size="11" />
                  <span class="order-no">{{ order.orderNo }}</span>
                </div>
              </div>
              <div class="status-badge" :class="'status-' + order.status">
                {{ getStatusText(order.status) }}
              </div>
            </div>

            <!-- 时间信息 -->
            <div class="time-row">
              <div class="time-item">
                <span class="time-label">下单时间</span>
                <span class="time-value">{{ formatTime(order.createTime) }}</span>
              </div>
              <div class="time-item" v-if="order.payTime">
                <span class="time-label">支付时间</span>
                <span class="time-value">{{ formatTime(order.payTime) }}</span>
              </div>
            </div>

            <!-- 票务核销区（已支付/已核销才展示） -->
            <div class="tickets-section" v-if="['paid', 'verified'].includes(order.status)">
              <div class="section-title">
                <van-icon name="certificate" />
                <span>入场凭证</span>
              </div>

              <div
                class="ticket-card"
                v-for="(ticket, index) in (order.ticketVerifyList && order.ticketVerifyList.length
                  ? order.ticketVerifyList
                  : [{ verifyCode: order.verifyCode, verifyQrCodeUrl: order.verifyQrCodeUrl }])"
                :key="index"
              >
                <!-- 票号标识 -->
                <div class="ticket-num-row">
                  <div class="ticket-num">第 {{ index + 1 }} 张</div>
                  <div class="ticket-verified-badge" v-if="ticket.isVerified">
                    <van-icon name="passed" />已核销
                  </div>
                  <div class="ticket-unverified-badge" v-else>
                    <van-icon name="clock-o" />待核销
                  </div>
                </div>

                <!-- 购票人信息 -->
                <div class="buyer-row" v-if="ticket.buyerName">
                  <div class="buyer-field">
                    <span class="field-label">购票人</span>
                    <span class="field-value">{{ ticket.buyerName }}</span>
                  </div>
                  <div class="buyer-field" v-if="ticket.buyerIdCard">
                    <span class="field-label">证件号</span>
                    <span class="field-value id-card">{{ ticket.buyerIdCard }}</span>
                  </div>
                </div>

                <!-- 核销码 + 二维码 -->
                <div class="verify-section">
                  <div class="verify-code-row">
                    <div class="code-label">核销码</div>
                    <div class="code-value">{{ ticket.verifyCode }}</div>
                    <van-button
                      size="mini"
                      round
                      type="primary"
                      class="copy-btn"
                      @click="copyCode(ticket.verifyCode)"
                    >
                      复制
                    </van-button>
                  </div>

                  <div class="qr-wrap" v-if="order.status === 'paid' && !ticket.isVerified">
                    <div class="qr-inner">
                      <img :src="ticket.verifyQrCodeUrl || order.verifyQrCodeUrl" class="qr-img" alt="核销二维码" />
                    </div>
                    <p class="qr-tip">
                      <van-icon name="scan" />
                      扫码核销第 {{ index + 1 }} 张票
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 价格行 -->
            <div class="price-row">
              <span class="price-label">实付金额</span>
              <span class="price-value">
                <span class="price-symbol">¥</span>
                <span class="price-num">{{ order.ticketPrice }}</span>
                <span class="price-count" v-if="(order.ticketCount || 1) > 1">× {{ order.ticketCount }}</span>
              </span>
            </div>

            <!-- 操作按钮 -->
            <div class="action-row">
              <van-button
                v-if="order.status === 'unpaid'"
                size="small" round plain
                class="action-btn"
                @click="cancelOrder(order.orderId)"
              >
                取消订单
              </van-button>
              <van-button
                v-if="order.status === 'unpaid'"
                size="small" round type="primary"
                class="action-btn primary"
                @click="toPay(order.orderId)"
              >
                去支付
              </van-button>
              <van-button
                v-if="order.status === 'paid'"
                size="small" round plain type="warning"
                class="action-btn"
                @click="showToast('退票功能敬请期待')"
              >
                申请退票
              </van-button>
              <van-button
                v-if="['verified', 'refunded'].includes(order.status)"
                size="small" round plain
                class="action-btn"
                @click="viewDetail(order.orderId)"
              >
                查看详情
              </van-button>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog, showFailToast } from 'vant'
import {
  getUserComicConTickets,
  cancelComicConOrder,
  payComicConOrder
} from '@/api/mobile/comic-con'

const router = useRouter()
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const activeTab = ref('all')
const orderList = ref([])

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return timeStr.replace('T', ' ').substring(0, 16)
}

const convertStatus = (statusCode) => {
  const statusMap = { 0: 'unpaid', 1: 'paid', 3: 'verified', 4: 'refunded' }
  return statusMap[statusCode] || 'unknown'
}

const filteredOrderList = computed(() => {
  const list = orderList.value.map(order => ({
    ...order,
    status: convertStatus(order.orderStatus),
    comicConBanner: order.comicConBanner || 'https://www.helloimg.com/i/2026/01/27/69783066c0b56.png',
    ticketVerifyList: order.ticketVerifyList || []
  }))
  if (activeTab.value === 'all') return list
  return list.filter(o => o.status === activeTab.value)
})

const loadOrderData = async () => {
  try {
    loading.value = true
    const res = await getUserComicConTickets()
    if (res.code === 0) {
      orderList.value = res.data || []
    } else {
      showFailToast(res.msg || '加载失败')
    }
  } catch (e) {
    showFailToast('网络错误，加载失败')
  } finally {
    loading.value = false
    finished.value = true
    refreshing.value = false
  }
}

const onLoad = () => {
  loading.value = false
  finished.value = true
}

const onRefresh = () => {
  finished.value = false
  loadOrderData()
}

const handleTabChange = () => {
  // 前端筛选，无需重新请求
}

const getStatusText = (status) => {
  const map = { unpaid: '待支付', paid: '已支付', verified: '已核销', refunded: '已退票', unknown: '未知' }
  return map[status] || '未知'
}

const copyCode = (code) => {
  if (!code) { showToast('核销码为空'); return }
  navigator.clipboard.writeText(code)
    .then(() => showToast('核销码已复制'))
    .catch(() => showToast('复制失败，请手动记录'))
}

const toPay = (orderId) => {
  router.push({ path: '/order/pay', query: { orderId } })
}

const cancelOrder = async (orderId) => {
  try {
    await showConfirmDialog({ title: '确认取消', message: '取消后无法恢复，确认吗？' })
    const res = await cancelComicConOrder(orderId)
    if (res.code === 0) {
      showToast('订单已取消')
      loadOrderData()
    } else {
      showFailToast(res.msg || '取消失败')
    }
  } catch {}
}

const viewDetail = (orderId) => {
  router.push({ path: `/order/detail/${orderId}` })
}

onMounted(() => loadOrderData())
</script>

<style scoped>
.ticket-order-page {
  min-height: 100vh;
  background: #f4f5f7;
  padding-bottom: 30px;
}

/* ===== 导航栏 ===== */
.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}
.back-btn {
  font-size: 20px;
  color: #333;
  cursor: pointer;
  margin-right: 12px;
}
.nav-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
}

/* ===== 标签栏 ===== */
.order-tabs {
  background: #fff;
  position: sticky;
  top: 48px;
  z-index: 99;
}
:deep(.van-tabs__line) {
  background: #ff2442;
}
:deep(.van-tab--active) {
  color: #ff2442;
  font-weight: 600;
}

/* ===== 列表区 ===== */
.order-list {
  padding: 12px;
}

/* ===== 空状态 ===== */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0 40px;
}
.empty-icon {
  font-size: 56px;
  margin-bottom: 12px;
}
.empty-text {
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}
.empty-btn {
  min-width: 120px;
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  border: none;
}

/* ===== 订单卡片 ===== */
.order-card {
  background: #fff;
  border-radius: 16px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

/* 卡片头部 */
.card-header {
  position: relative;
  display: flex;
  align-items: center;
  padding: 14px 14px 14px 0;
  gap: 12px;
  border-bottom: 1px solid #f5f5f5;
}
.banner-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 0 12px 12px 0;
  overflow: hidden;
}
.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.15));
}
.header-info {
  flex: 1;
  min-width: 0;
}
.comic-name {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ticket-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.ticket-type-tag {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}
.ticket-count {
  font-size: 13px;
  color: #666;
}
.order-no-row {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #aaa;
  font-size: 11px;
}
.order-no {
  font-family: monospace;
  letter-spacing: 0.5px;
}

/* 状态徽章 */
.status-badge {
  position: absolute;
  top: 12px;
  right: 14px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
}
.status-unpaid { background: #fff7e6; color: #fa8c16; }
.status-paid { background: #e6f4ff; color: #1677ff; }
.status-verified { background: #f6ffed; color: #52c41a; }
.status-refunded { background: #f5f5f5; color: #999; }
.status-unknown { background: #f5f5f5; color: #999; }

/* 时间行 */
.time-row {
  display: flex;
  gap: 20px;
  padding: 10px 14px;
  border-bottom: 1px solid #f5f5f5;
}
.time-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.time-label {
  font-size: 11px;
  color: #aaa;
}
.time-value {
  font-size: 12px;
  color: #555;
}

/* ===== 票务核销区 ===== */
.tickets-section {
  padding: 12px 14px;
  border-bottom: 1px solid #f5f5f5;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}
.section-title .van-icon {
  color: #667eea;
  font-size: 15px;
}

/* 单张票卡片 */
.ticket-card {
  background: #f8f9ff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e8ecff;
}
.ticket-card:last-child {
  margin-bottom: 0;
}

.ticket-num-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.ticket-num {
  font-size: 13px;
  font-weight: 700;
  color: #667eea;
}
.ticket-verified-badge {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #52c41a;
  background: #f6ffed;
  padding: 2px 8px;
  border-radius: 10px;
}
.ticket-unverified-badge {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #fa8c16;
  background: #fff7e6;
  padding: 2px 8px;
  border-radius: 10px;
}

/* 购票人信息 */
.buyer-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
}
.buyer-field {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.field-label {
  color: #999;
  min-width: 44px;
  flex-shrink: 0;
}
.field-value {
  color: #333;
  font-weight: 500;
}
.id-card {
  font-family: monospace;
  letter-spacing: 1px;
}

/* 核销码区 */
.verify-section {
  background: #fff;
  border-radius: 8px;
  padding: 10px;
}
.verify-code-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.code-label {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}
.code-value {
  flex: 1;
  font-size: 17px;
  font-weight: 700;
  color: #ff2442;
  letter-spacing: 1.5px;
  font-family: monospace;
}
.copy-btn {
  flex-shrink: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: #fff;
}

/* 二维码 */
.qr-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 8px;
  border-top: 1px dashed #eee;
}
.qr-inner {
  width: 120px;
  height: 120px;
  padding: 6px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.qr-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.qr-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* ===== 价格行 ===== */
.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid #f5f5f5;
}
.price-label {
  font-size: 13px;
  color: #999;
}
.price-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.price-symbol {
  font-size: 13px;
  color: #ff2442;
  font-weight: 600;
}
.price-num {
  font-size: 18px;
  font-weight: 700;
  color: #ff2442;
}
.price-count {
  font-size: 12px;
  color: #999;
  margin-left: 4px;
}

/* ===== 操作按钮 ===== */
.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 14px;
}
.action-btn {
  min-width: 80px;
  height: 32px;
  font-size: 13px;
}
.action-btn.primary {
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  border: none;
  color: #fff;
}
</style>
