<template>
  <div class="ticket-order-page">
<<<<<<< HEAD
    <!-- 头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="back-btn" @click="router.back()">
          <van-icon name="arrow-left" />
        </div>
        <div class="header-title">我的票务</div>
        <div style="width:36px"></div>
      </div>

      <!-- Tab 栏 -->
      <div class="tab-bar">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span class="tab-dot" v-if="getTabCount(tab.key) > 0">{{ getTabCount(tab.key) }}</span>
        </div>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="page-body">
      <!-- 加载骨架 -->
      <div v-if="loading" class="skeleton-list">
        <div class="skeleton-card" v-for="i in 3" :key="i">
          <div class="sk-header shimmer"></div>
          <div class="sk-body">
            <div class="sk-img shimmer"></div>
            <div class="sk-info">
              <div class="sk-line shimmer" style="width:70%"></div>
              <div class="sk-line shimmer" style="width:50%"></div>
              <div class="sk-line shimmer" style="width:40%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredList.length === 0" class="empty-state">
        <div class="empty-icon">🎫</div>
        <p class="empty-title">暂无票务订单</p>
        <p class="empty-desc">快去看看有哪些精彩漫展吧</p>
        <div class="empty-btn" @click="router.push('/comic-con/list')">浏览漫展</div>
      </div>

      <!-- 订单列表 -->
      <div v-else class="order-list">
        <div
          v-for="order in filteredList"
          :key="order.orderId"
          class="order-card"
        >
          <!-- 卡片头部 -->
          <div class="card-header">
            <div class="order-no">
              <van-icon name="orders-o" />
              <span>{{ order.orderNo }}</span>
            </div>
            <div class="status-badge" :class="order.status">
              {{ order.orderStatusName || getStatusText(order.status) }}
            </div>
          </div>

          <!-- 漫展信息 -->
          <div class="event-row" @click="router.push(`/comic-con/detail/${order.comicConId}`)">
            <div class="event-img">
              <img :src="order.comicConBanner || defaultImg" @error="e => e.target.src = defaultImg" />
              <div class="event-img-overlay">
                <van-icon name="arrow" />
              </div>
            </div>
            <div class="event-info">
              <h3 class="event-name">{{ order.comicConName }}</h3>
              <div class="event-meta">
                <van-icon name="ticket-o" />
                <span>{{ order.ticketType }} × {{ order.ticketCount || 1 }}张</span>
              </div>
              <div class="event-meta">
                <van-icon name="clock-o" />
                <span>{{ formatTime(order.createTime) }}</span>
              </div>
              <div class="event-price">
                <span class="price-unit">¥{{ order.ticketPrice }} × {{ order.ticketCount || 1 }}张</span>
                <div class="price-total-row">
                  <span class="price-label">合计</span>
                  <span class="price-sym">¥</span>
                  <span class="price-val">{{ order.totalAmount }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 待支付倒计时 -->
          <div class="countdown-bar" v-if="order.status === 'unpaid'">
            <van-icon name="clock" />
            <span>请尽快完成支付，超时订单将自动取消</span>
          </div>

          <!-- 票券展示（已支付/已核销） -->
          <div
            v-if="['paid', 'verified'].includes(order.status)"
            class="tickets-section"
          >
            <div class="tickets-title">
              <van-icon name="certificate" />
              <span>入场票券</span>
            </div>

            <div
              v-for="(ticket, idx) in getTicketList(order)"
              :key="idx"
              class="ticket-card"
              :class="{ used: order.status === 'verified' }"
            >
              <!-- 票券顶部锯齿 -->
              <div class="ticket-perforation"></div>

              <div class="ticket-body">
                <div class="ticket-left">
                  <div class="ticket-num">第 {{ idx + 1 }} 张</div>
                  <div class="ticket-buyer" v-if="ticket.buyerName">
                    <van-icon name="user-o" />
                    <span>{{ ticket.buyerName }}</span>
                  </div>
                  <div class="ticket-idcard" v-if="ticket.buyerIdCard">
                    <van-icon name="idcard" />
                    <span>{{ maskIdCard(ticket.buyerIdCard) }}</span>
                  </div>
                  <div class="ticket-code-row">
                    <span class="ticket-code">{{ ticket.verifyCode }}</span>
                    <div class="copy-btn" @click="copyCode(ticket.verifyCode)">
                      <van-icon name="description" />
                    </div>
                  </div>
                </div>

                <div class="ticket-right">
                  <div class="qr-wrap" v-if="order.status === 'paid' && (ticket.verifyQrCodeUrl || order.verifyQrCodeUrl)">
                    <img :src="ticket.verifyQrCodeUrl || order.verifyQrCodeUrl" alt="核销二维码" />
                    <p class="qr-label">扫码入场</p>
                  </div>
                  <div class="used-stamp" v-else-if="order.status === 'verified'">
                    <span>已核销</span>
                  </div>
                </div>
              </div>

              <!-- 票券底部锯齿 -->
              <div class="ticket-perforation bottom"></div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="card-actions">
            <template v-if="order.status === 'unpaid'">
              <div class="action-btn ghost" @click="cancelOrder(order.orderId)">取消订单</div>
              <div class="action-btn primary" @click="toPay(order.orderId)">去支付</div>
            </template>
            <template v-if="order.status === 'paid'">
              <div class="action-btn ghost" @click="showToast('退票功能开发中')">申请退票</div>
            </template>
            <template v-if="['verified', 'refunded'].includes(order.status)">
              <div class="action-btn ghost" @click="viewDetail(order.orderId)">查看详情</div>
            </template>
          </div>
        </div>
      </div>
=======
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
>>>>>>> master
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
<<<<<<< HEAD
import { showToast, showConfirmDialog, showSuccessToast } from 'vant'
=======
import { showToast, showConfirmDialog, showFailToast } from 'vant'
>>>>>>> master
import {
  getUserComicConTickets,
  cancelComicConOrder,
  payComicConOrder
} from '@/api/mobile/comic-con'

const router = useRouter()
const loading = ref(false)
<<<<<<< HEAD
const activeTab = ref('all')
const orderList = ref([])
const defaultImg = 'https://www.helloimg.com/i/2026/01/27/69783066c0b56.png'

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'unpaid', label: '待支付' },
  { key: 'paid', label: '已支付' },
  { key: 'verified', label: '已核销' },
  { key: 'refunded', label: '已退票' }
]

const convertStatus = (code) => {
  const map = { 0: 'unpaid', 1: 'paid', 3: 'verified', 4: 'refunded' }
  return map[code] || 'unknown'
}

const calcTotal = (order) => {
  const price = Number(order.ticketPrice) || 0
  const count = Number(order.ticketCount) || 1
  return (price * count).toFixed(2)
}

const normalizedList = computed(() =>
  orderList.value.map(o => ({
    ...o,
    status: convertStatus(o.orderStatus),
    comicConBanner: o.comicConBanner || defaultImg,
    ticketVerifyList: o.ticketVerifyList || [],
    totalAmount: calcTotal(o)
  }))
)

const filteredList = computed(() =>
  activeTab.value === 'all'
    ? normalizedList.value
    : normalizedList.value.filter(o => o.status === activeTab.value)
)

const getTabCount = (key) => {
  if (key === 'all') return 0
  return normalizedList.value.filter(o => o.status === key).length
}

const getTicketList = (order) => {
  if (order.ticketVerifyList?.length > 0) return order.ticketVerifyList
  if (order.verifyCode) return [{ verifyCode: order.verifyCode, verifyQrCodeUrl: order.verifyQrCodeUrl }]
  return []
=======
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
>>>>>>> master
}

const getStatusText = (status) => {
  const map = { unpaid: '待支付', paid: '已支付', verified: '已核销', refunded: '已退票', unknown: '未知' }
  return map[status] || '未知'
}
<<<<<<< HEAD

const formatTime = (t) => t ? t.replace('T', ' ').substring(0, 16) : '—'

const maskIdCard = (id) => {
  if (!id || id.length < 14) return id
  return id.substring(0, 6) + '********' + id.substring(14)
}

const copyCode = (code) => {
  if (!code) return showToast('核销码为空')
  navigator.clipboard.writeText(code)
    .then(() => showSuccessToast('核销码已复制'))
    .catch(() => showToast('复制失败，请手动记录'))
}

const loadOrderData = async () => {
  loading.value = true
  try {
    const res = await getUserComicConTickets()
    if (res.code === 0) {
      orderList.value = res.data || []
    } else {
      showToast(res.msg || '加载失败')
    }
  } catch (e) {
    if (e.response?.status !== 401) showToast('网络错误，加载失败')
  } finally {
    loading.value = false
  }
}

const toPay = (orderId) => {
  router.push({ path: '/order/pay', query: { orderId } })
}

const cancelOrder = async (orderId) => {
  try {
    await showConfirmDialog({ title: '确认取消', message: '取消后无法恢复，是否确认？' })
    const res = await cancelComicConOrder(orderId)
    if (res.code === 0) {
      showSuccessToast('订单已取消')
      loadOrderData()
    } else {
      showToast(res.msg || '取消失败')
    }
  } catch (e) {
    if (e !== 'cancel' && e.response?.status !== 401) showToast('取消失败，请稍后重试')
  }
=======

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
>>>>>>> master
}

const viewDetail = (orderId) => {
  router.push({ path: `/order/detail/${orderId}` })
}

<<<<<<< HEAD
onMounted(loadOrderData)
=======
onMounted(() => loadOrderData())
>>>>>>> master
</script>

<style scoped>
.ticket-order-page {
  min-height: 100vh;
<<<<<<< HEAD
  background: #f5f7fa;
  padding-top: 100px;
  padding-bottom: 24px;
}

/* 头部 */
.page-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.header-content {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 16px;
}

.back-btn {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: rgba(0,0,0,0.05);
  font-size: 18px; color: #333; cursor: pointer;
}

.header-title {
  flex: 1; text-align: center;
  font-size: 17px; font-weight: 700; color: #1a1a1a;
}

/* Tab */
.tab-bar {
  display: flex;
  padding: 0 8px 8px;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}
.tab-bar::-webkit-scrollbar { display: none; }

.tab-item {
  position: relative;
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-item.active {
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  color: #fff;
  font-weight: 600;
}

.tab-dot {
  position: absolute;
  top: -2px; right: -2px;
  background: #ff2442;
  color: #fff;
  font-size: 10px;
  min-width: 16px; height: 16px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  padding: 0 3px;
  border: 2px solid #fff;
}

.tab-item.active .tab-dot {
  background: rgba(255,255,255,0.9);
  color: #ff2442;
  border-color: transparent;
}

/* 内容区 */
.page-body { padding: 12px 16px; }

/* 骨架屏 */
.skeleton-list { display: flex; flex-direction: column; gap: 12px; }
.skeleton-card { background: #fff; border-radius: 16px; overflow: hidden; padding: 16px; }
.sk-header { height: 16px; border-radius: 8px; margin-bottom: 16px; }
.sk-body { display: flex; gap: 12px; }
.sk-img { width: 80px; height: 80px; border-radius: 12px; flex-shrink: 0; }
.sk-info { flex: 1; display: flex; flex-direction: column; gap: 8px; padding-top: 4px; }
.sk-line { height: 12px; border-radius: 6px; }
.shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 空状态 */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 80px 20px;
}
.empty-icon { font-size: 72px; margin-bottom: 16px; }
.empty-title { font-size: 16px; font-weight: 600; color: #333; margin: 0 0 8px; }
.empty-desc { font-size: 13px; color: #999; margin: 0 0 24px; }
.empty-btn {
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  color: #fff; padding: 10px 32px;
  border-radius: 24px; font-size: 14px; font-weight: 600; cursor: pointer;
}

/* 订单列表 */
.order-list { display: flex; flex-direction: column; gap: 12px; }

/* 订单卡片 */
.order-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid #f5f5f5;
}

.order-no {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #999;
  font-family: monospace;
}

.status-badge {
  font-size: 12px; font-weight: 600;
  padding: 3px 10px; border-radius: 12px;
}
.status-badge.unpaid { background: #fff7e6; color: #d46b08; }
.status-badge.paid { background: #e6f7ff; color: #0958d9; }
.status-badge.verified { background: #f6ffed; color: #389e0d; }
.status-badge.refunded { background: #f5f5f5; color: #8c8c8c; }
.status-badge.unknown { background: #f5f5f5; color: #999; }

/* 漫展信息行 */
.event-row {
  display: flex; gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
}

.event-img {
  position: relative;
  width: 90px; height: 90px;
  border-radius: 12px; overflow: hidden;
  flex-shrink: 0; background: #f5f5f5;
=======
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
>>>>>>> master
}
.event-img img { width: 100%; height: 100%; object-fit: cover; }
.event-img-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.2);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s;
  color: #fff; font-size: 20px;
}
.event-row:active .event-img-overlay { opacity: 1; }

<<<<<<< HEAD
.event-info { flex: 1; min-width: 0; }
.event-name {
  font-size: 15px; font-weight: 700; color: #1a1a1a;
  margin: 0 0 8px; line-height: 1.4;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.event-meta {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: #888; margin-bottom: 4px;
}
.event-price {
  margin-top: 8px;
}
.price-unit {
  font-size: 11px; color: #bbb;
  display: block; margin-bottom: 2px;
}
.price-total-row {
  display: flex; align-items: baseline; gap: 2px;
}
.price-label {
  font-size: 11px; color: #999; margin-right: 4px;
}
.price-sym { font-size: 12px; color: #ff2442; font-weight: 600; }
.price-val { font-size: 18px; color: #ff2442; font-weight: 700; }

/* 倒计时提示 */
.countdown-bar {
  display: flex; align-items: center; gap: 6px;
  margin: 0 16px 12px;
  padding: 8px 12px;
  background: #fff7e6;
  border-radius: 8px;
  font-size: 12px; color: #d46b08;
}

/* 票券区域 */
.tickets-section { padding: 0 16px 4px; }
.tickets-title {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600; color: #666;
  margin-bottom: 10px;
}

/* 票券卡片 */
.ticket-card {
  background: linear-gradient(135deg, #fff9f9 0%, #fff5f5 100%);
  border: 1px solid rgba(255,36,66,0.12);
  border-radius: 12px;
=======
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
>>>>>>> master
  margin-bottom: 10px;
  overflow: hidden;
  position: relative;
}
.ticket-card.used {
  background: #f8f8f8;
  border-color: #e8e8e8;
  opacity: 0.8;
}
<<<<<<< HEAD

/* 锯齿效果 */
.ticket-perforation {
  height: 10px;
  background: radial-gradient(circle at 50% 0%, #f5f7fa 5px, transparent 5px) 0 0 / 16px 10px repeat-x;
}
.ticket-perforation.bottom {
  background: radial-gradient(circle at 50% 100%, #f5f7fa 5px, transparent 5px) 0 0 / 16px 10px repeat-x;
}

.ticket-body {
  display: flex;
  padding: 12px 14px;
  gap: 12px;
}

.ticket-left { flex: 1; min-width: 0; }

.ticket-num {
  font-size: 11px; color: #ff2442; font-weight: 600;
  margin-bottom: 8px;
  background: rgba(255,36,66,0.08);
  display: inline-block; padding: 2px 8px; border-radius: 8px;
}

.ticket-buyer, .ticket-idcard {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: #555; margin-bottom: 4px;
}

.ticket-code-row {
  display: flex; align-items: center; gap: 8px;
  margin-top: 8px;
}
.ticket-code {
  font-size: 16px; font-weight: 700; color: #ff2442;
  letter-spacing: 2px; font-family: monospace;
}
.copy-btn {
  width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,36,66,0.1);
  border-radius: 6px; color: #ff2442; font-size: 14px; cursor: pointer;
}
.copy-btn:active { background: rgba(255,36,66,0.2); }

.ticket-right {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  flex-shrink: 0;
}

.qr-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.qr-wrap img {
  width: 80px; height: 80px;
  border-radius: 8px;
  border: 2px solid rgba(255,36,66,0.15);
}
.qr-label { font-size: 10px; color: #999; }

.used-stamp {
  width: 64px; height: 64px;
  border-radius: 50%;
  border: 3px solid #bbb;
  display: flex; align-items: center; justify-content: center;
  color: #bbb; font-size: 13px; font-weight: 700;
  transform: rotate(-15deg);
}

/* 操作按钮 */
.card-actions {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #f5f5f5;
}

.action-btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 13px; font-weight: 600;
  cursor: pointer; transition: opacity 0.2s;
}
.action-btn:active { opacity: 0.8; }
.action-btn.ghost {
  border: 1px solid #ddd; color: #666; background: #fff;
}
.action-btn.primary {
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  color: #fff; border: none;
=======
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
>>>>>>> master
}
</style>
