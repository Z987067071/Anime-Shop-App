<template>
  <div class="order-page">
    <!-- 顶部导航 -->
    <div class="nav-bar">
      <van-icon name="arrow-left" class="back-btn" @click="onClickLeft" />
      <span class="nav-title">我的订单</span>
    </div>

    <!-- 状态标签栏 -->
    <van-tabs
      v-model:active="activeTab"
      class="order-tabs"
      sticky
      offset-top="48"
      @change="onTabChange"
      :line-width="20"
      :line-height="3"
    >
      <van-tab title="全部" name=""></van-tab>
      <van-tab title="待付款" :name="0"></van-tab>
      <van-tab title="待发货" :name="1"></van-tab>
      <van-tab title="待收货" :name="2"></van-tab>
      <van-tab title="已完成" :name="3"></van-tab>
      <van-tab title="已取消" :name="4"></van-tab>
      <van-tab title="售后中" :name="5"></van-tab>
    </van-tabs>

    <!-- 订单列表 -->
    <div class="order-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多订单了"
          @load="onLoad"
          :immediate-check="false"
        >
          <!-- 空状态 -->
          <div class="empty-wrap" v-if="orderList.length === 0 && !loading && !refreshing">
            <div class="empty-icon">🛍️</div>
            <p class="empty-text">暂无相关订单</p>
            <van-button round type="primary" size="small" class="empty-btn" @click="goShopping">
              去逛逛
            </van-button>
          </div>

          <!-- 订单卡片 -->
          <div class="order-card" v-for="order in orderList" :key="order.id">

            <!-- 卡片头部：订单号 + 状态 -->
            <div class="card-top">
              <div class="order-no-row">
                <van-icon name="orders-o" size="13" color="#aaa" />
                <span class="order-no">{{ order.orderNo }}</span>
              </div>
              <div class="status-badge" :class="'status-' + order.orderStatus">
                {{ getStatusText(order.orderStatus) }}
              </div>
            </div>

            <!-- 商品列表 -->
            <div class="goods-list">
              <div
                class="goods-item"
                v-for="(item, index) in order.orderItems"
                :key="item.id"
                :class="{ 'has-border': index !== order.orderItems.length - 1 }"
              >
                <div class="goods-img-wrap">
                  <van-image
                    :src="item.productImg"
                    width="72"
                    height="72"
                    radius="10"
                    fit="cover"
                    class="goods-img"
                  >
                    <template v-slot:error>
                      <div class="img-error"><van-icon name="photo-o" size="22" /></div>
                    </template>
                  </van-image>
                </div>
                <div class="goods-info">
                  <div class="goods-name">{{ item.productName }}</div>
                  <div class="goods-meta">
                    <span class="goods-price">
                      <span class="price-sym">¥</span>{{ item.productPrice }}
                    </span>
                    <span class="goods-qty">×{{ item.quantity }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 金额行 -->
            <div class="amount-row">
              <span class="amount-label">共 {{ getTotalQuantity(order.orderItems) }} 件</span>
              <span class="amount-total">
                实付 <span class="amount-sym">¥</span><span class="amount-num">{{ order.payAmount }}</span>
              </span>
            </div>

            <!-- 操作按钮 -->
            <div class="action-row">
              <!-- 待付款 -->
              <template v-if="order.orderStatus === 0 && !order.timeout">
                <van-button size="small" round plain class="action-btn" @click="cancelOrder(order.id)">
                  取消订单
                </van-button>
                <van-button size="small" round type="primary" class="action-btn primary" @click="goToPay(order.id)">
                  继续支付
                </van-button>
              </template>
              <!-- 待发货/待收货 -->
              <template v-if="order.orderStatus === 1 || order.orderStatus === 2">
                <van-button size="small" round plain class="action-btn" @click="viewLogistics(order.id)">
                  查看物流
                </van-button>
                <van-button
                  v-if="order.orderStatus === 2"
                  size="small" round type="primary" class="action-btn primary"
                  @click="confirmReceive(order.id)"
                >
                  确认收货
                </van-button>
              </template>
              <!-- 已完成 -->
              <template v-if="order.orderStatus === 3">
                <van-button size="small" round plain class="action-btn" @click="buyAgain(order.id)">
                  再次购买
                </van-button>
                <van-button size="small" round plain type="warning" class="action-btn" @click="applyRefund(order.id)">
                  申请售后
                </van-button>
              </template>
              <!-- 已取消 -->
              <template v-if="order.orderStatus === 4">
                <van-button size="small" round plain class="action-btn" @click="deleteOrder(order.id)">
                  删除订单
                </van-button>
                <van-button size="small" round type="warning" class="action-btn" @click="addToCart(order.id)">
                  重新购买
                </van-button>
              </template>
              <!-- 售后中 -->
              <template v-if="order.orderStatus === 5">
                <van-button size="small" round plain class="action-btn" @click="viewRefundProgress(order.id)">
                  售后进度
                </van-button>
                <van-button size="small" round plain type="primary" class="action-btn" @click="cancelRefund(order.id)">
                  取消售后
                </van-button>
              </template>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
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
import {
  showToast, showFailToast, showConfirmDialog,
  showLoadingToast, showSuccessToast, closeToast
} from 'vant'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()

const activeTab = ref('')
const orderList = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const isFirstLoad = ref(true)
let page = 1
const pageSize = 10

const onClickLeft = () => router.push('/mine')

const onTabChange = () => {
  if (isFirstLoad.value) { isFirstLoad.value = false; return }
  page = 1
  orderList.value = []
  finished.value = false
  loading.value = false
  refreshing.value = false
  getOrderList(true)
  if (activeTab.value === null) {
    router.replace({ query: {} })
  } else {
    router.replace({ query: { status: activeTab.value } })
  }
}

const getOrderList = async (isRefresh = false) => {
  if (!userStore.id) { showToast('请先登录'); router.push('/login'); return }
  if (loading.value) return
  try {
    loading.value = true
    const params = { userId: userStore.id, page, pageSize }
    if (activeTab.value !== null && activeTab.value !== undefined) params.status = activeTab.value
    const res = await getUserOrders(params)
    if (res.code === 0) {
      const list = res.data?.list || res.data || []
      const total = res.data?.total || 0
      if (isRefresh) { orderList.value = list; page = 1; finished.value = false }
      else orderList.value.push(...list)
      if (orderList.value.length >= total || list.length < pageSize) finished.value = true
    } else {
      showFailToast('获取订单失败：' + res.msg)
      finished.value = true
    }
  } catch {
    showFailToast('网络错误，请重试')
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
    isFirstLoad.value = false
  }
}

const onRefresh = () => { finished.value = false; page = 1; getOrderList(true) }
const onLoad = () => {
  const _isFirst = ref(true)
  if (_isFirst.value) { _isFirst.value = false; loading.value = false; return }
  if (finished.value) { loading.value = false; return }
  page++
  getOrderList()
}

const getStatusText = (status) => {
  const map = { 0: '待付款', 1: '待发货', 2: '待收货', 3: '已完成', 4: '已取消', 5: '售后中' }
  return map[status] || '未知'
}

const getTotalQuantity = (items) => {
  if (!items) return 0
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

const goToPay = (orderId) => router.push({ path: '/order/pay', query: { orderId } })

const cancelOrder = async (orderId) => {
  showConfirmDialog({ title: '提示', message: '确定要取消该订单吗？' }).then(async () => {
    const res = await apiCancelOrder(orderId)
    if (res.code === 0) { showSuccessToast('订单已取消'); onRefresh() }
    else showFailToast(res.msg)
  }).catch(() => {})
}

const viewLogistics = () => showToast('货物正在路上，功能待开发')

const confirmReceive = async (orderId) => {
  showConfirmDialog({ title: '确认收货', message: '确认已收到商品？' }).then(async () => {
    try {
      const res = await updateOrderStatus({ id: orderId, orderStatus: 3 })
      if (res.code === 0) { showSuccessToast('确认收货成功'); onRefresh() }
      else showFailToast('确认收货失败：' + res.msg)
    } catch { showFailToast('网络异常') }
  })
}

const buyAgain = async (orderId) => {
  if (!userStore.id || !userStore.token) { showToast('请先登录'); return router.push('/login') }
  const loadingToast = showLoadingToast({ message: '正在加入购物车...', forbidClick: true })
  try {
    const orderRes = await getOrderDetail(orderId)
    if (orderRes.code !== 0 || !orderRes.data) throw new Error('获取订单详情失败')
    const orderItems = orderRes.data.orderItems || []
    if (!orderItems.length) throw new Error('订单中无商品')
    let successCount = 0, failMsg = ''
    for (const item of orderItems) {
      const productRes = await getMobileProductDetail(item.productId)
      if (productRes.code !== 0 || !productRes.data) { failMsg += `【${item.productName}】不存在；`; continue }
      const product = productRes.data.product
      if (product.status !== 1) { failMsg += `【${item.productName}】已下架；`; continue }
      await cartStore.addToCart(item.productId, item.quantity)
      successCount++
    }
    if (successCount > 0) {
      showSuccessToast(`已加入购物车${failMsg ? '，部分失败' : ''}`)
    } else throw new Error(failMsg || '加入失败')
  } catch (e) {
    showFailToast(e.message || '加入购物车失败')
  } finally { closeToast(loadingToast) }
}

const applyRefund = () => showToast('售后功能待开发')
const deleteOrder = (orderId) => {
  showConfirmDialog({ title: '提示', message: '确定删除该订单？删除后不可恢复' }).then(async () => {
    try {
      const res = await apiDeleteOrder(orderId)
      if (res.code === 0) { showSuccessToast('删除成功'); onRefresh() }
      else showFailToast('删除失败：' + res.msg)
    } catch { showFailToast('网络异常') }
  })
}
const addToCart = () => showToast('已将商品重新加入购物车')
const goShopping = () => router.push('/')
const viewRefundProgress = () => showToast('售后进度查询待开发')
const cancelRefund = (orderId) => {
  showConfirmDialog({ title: '提示', message: '确定取消售后申请吗？' }).then(() => {
    showSuccessToast('已取消售后申请'); onRefresh()
  })
}

onMounted(() => {
  const status = route.query.status
  if (status !== undefined && status !== null && status !== '') {
    const n = parseInt(status)
    activeTab.value = (!isNaN(n) && n >= 0 && n <= 5) ? n : null
  } else {
    activeTab.value = null
  }
  isFirstLoad.value = true
  getOrderList(true)
})
</script>

<style scoped>
.order-page {
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
:deep(.van-tabs__line) { background: #ff2442; }
:deep(.van-tab--active) { color: #ff2442; font-weight: 600; }

/* ===== 列表区 ===== */
.order-list { padding: 12px; }

/* ===== 空状态 ===== */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0 40px;
}
.empty-icon { font-size: 56px; margin-bottom: 12px; }
.empty-text { font-size: 14px; color: #999; margin-bottom: 20px; }
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

/* 卡片顶部 */
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid #f5f5f5;
}
.order-no-row {
  display: flex;
  align-items: center;
  gap: 5px;
}
.order-no {
  font-size: 12px;
  color: #aaa;
  font-family: monospace;
  letter-spacing: 0.3px;
}

/* 状态徽章 */
.status-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
}
.status-badge.status-0 { background: #fff7e6; color: #fa8c16; }
.status-badge.status-1 { background: #e6f4ff; color: #1677ff; }
.status-badge.status-2 { background: #f0f5ff; color: #2f54eb; }
.status-badge.status-3 { background: #f6ffed; color: #52c41a; }
.status-badge.status-4 { background: #f5f5f5; color: #999; }
.status-badge.status-5 { background: #fff2e8; color: #fa541c; }

/* 商品列表 */
.goods-list { padding: 4px 14px; }
.goods-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
}
.goods-item.has-border { border-bottom: 1px solid #f8f8f8; }
.goods-img-wrap { flex-shrink: 0; }
.img-error {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #ccc;
  border-radius: 10px;
}
.goods-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
}
.goods-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.goods-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.goods-price { color: #ff2442; font-weight: 600; font-size: 15px; }
.price-sym { font-size: 12px; }
.goods-qty { font-size: 13px; color: #aaa; }

/* 金额行 */
.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-top: 1px dashed #f0f0f0;
  border-bottom: 1px solid #f5f5f5;
}
.amount-label { font-size: 12px; color: #aaa; }
.amount-total { font-size: 13px; color: #333; }
.amount-sym { font-size: 12px; color: #ff2442; font-weight: 600; }
.amount-num { font-size: 18px; font-weight: 700; color: #ff2442; }

/* 操作按钮 */
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
