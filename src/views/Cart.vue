<template>
  <div class="cart-page">
    <!-- 顶部导航 - 玻璃拟态 -->
    <div class="cart-header" :class="{ 'header-scrolled': isScrolled }">
      <div class="header-content">
        <div class="header-left" @click="$router.push('/')">
          <div class="back-btn">
            <van-icon name="arrow-left" />
          </div>
        </div>
        <div class="header-title">
          <span>购物车</span>
          <span class="header-count" v-if="cartStore.cartList.length > 0">
            ({{ cartStore.cartList.length }})
          </span>
        </div>
        <div class="header-right">
          <div class="manage-btn" @click="toggleManage">
            {{ isManaging ? '完成' : '管理' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 - 二次元风格 -->
    <div v-if="!cartStore.cartList.length" class="empty-state">
      <div class="empty-illustration">
        <div class="cart-icon">
          <van-icon name="shopping-cart-o" />
        </div>
        <div class="floating-items">
          <span class="item float-1">手办</span>
          <span class="item float-2">周边</span>
          <span class="item float-3">模型</span>
        </div>
      </div>
      <h3 class="empty-title">购物车还是空的~</h3>
      <p class="empty-desc">快去挑选心仪的二次元好物吧</p>
      <div class="empty-actions">
        <div class="action-btn primary" @click="$router.push('/')">
          <van-icon name="fire-o" />
          <span>去逛逛</span>
        </div>
        <div class="action-btn" @click="$router.push('/category')">
          <van-icon name="apps-o" />
          <span>分类</span>
        </div>
      </div>
    </div>

    <!-- 购物车列表 -->
    <div v-else class="cart-container">
      <!-- 店铺分组 -->
      <div class="shop-group">
        <div class="shop-header">
          <van-checkbox v-model="allSelectedProxy" class="shop-checkbox">
            <div class="shop-info">
              <div class="shop-icon">
                <van-icon name="shop-o" />
              </div>
              <span class="shop-name">Anime Shop 旗舰店</span>
              <van-icon name="arrow" class="shop-arrow" />
            </div>
          </van-checkbox>
          <div class="shop-coupon" v-if="!isManaging">
            <span class="coupon-tag">领券</span>
          </div>
        </div>

        <!-- 商品列表 -->
        <div class="goods-list">
          <div 
            v-for="item in cartStore.cartList" 
            :key="item.id"
            class="goods-item"
            :class="{ 'selected': item.checked }"
          >
            <div class="item-main">
              <van-checkbox 
                v-model="item.checked"
                class="item-checkbox"
                @change="(checked) => handleSingleCheck(item.id, checked)"
              />
              
              <div class="item-content" @click="goDetail(item.goodsId)">
                <div class="item-image">
                  <img :src="item.goodsImage || defaultImage" @error="handleImgError" />
                  <div class="item-tag" v-if="item.tag">{{ item.tag }}</div>
                </div>
                
                <div class="item-info">
                  <h4 class="item-title">{{ item.goodsName }}</h4>
                  <div class="item-spec" v-if="item.spec">
                    <span>{{ item.spec }}</span>
                  </div>
                  <div class="item-meta">
                    <div class="item-price">
                      <span class="price-symbol">¥</span>
                      <span class="price-value">{{ formatPrice(item.price) }}</span>
                    </div>
                    <div class="item-stock" v-if="item.stock < 10">
                      仅剩{{ item.stock }}件
                    </div>
                  </div>
                </div>
              </div>

              <!-- 数量控制 -->
              <div class="item-actions" v-if="!isManaging">
                <div class="quantity-control">
                  <button 
                    class="qty-btn minus"
                    :disabled="item.num <= 1"
                    @click="changeNum(item, -1)"
                  >
                    <van-icon name="minus" />
                  </button>
                  <input 
                    type="number" 
                    v-model.number="item.num"
                    class="qty-input"
                    @blur="validateNum(item)"
                    @keyup.enter="validateNum(item)"
                  />
                  <button 
                    class="qty-btn plus"
                    :disabled="item.num >= (item.stock || 99)"
                    @click="changeNum(item, 1)"
                  >
                    <van-icon name="plus" />
                  </button>
                </div>
              </div>

              <!-- 管理模式：删除按钮 -->
              <div class="item-delete" v-else @click="handleDelete(item.id)">
                <van-icon name="delete-o" />
                <span>删除</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部安全区域 -->
      <div class="safe-area"></div>
    </div>

    <!-- 底部结算栏 - 悬浮玻璃效果 -->
    <div class="settlement-bar" v-if="cartStore.cartList.length">
      <div class="bar-content">
        <div class="bar-left">
          <van-checkbox v-model="allSelectedProxy" class="total-checkbox">
            <span class="check-label">
              全选
              <span class="check-count" v-if="cartStore.selectedCartIds.size > 0">
                ({{ cartStore.selectedCartIds.size }})
              </span>
            </span>
          </van-checkbox>
          <div class="total-info" v-if="!isManaging">
            <div class="total-label">
              合计：<span class="total-symbol">¥</span>
            </div>
            <div class="total-price">{{ formatTotal(cartStore.totalPrice) }}</div>
            <div class="total-tip" v-if="cartStore.selectedCartIds.size > 0">
              已优惠¥0.00
            </div>
          </div>
        </div>
        <div class="bar-right">
          <div 
            class="submit-btn" 
            :class="{ 'disabled': cartStore.selectedCartIds.size === 0, 'danger': isManaging }"
            @click="handleSubmit"
          >
            <span v-if="!isManaging">
              去结算
              <span class="btn-count" v-if="cartStore.selectedCartIds.size > 0">
                ({{ cartStore.selectedCartIds.size }})
              </span>
            </span>
            <span v-else>删除</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <van-dialog
      v-model:show="showDeleteDialog"
      title="确认删除"
      show-cancel-button
      show-confirm-button
      confirm-button-text="确定"
      cancel-button-text="取消"
      confirm-button-color="#ffffff"
      @confirm="confirmDelete"
      @cancel="showDeleteDialog = false"
      >
      <p class="delete-tip">确定要删除这{{ selectedToDelete.length }}件商品吗？</p>
      </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast,closeToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

// 状态
const isManaging = ref(false)
const isScrolled = ref(false)
const showDeleteDialog = ref(false)
const selectedToDelete = ref([])
const defaultImage = ''

// 初始化
onMounted(() => {
  initCart()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const initCart = async () => {
  if (!userStore.id) {
    showToast('请先登录')
    router.push('/login')
    return
  }
  
  showToast({ message: '加载中...', duration: 0, forbidClick: true })
  try {
    await cartStore.loadCart(userStore.id)
  } finally {
    closeToast()
  }
}

// 滚动监听
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

// 全选代理
const allSelectedProxy = computed({
  get: () => cartStore.isAllSelected,
  set: (val) => cartStore.toggleAllSelect(val)
})

// 切换管理模式
const toggleManage = () => {
  isManaging.value = !isManaging.value
  // 退出管理时取消所有选中
  if (!isManaging.value) {
    cartStore.cartList.forEach(item => {
      if (!cartStore.selectedCartIds.has(item.id)) {
        item.checked = false
      }
    })
  }
}

// 数量修改
const changeNum = async (item, delta) => {
  const newNum = item.num + delta
  if (newNum < 1 || newNum > (item.stock || 99)) return
  
  item.num = newNum
  try {
    await cartStore.changeNum(item.id, newNum)
  } catch (err) {
    showFailToast('修改失败')
  }
}

const validateNum = async (item) => {
  let num = parseInt(item.num) || 1
  num = Math.max(1, Math.min(num, item.stock || 99))
  item.num = num
  await cartStore.changeNum(item.id, num)
}

// 单选处理
const handleSingleCheck = (cartId, checked) => {
  cartStore.toggleSelect(Number(cartId), checked)
}

// 删除处理
const handleDelete = (id) => {
  if (isManaging.value) {
    selectedToDelete.value = [id]
    showDeleteDialog.value = true
  } else {
    // 普通模式：直接删除
    doDelete([id])
  }
}

const confirmDelete = () => {
  doDelete(selectedToDelete.value)
}

const doDelete = async (ids) => {
  try {
    for (const id of ids) {
      await cartStore.removeCart(id)
    }
    showSuccessToast('删除成功')
    selectedToDelete.value = []
  } catch (err) {
    showFailToast('删除失败')
  }
}

// 跳转详情
const goDetail = (goodsId) => {
  router.push(`/goods/${goodsId}`)
}

// 结算
const handleSubmit = () => {
  if (isManaging.value) {
    // 管理模式下删除选中的
    const ids = cartStore.cartList
      .filter(item => item.checked)
      .map(item => item.id)
    if (ids.length === 0) {
      showToast('请选择要删除的商品')
      return
    }
    selectedToDelete.value = ids
    showDeleteDialog.value = true
    return
  }

  const submitData = cartStore.getSubmitData
  if (submitData.length === 0) {
    showToast('请选择要结算的商品')
    return
  }

  const formatSubmitData = submitData.map(item => ({
    productId: item.goodsId,
    productName: item.goodsName, 
    productImg: item.goodsImage,
    productPrice: item.price,
    quantity: item.num,
    skuId: item.skuId,
    ticketType: item.ticketType,
    isTicket: item.isTicket || 0
  }))
  
  router.push({
    path: '/order/confirm',
    query: {
      orderData: encodeURIComponent(JSON.stringify(formatSubmitData))
    }
  })
}

// 格式化
const formatPrice = (price) => {
  return Number(price).toFixed(2)
}

const formatTotal = (total) => {
  return Number(total).toFixed(2)
}

// 图片错误
const handleImgError = (e) => {
  e.target.src = defaultImage
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}

/* 顶部导航 - 玻璃拟态 */
.cart-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 8px 12px;
  transition: all 0.3s ease;
}

.cart-header.header-scrolled {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  max-width: 600px;
  margin: 0 auto;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  color: #333;
  font-size: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:active {
  transform: scale(0.95);
}

.header-scrolled .back-btn {
  background: #f5f5f5;
  box-shadow: none;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 700;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.header-count {
  font-size: 14px;
  color: #999;
  font-weight: 500;
}

.manage-btn {
  padding: 6px 14px;
  background: rgba(255, 36, 66, 0.1);
  color: #ff2442;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.manage-btn:active {
  background: rgba(255, 36, 66, 0.2);
  transform: scale(0.95);
}

/* 空状态 - 二次元风格 */
.empty-state {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  padding-top: 80px;
}

.empty-illustration {
  position: relative;
  width: 200px;
  height: 200px;
  margin-bottom: 30px;
}

.cart-icon {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 20px 40px rgba(255, 36, 66, 0.3);
  animation: float 3s ease-in-out infinite;
}

.cart-icon .van-icon {
  font-size: 60px;
  color: #fff;
}

.floating-items {
  position: absolute;
  inset: 0;
}

.floating-items .item {
  position: absolute;
  padding: 6px 12px;
  background: #fff;
  border-radius: 20px;
  font-size: 12px;
  color: #666;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-weight: 500;
}

.item.float-1 {
  top: 20px;
  left: 0;
  animation: float 2.5s ease-in-out infinite;
}

.item.float-2 {
  top: 60px;
  right: 0;
  animation: float 3s ease-in-out infinite 0.5s;
}

.item.float-3 {
  bottom: 40px;
  left: 10px;
  animation: float 2.8s ease-in-out infinite 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.empty-desc {
  font-size: 14px;
  color: #999;
  margin-bottom: 30px;
}

.empty-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 24px;
  background: #fff;
  border-radius: 24px;
  font-size: 14px;
  color: #666;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn.primary {
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(255, 36, 66, 0.3);
}

.action-btn:active {
  transform: scale(0.95);
}

/* 购物车容器 */
.cart-container {
  padding-top: 70px;
  padding-left: 12px;
  padding-right: 12px;
}

/* 店铺分组 */
.shop-group {
  background: #fff;
  border-radius: 16px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.shop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
}

.shop-checkbox {
  flex: 1;
}

.shop-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

.shop-icon {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

.shop-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.shop-arrow {
  font-size: 12px;
  color: #ccc;
}

.shop-coupon {
  padding: 4px 10px;
  background: #fff5f5;
  color: #ff2442;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.coupon-tag {
  position: relative;
}

/* 商品列表 */
.goods-list {
  padding: 8px 0;
}

.goods-item {
  padding: 12px 16px;
  transition: all 0.3s;
  border-bottom: 1px solid #f8f8f8;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-item.selected {
  background: #fff8f8;
}

.item-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-checkbox {
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  display: flex;
  gap: 12px;
  cursor: pointer;
}

.item-image {
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f8f9fa;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-tag {
  position: absolute;
  top: 4px;
  left: 4px;
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-spec {
  margin-top: 4px;
}

.item-spec span {
  display: inline-block;
  padding: 2px 8px;
  background: #f5f7fa;
  color: #999;
  font-size: 12px;
  border-radius: 4px;
}

.item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.item-price {
  display: flex;
  align-items: baseline;
  color: #ff2442;
  font-weight: 700;
}

.price-symbol {
  font-size: 12px;
  margin-right: 2px;
}

.price-value {
  font-size: 18px;
}

.item-stock {
  font-size: 12px;
  color: #ff2442;
  font-weight: 500;
}

/* 数量控制 */
.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.quantity-control {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 16px;
  padding: 4px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: none;
  border-radius: 50%;
  color: #333;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.qty-btn:active:not(:disabled) {
  transform: scale(0.9);
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-input {
  width: 40px;
  height: 28px;
  text-align: center;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  outline: none;
}

/* 删除按钮 */
.item-delete {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 90px;
  background: #ffebee;
  border-radius: 8px;
  color: #ff2442;
  gap: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.item-delete .van-icon {
  font-size: 24px;
}

.item-delete span {
  font-size: 12px;
}

.item-delete:active {
  background: #ffcdd2;
  transform: scale(0.95);
}

/* 安全区域 */
.safe-area {
  height: 100px;
}

/* 底部结算栏 - 悬浮玻璃效果 */
.settlement-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  z-index: 99;
}

.bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 600px;
  margin: 0 auto;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.total-checkbox {
  display: flex;
  align-items: center;
}

.check-label {
  font-size: 14px;
  color: #333;
  margin-left: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.check-count {
  font-size: 12px;
  color: #999;
}

.total-info {
  display: flex;
  flex-direction: column;
}

.total-label {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: baseline;
}

.total-symbol {
  color: #ff2442;
  font-size: 14px;
  font-weight: 600;
  margin-left: 4px;
}

.total-price {
  font-size: 20px;
  color: #ff2442;
  font-weight: 700;
  line-height: 1.2;
}

.total-tip {
  font-size: 11px;
  color: #999;
}

.bar-right {
  display: flex;
  align-items: center;
}

.submit-btn {
  min-width: 110px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: #fff;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(255, 36, 66, 0.3);
  padding: 0 20px;
}

.submit-btn.disabled {
  background: #ccc;
  box-shadow: none;
  cursor: not-allowed;
}

.submit-btn.danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
}

.submit-btn:active:not(.disabled) {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(255, 36, 66, 0.2);
}

.btn-count {
  font-size: 13px;
  margin-left: 4px;
  opacity: 0.9;
}

/* 删除弹窗 */
.delete-tip {
  text-align: center;
  padding: 20px;
  font-size: 14px;
  color: #666;
}

/* Vant 样式覆盖 */
:deep(.van-checkbox__icon) {
  font-size: 18px;
}

:deep(.van-checkbox__icon--checked .van-icon) {
  background: #ff2442;
  border-color: #ff2442;
}

:deep(.van-dialog__confirm) {
  background: #ff2442;
}

:deep(.van-dialog__confirm):active {
  opacity: 0.9;
}
</style>