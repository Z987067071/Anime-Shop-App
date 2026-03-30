<template>
  <div class="order-page">
    <!-- 头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="back-btn" @click="router.push('/mine')">
          <van-icon name="arrow-left" />
        </div>
        <div class="header-title">我的订单</div>
        <div style="width:36px"></div>
      </div>
      <!-- Tab -->
      <div class="tab-bar">
        <div
          v-for="tab in tabs" :key="tab.name"
          class="tab-item"
          :class="{ active: activeTab === tab.name }"
          @click="switchTab(tab.name)"
        >{{ tab.label }}</div>
      </div>
    </div>

    <!-- 列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="— 没有更多订单了 —"
        @load="onLoad"
        :immediate-check="false"
        class="order-list"
      >
        <!-- 骨架屏 -->
        <template v-if="loading && !orderList.length">
          <div class="skeleton-card" v-for="i in 3" :key="i">
            <div class="sk-header shimmer"></div>
            <div class="sk-body">
              <div class="sk-img shimmer"></div>
              <div class="sk-info">
                <div class="sk-line shimmer" style="width:70%"></div>
                <div class="sk-line shimmer" style="width:45%"></div>
                <div class="sk-line shimmer" style="width:30%"></div>
              </div>
            </div>
          </div>
        </template>

        <!-- 订单卡片 -->
        <div class="order-card" v-for="order in orderList" :key="order.id">
          <!-- 卡片头 -->
          <div class="card-header">
            <div class="order-no">
              <van-icon name="orders-o" />
              <span>{{ order.orderNo }}</span>
            </div>
            <div class="status-badge" :class="getStatusClass(order)">
              {{ getStatusText(order) }}
            </div>
          </div>

          <!-- 商品列表 -->
          <div class="goods-list">
            <div
              class="goods-item"
              v-for="(item, idx) in order.orderItems" :key="item.id"
              :class="{ 'has-border': idx < order.orderItems.length - 1 }"
            >
              <div class="goods-img-wrap">
                <img :src="item.productImg" :alt="item.productName" @error="e => e.target.src=''" />
                <!-- 票务标签 -->
                <div class="ticket-badge" v-if="order.isTicket === 1">票</div>
              </div>
              <div class="goods-info">
                <div class="goods-name">{{ item.productName }}</div>
                <!-- 票务：显示票种和购票人 -->
                <template v-if="order.isTicket === 1">
                  <div class="goods-tag" v-if="item.ticketType">{{ item.ticketType }}</div>
                  <div class="buyer-info" v-if="item.buyerName">
                    <van-icon name="user-o" />
                    <span>{{ item.buyerName }}</span>
                    <span class="idcard" v-if="item.buyerIdCard">{{ item.buyerIdCard }}</span>
                  </div>
                </template>
                <div class="goods-bottom">
                  <div class="goods-price">
                    <span class="sym">¥</span>
                    <span class="num">{{ item.productPrice }}</span>
                  </div>
                  <span class="goods-qty">×{{ item.quantity }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 金额汇总 -->
          <div class="order-amount">
            <span class="amount-count">共 {{ getTotalQty(order.orderItems) }} 件</span>
            <div class="amount-right">
              <span class="amount-label">实付</span>
              <span class="amount-sym">¥</span>
              <span class="amount-val">{{ order.payAmount }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="card-actions">
            <!-- 待付款 -->
            <template v-if="order.orderStatus === 0 && !order.timeout">
              <div class="action-btn ghost" @click="cancelOrder(order.id)">取消订单</div>
              <div class="action-btn primary" @click="goToPay(order.id)">继续支付</div>
            </template>
            <!-- 超时待付款 -->
            <template v-if="order.orderStatus === 0 && order.timeout">
              <div class="action-btn ghost" @click="deleteOrder(order.id)">删除订单</div>
            </template>
            <!-- 待发货（普通商品） -->
            <template v-if="order.orderStatus === 1 && order.isTicket !== 1">
              <div class="action-btn ghost" @click="viewLogistics(order.id)">查看物流</div>
            </template>
            <!-- 待核销（票务） -->
            <template v-if="order.orderStatus === 1 && order.isTicket === 1">
              <div class="action-btn ghost" @click="router.push('/comic-con/my-order')">查看票券</div>
            </template>
            <!-- 待收货 -->
            <template v-if="order.orderStatus === 2">
              <div class="action-btn ghost" @click="viewLogistics(order.id)">查看物流</div>
              <div class="action-btn primary" @click="confirmReceive(order.id)">确认收货</div>
            </template>
            <!-- 已完成 -->
            <template v-if="order.orderStatus === 3">
              <div class="action-btn ghost" @click="buyAgain(order.id)">再次购买</div>
              <div class="action-btn ghost" @click="applyRefund(order.id)">申请售后</div>
            </template>
            <!-- 已取消 -->
            <template v-if="order.orderStatus === 4">
              <div class="action-btn ghost" @click="deleteOrder(order.id)">删除订单</div>
            </template>
            <!-- 售后中 -->
            <template v-if="order.orderStatus === 5">
              <div class="action-btn ghost" @click="viewRefundProgress(order.id)">售后进度</div>
              <div class="action-btn ghost" @click="cancelRefund(order.id)">取消售后</div>
            </template>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 空状态 -->
    <div class="empty-state" v-if="!loading && !orderList.length">
      <div class="empty-icon">📦</div>
      <p class="empty-title">暂无订单</p>
      <div class="empty-btn" @click="router.push('/')">去逛逛</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { getUserOrders, cancelOrder as apiCancelOrder, getOrderDetail } from '@/api/mobile/order'
import { updateOrderStatus, deleteOrder as apiDeleteOrder } from '@/api/order'
import { getMobileProductDetail } from '@/api/mobile/product'
import { showToast, showFailToast, showConfirmDialog, showLoadingToast, showSuccessToast, closeToast } from 'vant'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()

const tabs = [
  { name: '', label: '全部' },
  { name: 0, label: '待付款' },
  { name: 1, label: '待发货' },
  { name: 2, label: '待收货' },
  { name: 3, label: '已完成' },
  { name: 4, label: '已取消' },
  { name: 5, label: '售后中' }
]

const activeTab = ref('')
const orderList = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const isFirstLoad = ref(true)
let page = 1
const pageSize = 10

const getStatusText = (order) => {
  if (order.isTicket === 1) {
    const ticketMap = { 0: '待付款', 1: '待核销', 3: '已核销', 4: '已取消' }
    return ticketMap[order.orderStatus] || '未知'
  }
  const map = { 0: '待付款', 1: '待发货', 2: '待收货', 3: '已完成', 4: '已取消', 5: '售后中' }
  return map[order.orderStatus] || '未知'
}

const getStatusClass = (order) => {
  if (order.orderStatus === 0 && order.timeout) return 'status-timeout'
  const map = { 0: 'status-warning', 1: 'status-primary', 2: 'status-success', 3: 'status-done', 4: 'status-cancel', 5: 'status-refund' }
  return map[order.orderStatus] || 'status-cancel'
}

const getTotalQty = (items) => (items || []).reduce((s, i) => s + i.quantity, 0)

const switchTab = (name) => {
  if (activeTab.value === name) return
  activeTab.value = name
  page = 1
  orderList.value = []
  finished.value = false
  getOrderList(true)
  router.replace({ query: name !== '' ? { status: name } : {} })
}

const getOrderList = async (isRefresh = false) => {
  if (!userStore.id) { router.push('/login'); return }
  if (loading.value) return
  loading.value = true
  try {
    const params = { userId: userStore.id, page, pageSize }
    if (activeTab.value !== '' && activeTab.value !== null) params.status = activeTab.value
    const res = await getUserOrders(params)
    if (res.code === 0) {
      const list = res.data?.list || res.data || []
      const total = res.data?.total || 0
      if (isRefresh) { orderList.value = list; page = 1; finished.value = false }
      else orderList.value.push(...list)
      if (orderList.value.length >= total || list.length < pageSize) finished.value = true
    } else {
      showFailToast(res.msg || '获取订单失败')
      finished.value = true
    }
  } catch {
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
    isFirstLoad.value = false
  }
}

const onRefresh = () => { page = 1; getOrderList(true) }
const onLoad = () => { if (finished.value) { loading.value = false; return }; page++; getOrderList() }

const goToPay = (id) => router.push({ path: '/order/pay', query: { orderId: id } })

const cancelOrder = (id) => {
  showConfirmDialog({ title: '提示', message: '确定要取消该订单吗？' }).then(async () => {
    const res = await apiCancelOrder(id)
    res.code === 0 ? (showSuccessToast('订单已取消'), onRefresh()) : showFailToast(res.msg)
  }).catch(() => {})
}

const viewLogistics = () => showToast('物流功能开发中')

const confirmReceive = (id) => {
  showConfirmDialog({ title: '确认收货', message: '确认已收到商品？' }).then(async () => {
    try {
      const res = await updateOrderStatus({ id, orderStatus: 3 })
      res.code === 0 ? (showSuccessToast('确认收货成功'), onRefresh()) : showFailToast(res.msg)
    } catch { showFailToast('网络异常') }
  })
}

const buyAgain = async (orderId) => {
  if (!userStore.token) return router.push('/login')
  const toast = showLoadingToast({ message: '加入购物车中...', forbidClick: true })
  try {
    const orderRes = await getOrderDetail(orderId)
    if (orderRes.code !== 0) throw new Error('获取订单失败')
    const items = orderRes.data?.orderItems || []
    let ok = 0, fail = ''
    for (const item of items) {
      const pRes = await getMobileProductDetail(item.productId)
      if (pRes.code !== 0 || pRes.data?.product?.status !== 1) { fail += `【${item.productName}】已下架；`; continue }
      await cartStore.addToCart(item.productId, item.quantity)
      ok++
    }
    ok > 0 ? showSuccessToast(`已加入${ok}件`) : showFailToast(fail || '加入失败')
  } catch (e) {
    showFailToast(e.message || '操作失败')
  } finally {
    closeToast(toast)
  }
}

const applyRefund = () => showToast('售后功能开发中')
const viewRefundProgress = () => showToast('售后进度查询开发中')
const cancelRefund = (id) => {
  showConfirmDialog({ title: '提示', message: '确定取消售后申请吗？' }).then(() => {
    showSuccessToast('已取消售后')
    onRefresh()
  }).catch(() => {})
}

const deleteOrder = (id) => {
  showConfirmDialog({ title: '提示', message: '确定删除该订单吗？' }).then(async () => {
    try {
      const res = await apiDeleteOrder(id)
      res.code === 0 ? (showSuccessToast('删除成功'), onRefresh()) : showFailToast(res.msg)
    } catch { showFailToast('删除失败') }
  }).catch(() => {})
}

onMounted(() => {
  const s = route.query.status
  if (s !== undefined && s !== '') {
    const n = parseInt(s)
    activeTab.value = isNaN(n) ? '' : n
  }
  isFirstLoad.value = true
  getOrderList(true)
})
</script>

<style scoped>
.order-page {
  min-height: 100vh;
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
  display: flex; align-items: center;
  height: 56px; padding: 0 16px;
}

.back-btn {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%; background: rgba(0,0,0,0.05);
  font-size: 18px; color: #333; cursor: pointer;
}

.header-title {
  flex: 1; text-align: center;
  font-size: 17px; font-weight: 700; color: #1a1a1a;
}

/* Tab */
.tab-bar {
  display: flex; padding: 0 8px 10px; gap: 4px;
  overflow-x: auto; scrollbar-width: none;
}
.tab-bar::-webkit-scrollbar { display: none; }

.tab-item {
  flex-shrink: 0; padding: 5px 14px;
  border-radius: 20px; font-size: 13px; color: #666;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.tab-item.active {
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  color: #fff; font-weight: 600;
}

/* 骨架屏 */
.order-list { padding: 12px; }
.skeleton-card {
  background: #fff; border-radius: 16px;
  padding: 16px; margin-bottom: 12px;
}
.sk-header { height: 14px; border-radius: 7px; margin-bottom: 14px; }
.sk-body { display: flex; gap: 12px; }
.sk-img { width: 80px; height: 80px; border-radius: 10px; flex-shrink: 0; }
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

/* 订单卡片 */
.order-card {
  background: #fff; border-radius: 16px;
  margin-bottom: 12px; overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px 10px;
  border-bottom: 1px solid #f5f5f5;
}

.order-no {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: #aaa; font-family: monospace;
}

/* 状态徽章 */
.status-badge {
  font-size: 12px; font-weight: 600;
  padding: 3px 10px; border-radius: 12px;
}
.status-warning  { background: #fff7e6; color: #d46b08; }
.status-primary  { background: #e6f7ff; color: #0958d9; }
.status-success  { background: #f6ffed; color: #389e0d; }
.status-done     { background: #f9f0ff; color: #722ed1; }
.status-cancel   { background: #f5f5f5; color: #8c8c8c; }
.status-refund   { background: #fff1f0; color: #cf1322; }
.status-timeout  { background: #f5f5f5; color: #bbb; }

/* 商品列表 */
.goods-list { padding: 0 16px; }

.goods-item {
  display: flex; gap: 12px;
  padding: 12px 0;
}
.goods-item.has-border { border-bottom: 1px solid #f8f8f8; }

.goods-img-wrap {
  position: relative;
  width: 80px; height: 80px;
  border-radius: 10px; overflow: hidden;
  flex-shrink: 0; background: #f5f5f5;
}
.goods-img-wrap img { width: 100%; height: 100%; object-fit: cover; }

.ticket-badge {
  position: absolute; top: 4px; left: 4px;
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  color: #fff; font-size: 10px; font-weight: 700;
  padding: 1px 5px; border-radius: 6px;
}

.goods-info {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; justify-content: space-between;
}

.goods-name {
  font-size: 14px; font-weight: 500; color: #1a1a1a;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-tag {
  display: inline-block;
  font-size: 11px; color: #ff2442;
  background: rgba(255,36,66,0.08);
  padding: 1px 7px; border-radius: 8px;
  margin-top: 3px;
  width: 40px;
  text-align: center;
}

.buyer-info {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; color: #888; margin-top: 3px;
}
.idcard { color: #bbb; }

.goods-bottom {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 6px;
}
.goods-price { display: flex; align-items: baseline; color: #ff2442; }
.sym { font-size: 11px; font-weight: 600; }
.num { font-size: 16px; font-weight: 700; }
.goods-qty { font-size: 13px; color: #bbb; }

/* 金额汇总 */
.order-amount {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px;
  border-top: 1px dashed #f0f0f0;
}
.amount-count { font-size: 12px; color: #bbb; }
.amount-right { display: flex; align-items: baseline; gap: 2px; }
.amount-label { font-size: 12px; color: #999; margin-right: 4px; }
.amount-sym { font-size: 12px; color: #ff2442; font-weight: 600; }
.amount-val { font-size: 18px; color: #ff2442; font-weight: 700; }

/* 操作按钮 */
.card-actions {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 10px 16px 14px;
  border-top: 1px solid #f5f5f5;
}
.action-btn {
  padding: 7px 18px; border-radius: 20px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: opacity 0.2s;
}
.action-btn:active { opacity: 0.75; }
.action-btn.ghost { border: 1px solid #ddd; color: #666; background: #fff; }
.action-btn.primary {
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  color: #fff; border: none;
}

/* 空状态 */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 80px 20px;
}
.empty-icon { font-size: 72px; margin-bottom: 16px; }
.empty-title { font-size: 16px; color: #999; margin: 0 0 24px; }
.empty-btn {
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  color: #fff; padding: 10px 32px;
  border-radius: 24px; font-size: 14px; font-weight: 600; cursor: pointer;
}

/* vant 覆盖 */
:deep(.van-list__finished-text) {
  color: #bbb; font-size: 12px;
}
</style>
