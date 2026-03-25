<template>
  <div class="goods-detail-page">
    <div class="nav-header" :class="{ 'nav-scrolled': isScrolled }">
      <div class="nav-content">
        <div class="nav-left" @click="$router.back()">
          <div class="nav-btn">
            <van-icon name="arrow-left" />
          </div>
        </div>
        <div class="nav-title" :class="{ 'show': isScrolled }">
          {{ product?.productName || '商品详情' }}
        </div>
        <div class="nav-right">
          <div class="nav-btn" @click="shareProduct">
            <van-icon name="share-o" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-animation">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
    </div>

    <div v-else class="content-wrap">
      <div v-if="product" class="content">
        <div class="gallery-section">
          <van-swipe 
            class="goods-swipe" 
            :autoplay="0" 
            indicator-color="#ff2442"
            @change="onSwipeChange"
          >
            <van-swipe-item v-for="(imgItem, index) in productImageList" :key="imgItem.id || index">
              <div class="swipe-item-wrapper" @click="previewImage(index)">
                <img :src="imgItem.imageUrl || imgItem" alt="商品图片" @error="handleImgError($event)" />
                <div class="img-badge" v-if="product.tag">{{ product.tag }}</div>
              </div>
            </van-swipe-item>
            <template #indicator="{ active, total }">
              <div class="custom-indicator">
                <span class="indicator-current">{{ active + 1 }}</span>
                <span class="indicator-split">/</span>
                <span class="indicator-total">{{ total }}</span>
              </div>
            </template>
          </van-swipe>
        </div>

        <div class="price-card">
          <div class="price-bg">
            <div class="price-pattern"></div>
          </div>
          <div class="price-content">
            <div class="price-main">
              <div class="price-symbol">¥</div>
              <div class="price-value">{{ formatPrice(isTicketProduct && selectedSku ? selectedSku.price : product.price) }}</div>
              <div class="price-decimal">{{ getDecimal(isTicketProduct && selectedSku ? selectedSku.price : product.price) }}</div>
            </div>
            <div class="price-meta" v-if="product.originalPrice">
              <span class="original-price">¥{{ product.originalPrice }}</span>
              <span class="discount-tag" v-if="getDiscount()">{{ getDiscount() }}折</span>
            </div>
          </div>
          <div class="sales-info">
            <span class="sales-count">已售 {{ product.sales || 0 }}+</span>
            <span class="stock-count" :class="{ 'low': product.remainStock < 10 }">
              库存{{ product.remainStock }}件
            </span>
          </div>
        </div>

        <div class="info-card">
          <h1 class="goods-name">{{ product.productName }}</h1>
          
          <div class="category-tags" v-if="product.firstCategoryName || product.categoryName">
            <span class="cat-tag primary" v-if="product.firstCategoryName">
              {{ product.firstCategoryName }}
            </span>
            <span class="cat-tag" v-if="product.categoryName">
              {{ product.categoryName }}
            </span>
          </div>

          <div class="comment-float-btn" @click="goToCommentPage">
            <van-icon name="comment-o" size="22" />
            <span class="comment-num" v-if="commentCount > 0">{{ commentCount }}</span>
          </div>

          <div class="like-float-btn" @click="toggleLike" :class="{ loading: likeLoading }">
            <van-icon :name="hasLiked ? 'like' : 'like-o'" :class="{ liked: hasLiked }" size="22" />
            <span class="like-num" v-if="likeCount > 0">{{ likeCount }}</span>
          </div>

          <p class="goods-intro" v-if="product.introduction">{{ product.introduction }}</p>

          <div class="service-tags">
            <div class="service-item">
              <van-icon name="passed" class="service-icon" />
              <span>正品保证</span>
            </div>
            <div class="service-item">
              <van-icon name="logistics" class="service-icon" />
              <span>顺丰包邮</span>
            </div>
            <div class="service-item">
              <van-icon name="shield-o" class="service-icon" />
              <span>七天退换</span>
            </div>
          </div>
        </div>

        <div class="specs-panel" @click="handleSpecPanelClick">
          <div class="panel-row">
            <span class="panel-label">已选</span>
            <span class="panel-value">{{ selectedSpec || '默认规格' }}，{{ currentNum }}件</span>
            <van-icon name="arrow" class="panel-arrow" />
          </div>
        </div>

        <div class="detail-section">
          <div class="section-header">
            <div class="header-line"></div>
            <div class="header-title">
              <van-icon name="photo-o" />
              <span>商品详情</span>
            </div>
            <div class="header-line"></div>
          </div>
          
          <div class="detail-content" v-if="product.detailContent" v-html="product.detailContent"></div>
          
          <div class="params-list" v-else>
            <div class="param-item">
              <span class="param-label">商品编号</span>
              <span class="param-value">{{ product.id }}</span>
            </div>
            <div class="param-item">
              <span class="param-label">商品类型</span>
              <span class="param-value">{{ product.firstCategoryName || '手办' }}</span>
            </div>
            <div class="param-item">
              <span class="param-label">商品分类</span>
              <span class="param-value">{{ product.categoryName || '动漫周边' }}</span>
            </div>
            <div class="param-item">
              <span class="param-label">上架时间</span>
              <span class="param-value">{{ formatTime(product.createTime) }}</span>
            </div>
          </div>
        </div>

        <div class="safe-area"></div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-illustration">
          <van-icon name="bag-o" />
        </div>
        <p class="empty-text">商品不存在或已下架</p>
        <van-button type="primary" round class="back-btn" @click="$router.push('/')">
          去逛逛
        </van-button>
      </div>
    </div>

    <div class="action-bar" v-if="product && !loading">
      <div class="action-content">
        <div class="action-left">
          <div class="action-icon" @click="goHome">
            <van-icon name="shop-o" />
            <span>店铺</span>
          </div>
          <div class="action-icon" @click="goCart">
            <van-icon name="shopping-cart-o" />
            <span>购物车</span>
            <div class="badge" v-if="cartStore.cartList.length > 0">{{ cartStore.cartList.length }}</div>
          </div>
          <div class="action-icon" @click="toggleCollect" :class="{ 'loading': collectLoading }">
            <van-icon :name="collected ? 'star' : 'star-o'" :class="{ 'active': collected }" />
            <span>{{ collected ? '已收藏' : '收藏' }}</span>
          </div>
        </div>
        <div class="action-right">
          <div 
            class="btn-cart" 
            :class="{ 'disabled': product.isTicket === 1 }"
            @click="product.isTicket === 1 ? showCartDisabledTip() : openAddCartDialog()"
          >
            <span>{{ product.isTicket === 1 ? '仅支持直购' : '加入购物车' }}</span>
          </div>
          <div class="btn-buy" @click="openBuyDialog">
            <span>立即购买</span>
          </div>
        </div>
      </div>
    </div>

    <van-popup
      v-model:show="showSkuPopup"
      position="bottom"
      round
      closeable
      class="sku-popup"
    >
      <div class="sku-header">
        <img :src="productImageList[0]?.imageUrl" class="sku-img" @error="handleImgError" />
        <div class="sku-info">
          <div class="sku-price">
            <span class="symbol">¥</span>
            <span class="amount">{{ isTicketProduct && selectedSku ? selectedSku.price : product?.price }}</span>
          </div>
          <div class="sku-stock">库存 {{ product?.remainStock }} 件</div>
          <div class="sku-selected">{{ selectedSpec || '请选择规格' }}</div>
        </div>
      </div>
      
      <div class="sku-body">
        <div class="sku-section" v-if="isTicketProduct">
          <div class="section-title">选择票种</div>
          <div class="sku-ticket-list">
            <div 
              class="ticket-item"
              v-for="sku in skuList"
              :key="sku.id"
              :class="{ 
                active: selectedSku?.id === sku.id,
                disabled: isTicketDisabled(sku)
              }"
              @click="selectTicketSku(sku)"
            >
              <span class="ticket-name">{{ sku.specValue }}</span>
              <span 
                class="ticket-price" 
                v-if="!isTicketDisabled(sku)"
              >
                ¥{{ sku.price }}
              </span>
              <span 
                class="ticket-sold-out" 
                v-else
              >
                {{ sku.status === 2 ? '售罄' : '下架' }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="sku-section">
          <div class="section-title">数量</div>
          <van-stepper 
            v-model="currentNum" 
            :min="1" 
            :max="product?.remainStock || 1"
            :disabled="product?.remainStock < 1"
          />
        </div>
        
        <div class="sku-tips" v-if="product?.remainStock < 10 && product?.remainStock > 0">
          <van-icon name="warning-o" />
          <span>库存紧张，欲购从速</span>
        </div>
      </div>
      
      <div class="sku-actions">
        <van-button 
          type="warning" 
          block 
          round 
          :disabled="product?.remainStock < 1 || (isTicketProduct && !selectedSku) || product.isTicket === 1"
          @click="confirmAddCart"
        >
          {{ product.isTicket === 1 ? '票务商品仅支持直购' : '加入购物车' }}
        </van-button>
        <van-button 
          type="danger" 
          block 
          round 
          :disabled="product?.remainStock < 1 || (isTicketProduct && !selectedSku)"
          @click="confirmBuy"
        >
          立即购买
        </van-button>
      </div>
    </van-popup>

    <van-image-preview v-model:show="showPreview" :images="previewImages" :start-position="previewIndex" />
    <TabBar />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TabBar from '@/components/TabBar.vue'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { getMobileProductDetail, checkProductStatus, collectProduct, likeProduct } from '@/api/mobile/product'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const loading = ref(true)
const product = ref(null)
const isScrolled = ref(false)
const collected = ref(false)
const collectLoading = ref(false)

const hasLiked = ref(false)
const likeCount = ref(0)
const likeLoading = ref(false)
const commentCount = ref(0)

const skuList = ref([])
const selectedSku = ref(null)
const isTicketProduct = computed(() => {
  return product.value?.isTicket === 1 && skuList.value.length > 0
})

const showSkuPopup = ref(false)
const currentNum = ref(1)

const showPreview = ref(false)
const previewIndex = ref(0)

// 商品图片列表
const productImageList = computed(() => {
  if (!product.value) return []
  let imgList = []
  if (product.value.imageList?.length > 0) {
    imgList = product.value.imageList.filter(item => item.imageUrl)
  }
  if (imgList.length === 0 && product.value.coverImg) {
    imgList.push({ imageUrl: product.value.coverImg })
  }
  if (imgList.length === 0) {
    imgList.push({ imageUrl: '' })
  }
  return imgList
})

// 预览图
const previewImages = computed(() => {
  return productImageList.value.map(item => item.imageUrl)
})

// 选中规格
const selectedSpec = computed(() => {
  if (isTicketProduct.value && selectedSku.value) {
    return selectedSku.value.specValue
  }
  return '默认规格'
})

// 价格格式化
const formatPrice = (price) => {
  if (!price) return '0'
  const parts = price.toString().split('.')
  return parts[0]
}
const getDecimal = (price) => {
  if (!price) return '.00'
  const parts = price.toString().split('.')
  return parts[1] ? '.' + parts[1] : '.00'
}
const getDiscount = () => {
  if (!product.value?.originalPrice || !product.value?.price) return null
  const basePrice = isTicketProduct.value && selectedSku.value ? selectedSku.value.price : product.value.price
  const discount = (basePrice / product.value.originalPrice * 10).toFixed(1)
  return discount < 10 ? discount : null
}

// 滚动监听
const handleScroll = () => {
  isScrolled.value = window.scrollY > 100
}

// 跳转到评论页
const goToCommentPage = () => {
  if (!product.value?.id) return
  router.push({
    path: '/goods/comment',
    query: { productId: product.value.id, productName: product.value.productName }
  })
}

// 点赞操作
const toggleLike = async () => {
  if (!checkLogin()) return
  if (likeLoading.value) return
  
  likeLoading.value = true
  try {
    const res = await likeProduct(product.value.id, !hasLiked.value)
    if (res.code === 0) {
      hasLiked.value = res.data.hasLiked
      likeCount.value = res.data.likeCount
      ElMessage.success(hasLiked.value ? '点赞成功' : '取消点赞成功')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    likeLoading.value = false
  }
}

// 加载商品详情（整合版，只发一次请求）
const loadProductDetail = async () => {
  const id = route.params.id
  if (!id) {
    loading.value = false
    ElMessage.error('商品ID不能为空')
    return
  }

  loading.value = true
  try {
    const res = await getMobileProductDetail(id)
    if (res.code === 0) {
      const data = res.data
      product.value = data.product
      commentCount.value = data.commentCount || 0
      hasLiked.value = data.likeInfo?.hasLiked || false
      likeCount.value = data.likeInfo?.likeCount || 0

      // ===================== 👇 新增：直接读取后端返回的收藏状态 =====================
      collected.value = data.isCollected || false

      // 处理SKU
      skuList.value = Array.isArray(data.product.skuList) 
        ? data.product.skuList.filter(s => s.id && s.specValue) 
        : []
      if (isTicketProduct.value) {
        selectedSku.value = skuList.value[0] || null
      }
      currentNum.value = 1
    } else {
      ElMessage.error(res.msg || '加载失败')
    }
  } catch (error) {
    ElMessage.error('网络异常')
  } finally {
    loading.value = false
  }
}

// 图片错误
const handleImgError = (e) => {
  e.target.src = ''
}

// 轮播切换
const onSwipeChange = (index) => {
  previewIndex.value = index
}
// 预览图片
const previewImage = (index) => {
  previewIndex.value = index
  showPreview.value = true
}

// 选择票种
const selectTicketSku = (sku) => {
  if (isTicketDisabled(sku)) return
  selectedSku.value = { ...sku }
}

const isTicketDisabled = (sku) => {
  // status=0 下架  status=2 售罄
  return sku.status === 0 || sku.status === 2
}

// 打开规格面板
const handleSpecPanelClick = () => {
  product.value.isTicket === 1 ? showCartDisabledTip() : openAddCartDialog()
}
const openAddCartDialog = () => {
  if (!checkLogin() || !checkStatus()) return
  showSkuPopup.value = true
}
const openBuyDialog = () => {
  if (!checkLogin() || !checkStatus()) return
  showSkuPopup.value = true
}
const showCartDisabledTip = () => {
  ElMessage.warning('漫展票务商品暂不支持加入购物车')
}

// 登录校验
const checkLogin = () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return false
  }
  return true
}

// 商品状态校验
const checkStatus = () => {
  if (product.value.status !== 1) {
    ElMessage.error('商品已下架')
    return false
  }
  if (product.value.remainStock < 1) {
    ElMessage.error('库存不足')
    return false
  }
  return true
}

// 加入购物车
const confirmAddCart = async () => {
  try {
    if (product.value.isTicket === 1) {
      showCartDisabledTip()
      showSkuPopup.value = false
      return
    }
    if (currentNum.value > product.value.remainStock) {
      ElMessage.error('库存不足')
      return
    }
    if (isTicketProduct.value && !selectedSku.value) {
      ElMessage.warning('请选择票种')
      return
    }

    const res = await checkProductStatus(product.value.id, selectedSku.value?.id)
    if (res.code !== 0) {
      ElMessage.error('商品已失效')
      loadProductDetail()
      return
    }

    await cartStore.addToCart(
      product.value.id, currentNum.value,
      selectedSku.value?.id || '', selectedSku.value?.specValue || '',
      isTicketProduct.value ? selectedSku.value.price : product.value.price,
      product.value.productName, productImageList.value[0]?.imageUrl,
      product.value.isTicket
    )
    
    showSkuPopup.value = false
    ElMessage.success('加入购物车成功')
  } catch (error) {
    ElMessage.error('加入失败')
  }
}

// 立即购买
const confirmBuy = async () => {
  if (currentNum.value > product.value.remainStock) {
    ElMessage.error('库存不足')
    return
  }
  if (isTicketProduct.value && !selectedSku.value) {
    ElMessage.warning('请选择票种')
    return
  }

  try {
    const res = await checkProductStatus(product.value.id, selectedSku.value?.id)
    if (res.code !== 0) {
      ElMessage.error('商品已失效')
      loadProductDetail()
      return
    }
  } catch (err) {
    ElMessage.error('校验失败')
    return
  }

  const orderData = {
    productId: product.value.id,
    productName: product.value.productName,
    productImg: productImageList.value[0]?.imageUrl,
    productPrice: isTicketProduct.value ? selectedSku.value.price : product.value.price,
    skuId: selectedSku.value?.id || '',
    skuName: selectedSku.value?.specValue || '',
    ticketType: selectedSku.value?.specValue || '',
    quantity: currentNum.value,
    totalAmount: ((isTicketProduct.value ? selectedSku.value.price : product.value.price) * currentNum.value).toFixed(2),
    isTicket: product.value.isTicket
  }

  showSkuPopup.value = false
  router.push({
    path: '/order/confirm',
    query: { orderData: encodeURIComponent(JSON.stringify(orderData)) }
  })
}

// 页面跳转
const goHome = () => router.push('/')
const goCart = () => router.push('/cart')

// 收藏切换
const toggleCollect = async () => {
  if (!checkLogin()) return
  collectLoading.value = true
  try {
    const res = await collectProduct({
      productId: product.value.id,
      isCollect: collected.value ? 0 : 1
    })
    if (res.code === 0) {
      collected.value = !collected.value
      ElMessage.success(collected.value ? '收藏成功' : '取消收藏成功')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    collectLoading.value = false
  }
}

// 分享
const shareProduct = () => ElMessage.info('分享功能开发中')

// 时间格式化
const formatTime = (timeStr) => timeStr ? timeStr.substring(0, 10) : '暂无'

onMounted(() => {
  if (userStore.id) cartStore.loadCart(userStore.id)
  loadProductDetail()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.goods-detail-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 80px;
}

.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 8px 12px;
  transition: all 0.3s ease;
}

.nav-header.nav-scrolled {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  max-width: 600px;
  margin: 0 auto;
}

.nav-left, .nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-btn {
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

.nav-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 1);
}

.nav-scrolled .nav-btn {
  background: #f5f5f5;
  box-shadow: none;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 10px;
}

.nav-title.show {
  opacity: 1;
  transform: translateY(0);
}

.loading-state {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-animation {
  text-align: center;
  color: #999;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 12px;
  border: 3px solid #f3f3f3;
  border-top-color: #ff2442;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.gallery-section {
  position: relative;
  background: #fff;
}

.goods-swipe {
  height: 375px;
  background: #f8f8f8;
}

.swipe-item-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.swipe-item-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
}

.img-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(255, 36, 66, 0.3);
}

.custom-indicator {
  position: absolute;
  right: 12px;
  bottom: 12px;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.indicator-current {
  font-weight: 600;
  font-size: 14px;
}

.indicator-split {
  opacity: 0.6;
}

.price-card {
  position: relative;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  margin: -20px 12px 12px;
  border-radius: 16px;
  padding: 16px;
  color: #fff;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(255, 36, 66, 0.25);
}

.price-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.price-pattern {
  position: absolute;
  right: -20px;
  top: -20px;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.price-content {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.price-main {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 20px;
  font-weight: 600;
  margin-right: 2px;
}

.price-value {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
}

.price-decimal {
  font-size: 20px;
  font-weight: 600;
}

.price-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.original-price {
  font-size: 14px;
  text-decoration: line-through;
  opacity: 0.8;
}

.discount-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.sales-info {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  opacity: 0.9;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.stock-count.low {
  color: #ffe4e4;
  font-weight: 600;
}

.info-card {
  background: #fff;
  margin: 0 12px 12px;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.goods-name {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.category-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.cat-tag {
  background: #f5f7fa;
  color: #666;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
}

.cat-tag.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.comment-float-btn {
  position: fixed;
  right: 20px;
  bottom: 160px;
  z-index: 98;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
}
.comment-float-btn:active {
  transform: scale(0.95);
}
.comment-float-btn .van-icon {
  color: #fff;
}
.comment-num {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #fff;
  color: #409eff;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 1.2;
}

.like-float-btn {
  position: fixed;
  right: 20px;
  bottom: 100px;
  z-index: 98;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #ff2442;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
}
.like-float-btn:active {
  transform: scale(0.95);
}
.like-float-btn.loading {
  opacity: 0.6;
  pointer-events: none;
}
.like-float-btn .van-icon {
  color: #fff;
}
.like-float-btn .van-icon.liked {
  animation: heartBeat 0.6s ease;
}
.like-num {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #fff;
  color: #ff2442;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 1.2;
}

@keyframes heartBeat {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.goods-intro {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 16px 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #ff2442;
}

.service-tags {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
}

.service-icon {
  color: #4caf50;
  font-size: 16px;
}

.specs-panel {
  background: #fff;
  margin: 0 12px 12px;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s;
}

.specs-panel:active {
  background: #f8f9fa;
}

.panel-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-label {
  font-size: 14px;
  color: #999;
  flex-shrink: 0;
}

.panel-value {
  flex: 1;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.panel-arrow {
  color: #ccc;
  font-size: 16px;
}

.detail-section {
  background: #fff;
  margin: 0 12px;
  border-radius: 16px;
  padding: 20px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.header-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #ddd, transparent);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  color: #666;
  font-weight: 600;
}

.detail-content {
  font-size: 14px;
  line-height: 1.8;
  color: #333;
}

.detail-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 8px 0;
}

.params-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.param-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.param-label {
  font-size: 13px;
  color: #999;
}

.param-value {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.empty-state {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.empty-illustration {
  width: 120px;
  height: 120px;
  background: #f5f7fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-illustration .van-icon {
  font-size: 48px;
  color: #ccc;
}

.empty-text {
  font-size: 15px;
  color: #999;
  margin-bottom: 24px;
}

.back-btn {
  width: 160px;
  height: 44px;
  font-size: 15px;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
  z-index: 99;
}

.action-content {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.action-left {
  display: flex;
  gap: 4px;
}

.action-icon {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 44px;
  color: #666;
  font-size: 11px;
  gap: 2px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-icon.loading {
  opacity: 0.7;
  pointer-events: none;
}

.action-icon .van-icon {
  font-size: 22px;
}

.action-icon .van-icon.active {
  color: #ff2442;
}

.action-icon:active {
  opacity: 0.7;
}

.action-icon .badge {
  position: absolute;
  top: 0;
  right: 4px;
  min-width: 16px;
  height: 16px;
  background: #ff2442;
  color: #fff;
  font-size: 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  font-weight: 600;
}

.action-right {
  flex: 1;
  display: flex;
  gap: 8px;
}

.btn-cart, .btn-buy {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cart {
  background: linear-gradient(135deg, #ffa502, #ff7675);
  box-shadow: 0 4px 12px rgba(255, 165, 2, 0.3);
}

.btn-cart.disabled {
  background: #f5f5f5;
  color: #999;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-cart.disabled:active {
  transform: none;
  opacity: 1;
}

.btn-buy {
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.3);
}

.btn-cart:active, .btn-buy:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.sku-popup {
  border-radius: 20px 20px 0 0;
}

.sku-header {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid #f5f5f5;
}

.sku-img {
  width: 90px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #f0f0f0;
}

.sku-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.sku-price {
  color: #ff2442;
  margin-bottom: 4px;
}

.sku-price .symbol {
  font-size: 14px;
  font-weight: 600;
}

.sku-price .amount {
  font-size: 22px;
  font-weight: 700;
}

.sku-stock {
  font-size: 13px;
  color: #999;
  margin-bottom: 4px;
}

.sku-selected {
  font-size: 13px;
  color: #333;
}

.sku-body {
  padding: 16px;
  max-height: 280px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.sku-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  color: #333;
  font-weight: 600;
  margin-bottom: 12px;
}

.sku-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: #fff5f5;
  border-radius: 8px;
  color: #ff2442;
  font-size: 13px;
}

.sku-actions {
  display: flex;
  gap: 12px;
  padding: 12px 20px calc(20px + env(safe-area-inset-bottom));
  border-top: 1px solid #f5f5f5;
}

.sku-actions .van-button {
  flex: 1;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
}

.sku-ticket-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  padding: 0 2px;
}

.ticket-item {
  padding: 6px 12px;
  border: 1px solid #eee;
  border-radius: 18px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 13px;
  flex: 0 0 auto;
  white-space: nowrap;
}

.ticket-item.active {
  border-color: #ff2442;
  background: linear-gradient(135deg, #fff5f5, #ffeaea);
  color: #ff2442;
  box-shadow: 0 2px 4px rgba(255,36,66,0.1);
}

.ticket-price {
  color: #ff2442;
  font-weight: 600;
  font-size: 12px;
}

.safe-area {
  height: 80px;
}

.ticket-item.disabled {
  opacity: 0.45;
  background: #f5f5f5;
  border-color: #ddd;
  cursor: not-allowed;
  color: #999;
}
.ticket-item.disabled:active {
  transform: none;
}
.ticket-sold-out {
  font-size: 12px;
  color: #ff2442;
  font-weight: 600;
}

:deep(.van-stepper__input) {
  background: #f5f5f5;
  font-weight: 600;
}

:deep(.van-popup__close-icon) {
  color: #999;
  font-size: 20px;
}

:deep(.van-button[disabled]) {
  background: #f5f5f5 !important;
  color: #999 !important;
  border-color: #eee !important;
}
</style>