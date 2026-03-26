<template>
  <div class="order-page">
    <van-nav-bar
      title="我的订单"
      left-arrow
      fixed
      placeholder
      @click-left="onClickLeft"
    />
      <van-tabs 
        v-model:active="activeTab" 
        class="order-tabs"
        sticky
        offset-top="46"
        @change="onTabChange"
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
          <!-- 订单卡片 -->
          <div 
            class="order-card" 
            v-for="order in orderList" 
            :key="order.id"
          >
            <!-- 订单头部 -->
            <div class="order-header">
              <div class="order-no">
                <van-icon name="orders-o" class="order-icon" />
                <span class="order-text">订单编号：{{ order.orderNo }}</span>
              </div>
              <van-tag 
                :type="getStatusType(order.orderStatus)" 
                round
                class="status-tag"
              >
                {{ getStatusText(order.orderStatus) }}
              </van-tag>
            </div>

            <!-- 商品列表 -->
            <div class="goods-list">
              <div 
                class="goods-item" 
                v-for="(item, index) in order.orderItems" 
                :key="item.id"
                :class="{ 'has-border': index !== order.orderItems.length - 1 }"
              >
                <van-image
                  :src="item.productImg"
                  width="80"
                  height="80"
                  radius="8"
                  fit="cover"
                  class="goods-img"
                  :alt="item.productName"
                >
                  <template v-slot:error>
                    <div class="image-error">
                      <van-icon name="photo-o" size="24" />
                    </div>
                  </template>
                </van-image>
                
                <div class="goods-info">
                  <div class="goods-name van-multi-ellipsis--l2">
                    {{ item.productName }}
                  </div>
                  <div class="goods-meta">
                    <span class="goods-price">
                      <span class="price-symbol">¥</span>
                      <span class="price-num">{{ item.productPrice }}</span>
                    </span>
                    <span class="goods-quantity">×{{ item.quantity }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 订单金额 -->
            <div class="order-amount">
              <span class="amount-label">共 {{ getTotalQuantity(order.orderItems) }} 件商品</span>
              <span class="amount-total">
                实付：<span class="price-symbol">¥</span>
                <span class="price-num">{{ order.payAmount }}</span>
              </span>
            </div>

            <!-- 操作按钮区 -->
            <div class="order-actions">
              <!-- 未支付状态 -->
              <template v-if="order.orderStatus === 0 && !order.timeout">
                <van-button 
                  size="small" 
                  round 
                  plain 
                  type="danger"
                  class="action-btn"
                  @click="cancelOrder(order.id)"
                >
                  取消订单
                </van-button>
                <van-button 
                  size="small" 
                  round 
                  type="primary"
                  class="action-btn primary-btn"
                  @click="goToPay(order.id)"
                >
                  继续支付
                </van-button>
              </template>

              <!-- 已支付/已发货状态 -->
              <template v-if="order.orderStatus === 1 || order.orderStatus === 2">
                <van-button 
                  size="small" 
                  round 
                  plain
                  class="action-btn"
                  @click="viewLogistics(order.id)"
                >
                  查看物流
                </van-button>
                <van-button 
                  v-if="order.orderStatus === 2"
                  size="small" 
                  round 
                  type="primary"
                  class="action-btn primary-btn"
                  @click="confirmReceive(order.id)"
                >
                  确认收货
                </van-button>
              </template>

              <!-- 已完成状态 -->
              <template v-if="order.orderStatus === 3">
                <van-button 
                  size="small" 
                  round 
                  plain
                  class="action-btn"
                  @click="buyAgain(order.id)"
                >
                  再次购买
                </van-button>
                <van-button 
                  size="small" 
                  round 
                  plain
                  type="primary"
                  class="action-btn"
                  @click="applyRefund(order.id)"
                >
                  申请售后
                </van-button>
              </template>

              <!-- 已取消状态 -->
              <template v-if="order.orderStatus === 4">
                <van-button 
                  size="small" 
                  round 
                  plain
                  class="action-btn"
                  @click="deleteOrder(order.id)"
                >
                  删除订单
                </van-button>
                <van-button 
                  size="small" 
                  round 
                  type="warning"
                  class="action-btn"
                  @click="addToCart(order.id)"
                >
                  重新购买
                </van-button>
              </template>
              <template v-if="order.orderStatus === 5">
                <van-button 
                  size="small" 
                  round 
                  plain
                  class="action-btn"
                  @click="viewRefundProgress(order.id)"
                >
                  查看售后进度
                </van-button>
                <van-button 
                  size="small" 
                  round 
                  plain
                  type="primary"
                  class="action-btn"
                  @click="cancelRefund(order.id)"
                >
                  取消售后
                </van-button>
              </template>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>

      <!-- 空状态 -->
      <van-empty
        v-if="orderList.length === 0 && !loading && !refreshing"
        description="暂无订单"
        image="https://img.yzcdn.cn/vant/empty-image-default.png"
      >
        <van-button round type="primary" class="bottom-button" @click="goShopping">
          去逛逛
        </van-button>
      </van-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter,useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { getUserOrders, cancelOrder as apiCancelOrder,getOrderDetail } from '@/api/mobile/order'
import { updateOrderStatus,deleteOrder as apiDeleteOrder } from '@/api/order'
import { getMobileProductDetail } from '@/api/mobile/product'
import { 
  showToast, 
  showFailToast, 
  showConfirmDialog,
  showLoadingToast,
  showSuccessToast,
  closeToast
} from 'vant'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()

// 列表状态
const activeTab = ref('')
const orderList = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const isFirstLoad = ref(true)
let page = 1
const pageSize = 10

// 返回上一页
const onClickLeft = () => {
  router.push('/mine')
}

const onTabChange = () => {
  if (isFirstLoad.value) {
    isFirstLoad.value = false
    return
  }
  // 重置分页和列表状态
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

// 获取订单列表
const getOrderList = async (isRefresh = false) => {
  if (!userStore.id) {
    showToast('请先登录后查看订单！')
    router.push('/login')
    return
  }

  if (loading.value) return

  try {
    loading.value = true
    
    const params = {
      userId: userStore.id,
      page: page,
      pageSize: pageSize
    }
    
    if (activeTab.value !== null && activeTab.value !== undefined) {
      params.status = activeTab.value
    }
    const res = await getUserOrders(params)
    
    if (res.code === 0) {
      const list = res.data?.list || res.data || []
      const total = res.data?.total || 0
      
      if (isRefresh) {
        orderList.value = list
        page = 1
        finished.value = false
      } else {
        orderList.value.push(...list)
      }
      
      if (orderList.value.length >= total || list.length < pageSize) {
        finished.value = true
      }
    } else {
      showFailToast('获取订单失败：' + res.msg)
      finished.value = true
    }
  } catch (error) {
    showFailToast('网络错误，请重试')
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
    isFirstLoad.value = false
  }
}


const onRefresh = () => {
  finished.value = false
  page = 1
  getOrderList(true)
}

const onLoad = () => {
  const isFirstLoad = ref(true)
  if (isFirstLoad.value) {
    isFirstLoad.value = false
    loading.value = false
    return
  }
  
  if (finished.value) {
    loading.value = false
    return
  }
  
  page++
  getOrderList()
}

// 订单状态文字
const getStatusText = (status) => {
  const statusMap = {
    0: '待付款',
    1: '待发货',
    2: '待收货',
    3: '已完成',
    4: '已取消',
    5: '售后中'
  }
  return statusMap[status] || '未知状态'
}

const getStatusType = (status) => {
  const typeMap = {
    0: 'warning',   // 待付款 - 橙色
    1: 'primary',   // 待发货 - 蓝色
    2: 'success',   // 待收货 - 绿色
    3: 'danger',    // 已完成 - 红色
    4: 'default',   // 已取消 - 灰色
    5: 'info'       // 售后中 - 浅蓝
  }
  return typeMap[status] || 'default'
}

// 计算商品总数量
const getTotalQuantity = (items) => {
  if (!items) return 0
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

// 跳转到支付页
const goToPay = (orderId) => {
  if (!userStore.id) {
    showToast('请先登录！')
    router.push('/login')
    return
  }
  router.push({
    path: '/order/pay',
    query: { orderId }
  })
}

// 取消订单
const cancelOrder = async (orderId) => {
  showConfirmDialog({
    title: '提示',
    message: '确定要取消该订单吗？',
  }).then(async () => {
    const res = await apiCancelOrder(orderId)
    if (res.code === 0) {
      showSuccessToast('订单已取消')
      onRefresh()
    } else {
      showFailToast(res.msg)
    }
  }).catch(() => {
    // 取消操作
  })
}

// 查看物流
const viewLogistics = (orderId) => {
  showToast('货物正在路上了,功能未来会开发')
  // router.push(`/order/logistics/${orderId}`)
}

// 确认收货
const confirmReceive = async (orderId) => {
  showConfirmDialog({
    title: '确认收货',
    message: '确认已收到商品？',
  }).then(async () => {
    try {
      const res = await updateOrderStatus({
        id: orderId,
        orderStatus: 3
      })
      if (res.code === 0) {
        showSuccessToast('确认收货成功')
        onRefresh()
      } else {
        showFailToast('确认收货失败：' + res.msg)
      }
    } catch (error) {
      showFailToast('网络异常，确认收货失败')
    }
  })
}

// 再次购买
const buyAgain = async (orderId) => {
  // 1. 登录校验
  if (!userStore.id || !userStore.token) {
    showToast('请先登录后再购买')
    return router.push('/login')
  }

  // 2. 显示加载中
  const loadingToast = showLoadingToast({
    message: '正在加入购物车...',
    forbidClick: true
  })

  try {
    // 3. 获取订单详情
    const orderRes = await getOrderDetail(orderId)
    if (orderRes.code !== 0 || !orderRes.data) {
      throw new Error('获取订单详情失败')
    }
    const order = orderRes.data
    const orderItems = order.orderItems || []

    if (orderItems.length === 0) {
      throw new Error('订单中无商品')
    }

    // 4. 遍历订单项，逐个添加到购物车
    let successCount = 0
    let failMsg = ''
    for (const item of orderItems) {
      const productId = item.productId
      const buyNum = item.quantity

      const productRes = await getMobileProductDetail(productId)
      if (productRes.code !== 0 || !productRes.data) {
        failMsg += `商品【${item.productName}】不存在；`
        continue
      }
      const product = productRes.data.product

      if (product.status !== 1) {
        failMsg += `商品【${item.productName}】已下架；`
        continue
      }

      if (product.stock < buyNum) {
        failMsg += `商品【${item.productName}】库存不足（剩余${product.stock}件）；`
        continue
      }

      await cartStore.addToCart(productId, buyNum)
      successCount++
    }

    if (successCount > 0) {
      let tipMsg = `成功将${successCount}件商品加入购物车`
      if (failMsg) {
        tipMsg += `，部分商品失败：${failMsg}`
        showToast(tipMsg)
      } else {
        showSuccessToast(tipMsg)
        // router.push('/cart')
      }
    } else {
      throw new Error(failMsg || '加入购物车失败')
    }
  } catch (error) {
    console.error('再次购买失败：', error)
    showFailToast(error.message || '加入购物车失败，请稍后重试')
  } finally {
    closeToast(loadingToast)
  }
}

const applyRefund = (orderId) => {
  // router.push(`/order/refund/${orderId}`)
  showToast('没有售后噢,期待未来开发')
}

// 删除订单
const deleteOrder = (orderId) => {
  showConfirmDialog({
    title: '提示',
    message: '确定要删除该订单吗？删除后不可恢复',
  }).then(async() => {
    try {
      const res = await apiDeleteOrder(orderId)
      if (res.code === 0) {
        showSuccessToast('删除成功')
        onRefresh()
      } else {
        showFailToast('删除失败：' + res.msg)
      }
    } catch (error) {
      showFailToast('网络异常，删除失败')
    }
  })
}

// 重新加入购物车
const addToCart = (orderId) => {
  showToast('已将商品重新加入购物车')
}

// 去购物
const goShopping = () => {
  router.push('/home')
}

const viewRefundProgress = (orderId) => {
  showToast('售后进度查询功能待开发')
  // router.push(`/order/refund/progress/${orderId}`)
}

// 取消售后
const cancelRefund = (orderId) => {
  showConfirmDialog({
    title: '提示',
    message: '确定要取消售后申请吗？',
  }).then(() => {
    showSuccessToast('已取消售后申请')
    onRefresh()
  })
}

// 页面挂载
onMounted(() => {
  const status = route.query.status
  if (status !== undefined && status !== null && status !== '') {
    const statusNum = parseInt(status)
    if (!isNaN(statusNum) && statusNum >= 0 && statusNum <= 5) {
      activeTab.value = statusNum
    } else {
      activeTab.value = null
    }
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
  background-color: #f5f5f5;
  padding-bottom: 20px;
}

.order-list {
  padding: 12px;
}

/* 订单卡片 */
.order-card {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.order-no {
  display: flex;
  align-items: center;
  gap: 6px;
}

.order-icon {
  color: #969799;
  font-size: 16px;
}

.order-text {
  font-size: 13px;
  color: #666;
  font-family: 'Courier New', monospace;
}

.status-tag {
  font-size: 12px;
  padding: 2px 8px;
}

/* 商品列表 */
.goods-list {
  margin-bottom: 12px;
}

.goods-item {
  display: flex;
  padding: 12px 0;
  gap: 12px;
}

.goods-item.has-border {
  border-bottom: 1px solid #f5f5f5;
}

.goods-img {
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #969799;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.goods-name {
  font-size: 14px;
  color: #323233;
  line-height: 1.5;
  font-weight: 500;
}

.goods-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.goods-price {
  color: #ff4444;
  font-weight: 600;
}

.price-symbol {
  font-size: 12px;
}

.price-num {
  font-size: 16px;
}

.goods-quantity {
  font-size: 13px;
  color: #969799;
}

/* 订单金额 */
.order-amount {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px dashed #ebedf0;
  margin-bottom: 12px;
}

.amount-label {
  font-size: 12px;
  color: #969799;
}

.amount-total {
  font-size: 14px;
  color: #323233;
}

.amount-total .price-num {
  font-size: 18px;
  font-weight: 600;
  color: #ff4444;
}

/* 操作按钮区 */
.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.action-btn {
  min-width: 80px;
  height: 32px;
  font-size: 13px;
}

.primary-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff4444 100%);
  border: none;
}

/* 空状态 */
.bottom-button {
  width: 160px;
  height: 40px;
  margin-top: 16px;
}

/* 适配 iPhone 底部安全区 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .order-page {
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
  }
}
</style>