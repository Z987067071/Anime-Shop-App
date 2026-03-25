<template>
  <div class="anime-home">
    <!-- 顶部导航 - 玻璃拟态 -->
    <header class="glass-header" :class="{ 'scrolled': isScrolled }">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo-icon">🍻</div>
          <h1 class="site-title">Anime Shop</h1>
        </div>
        <div class="header-actions">
          <div class="search-btn" @click="goSearch">
            <van-icon name="search" />
            <span>搜索</span>
          </div>
          <div class="notice-badge" @click="goPost">
            <van-icon name="bell" />
            <span class="badge" v-if="noticeCount > 0">{{ noticeCount }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content" @scroll="handleScroll">
      <!-- 轮播图 - 沉浸式全宽 -->
      <section class="hero-section">
        <div class="banner-container" v-if="bannerList.length > 0">
          <van-swipe 
            :autoplay="4000" 
            indicator-color="white" 
            :touchable="true"
            @change="onBannerChange"
          >
            <van-swipe-item v-for="(item, index) in bannerList" :key="item.id">
              <div 
                class="banner-slide" 
                :class="{ 'active': currentBanner === index }"
                @click="handleBannerClick(item.linkUrl)"
              >
                <img :src="item.imgUrl" :alt="item.title" />
                <div class="banner-overlay">
                  <div class="banner-tag">HOT</div>
                  <h2 class="banner-title">{{ item.title }}</h2>
                  <p class="banner-desc">{{ item.subtitle || '限时特惠中' }}</p>
                </div>
                <div class="banner-gradient"></div>
              </div>
            </van-swipe-item>
          </van-swipe>
          <!-- 自定义指示器 -->
          <div class="custom-indicators">
            <span 
              v-for="(item, index) in bannerList" 
              :key="index"
              :class="{ 'active': currentBanner === index }"
            ></span>
          </div>
        </div>
        
        <!-- 骨架屏占位 -->
        <div class="banner-skeleton" v-else>
          <div class="skeleton-shimmer"></div>
          <div class="skeleton-content">
            <div class="skeleton-tag"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-desc"></div>
          </div>
        </div>
      </section>

      <!-- 快捷入口 - 浮动卡片 -->
      <section class="quick-actions">
        <div class="action-card ticket" @click="goTicket">
          <div class="action-icon">🎫</div>
          <div class="action-info">
            <span class="action-name">漫展票务</span>
            <span class="action-desc">早鸟票开售</span>
          </div>
          <div class="action-arrow">
            <van-icon name="arrow" />
          </div>
        </div>
        
        <div class="action-grid">
          <div class="action-item figure" @click="goProductPage(1)">
            <div class="item-bg"></div>
            <div class="item-icon">🎎</div>
            <span class="item-name">手办模型</span>
            <div class="item-wave"></div>
          </div>
          <div class="action-item goods" @click="goProductPage(2)">
            <div class="item-bg"></div>
            <div class="item-icon">🎒</div>
            <span class="item-name">动漫周边</span>
            <div class="item-wave"></div>
          </div>
          <div class="action-item hot" @click="goHotPage">
            <div class="item-bg"></div>
            <div class="item-icon">🔥</div>
            <span class="item-name">本周热门</span>
            <div class="item-badge">HOT</div>
          </div>
          <div class="action-item new" @click="goNewPage">
            <div class="item-bg"></div>
            <div class="item-icon">✨</div>
            <span class="item-name">新品首发</span>
            <div class="item-badge">NEW</div>
          </div>
        </div>
      </section>

      <!-- 动态推荐流 -->
      <section class="recommend-section">
        <div class="section-header">
          <div class="title-group">
            <div class="title-icon">⚡</div>
            <h2 class="section-title">热销推荐</h2>
            <div class="live-indicator">
              <span class="pulse"></span>
              <span>实时更新</span>
            </div>
          </div>
          <div class="filter-tabs">
            <span 
              v-for="tab in tabs" 
              :key="tab.key"
              :class="{ 'active': activeTab === tab.key }"
              @click="switchTab(tab.key)"
            >
              {{ tab.name }}
            </span>
          </div>
        </div>

        <!-- 加载状态 -->
        <div class="loading-state" v-if="loading && !productList.length">
          <div class="spinner"></div>
          <p>正在加载好物...</p>
        </div>

        <!-- 瀑布流商品列表 -->
        <div class="waterfall-list" v-else-if="productList.length > 0">
          <div class="product-column left">
            <div 
              v-for="item in leftProducts" 
              :key="item.id"
              class="product-card"
              @click="goProductDetail(item.id)"
            >
              <div class="card-image">
                <img 
                  :src="item.coverImg || (item.imageList && item.imageList[0]?.imageUrl) || ''" 
                  :alt="item.productName"
                  @error="handleImgError($event)"
                  loading="lazy"
                />
                <div class="image-overlay">
                  <van-icon name="eye" />
                  <span>查看详情</span>
                </div>
                <div class="discount-tag" v-if="item.originalPrice > item.price">
                  -{{ Math.round((1 - item.price/item.originalPrice) * 100) }}%
                </div>
              </div>
              <div class="card-content">
                <div class="product-tags" v-if="item.tags">
                  <span v-for="tag in item.tags.split(',')" :key="tag" class="tag">{{ tag }}</span>
                </div>
                <h3 class="product-name">{{ item.productName }}</h3>
                <div class="product-meta">
                  <div class="price-box">
                    <span class="currency">¥</span>
                    <span class="price">{{ formatPrice(item.price) }}</span>
                    <span class="original" v-if="item.originalPrice > item.price">¥{{ item.originalPrice }}</span>
                  </div>
                  <div class="sales-info">
                    <van-icon name="fire" color="#ff2442" />
                    <span>{{ formatSales(item.sales || 0) }}人付款</span>
                  </div>
                </div>
                <div class="shop-row" v-if="item.shopName">
                  <img :src="item.shopLogo || '/default-shop.png'" class="shop-avatar" />
                  <span class="shop-name">{{ item.shopName }}</span>
                  <van-icon name="arrow" class="shop-arrow" />
                </div>
              </div>
            </div>
          </div>
          
          <div class="product-column right">
            <div 
              v-for="item in rightProducts" 
              :key="item.id"
              class="product-card"
              @click="goProductDetail(item.id)"
            >
              <div class="card-image">
                <img 
                  :src="item.coverImg || (item.imageList && item.imageList[0]?.imageUrl) || ''" 
                  :alt="item.productName"
                  @error="handleImgError($event)"
                  loading="lazy"
                />
                <div class="image-overlay">
                  <van-icon name="eye" />
                  <span>查看详情</span>
                </div>
                <div class="discount-tag" v-if="item.originalPrice > item.price">
                  -{{ Math.round((1 - item.price/item.originalPrice) * 100) }}%
                </div>
              </div>
              <div class="card-content">
                <div class="product-tags" v-if="item.tags">
                  <span v-for="tag in item.tags.split(',')" :key="tag" class="tag">{{ tag }}</span>
                </div>
                <h3 class="product-name">{{ item.productName }}</h3>
                <div class="product-meta">
                  <div class="price-box">
                    <span class="currency">¥</span>
                    <span class="price">{{ formatPrice(item.price) }}</span>
                    <span class="original" v-if="item.originalPrice > item.price">¥{{ item.originalPrice }}</span>
                  </div>
                  <div class="sales-info">
                    <van-icon name="fire" color="#ff2442" />
                    <span>{{ formatSales(item.sales || 0) }}人付款</span>
                  </div>
                </div>
                <div class="shop-row" v-if="item.shopName">
                  <img :src="item.shopLogo || '/default-shop.png'" class="shop-avatar" />
                  <span class="shop-name">{{ item.shopName }}</span>
                  <van-icon name="arrow" class="shop-arrow" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-else-if="!loading">
          <div class="empty-illustration">
            <div class="floating-box">📦</div>
            <div class="shadow"></div>
          </div>
          <p class="empty-text">暂无商品，去看看其他的吧</p>
          <button class="refresh-btn" @click="loadProductList">刷新试试</button>
        </div>

        <!-- 加载更多 -->
        <div class="load-more" v-if="productList.length > 0 && !loading">
          <div class="divider">
            <span>已经到底啦 ~</span>
          </div>
        </div>
      </section>
    </main>

    <!-- 浮动活动入口 -->
    <div class="floating-promo" v-if="showPromo" @click="goPromo">
      <div class="promo-pulse"></div>
      <div class="promo-content">
        <span class="promo-icon">🎁</span>
        <span class="promo-text">领券</span>
      </div>
    </div>

    <TabBar />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import TabBar from '@/components/TabBar.vue'
import { getHomeBannerList } from '@/api/mobile/home'
import { getHomeProductList } from '@/api/mobile/product'
import { showToast } from 'vant'

const router = useRouter()

// 状态
const bannerList = ref([])
const productList = ref([])
const loading = ref(false)
const currentBanner = ref(0)
const isScrolled = ref(false)
const activeTab = ref('hot')
const noticeCount = ref(3)
const showPromo = ref(true)

// 分类标签
const tabs = [
  { key: 'hot', name: '热销' },
  { key: 'new', name: '新品' },
  { key: 'figure', name: '手办' },
  { key: 'goods', name: '周边' }
]

// 计算属性：瀑布流分列
const leftProducts = computed(() => productList.value.filter((_, i) => i % 2 === 0))
const rightProducts = computed(() => productList.value.filter((_, i) => i % 2 !== 0))

// 方法
const formatPrice = (price) => Number(price).toFixed(2)
const formatSales = (count) => {
  if (count >= 10000) return (count / 10000).toFixed(1) + '万'
  return count
}

const handleImgError = (e) => {
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="14" fill="%23999" text-anchor="middle"%3E暂无图片%3C/text%3E%3C/svg%3E'
}

const onBannerChange = (index) => {
  currentBanner.value = index
}

const handleScroll = (e) => {
  isScrolled.value = e.target.scrollTop > 50
}

const switchTab = async (key) => {
  activeTab.value = key
  await loadProductList()
}

// 数据加载
const loadBannerList = async () => {
  try {
    const res = await getHomeBannerList()
    if (res.code === 0) {
      bannerList.value = res.data || []
    }
  } catch (error) {
    console.error('轮播图加载失败：', error)
    // 使用默认数据
    bannerList.value = [
      { id: '1', imgUrl: 'https://picsum.photos/400/200?random=1', title: '初音未来手办首发', linkUrl: '/figure', subtitle: '限时9折优惠' },
      { id: '2', imgUrl: 'https://picsum.photos/400/200?random=2', title: '夏季漫展门票', linkUrl: '/ticket', subtitle: '早鸟票开售中' }
    ]
  }
}

const loadProductList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: 1,
      pageSize: 10,
      sort: activeTab.value
    }
    
    // 根据tab添加分类筛选
    if (activeTab.value === 'figure') params.firstCategoryId = 1
    if (activeTab.value === 'goods') params.firstCategoryId = 2
    
    const res = await getHomeProductList(params)
    if (res.code === 0) {
      productList.value = res.data?.records || []
    }
  } catch (error) {
    console.error('商品加载失败：', error)
    productList.value = []
  } finally {
    loading.value = false
  }
}

// 导航
const goSearch = () => router.push('/search')
const goPost = () => router.push('/postList')
const goTicket = () => router.push('/comic-con/list')
const goProductPage = (id) => router.push({ path: '/product-list', query: { firstCategoryId: id } })
// const goHotPage = () => router.push('/search?keyword=%E7%83%AD%E9%97%A8')
const goHotPage = () => router.push('/hot')
const goNewPage = () => router.push('/search?keyword=%E6%96%B0%E5%93%81')
const goProductDetail = (id) => router.push('/goods/detail/' + id)
const goPromo = () => {
  showToast("未开发模块,敬请期待")
}
const handleBannerClick = (url) => {
  if (url && url !== '#') router.push(url)
}

onMounted(() => {
  loadBannerList()
  loadProductList()
})
</script>

<style scoped>
.anime-home {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff5f7 0%, #ffffff 100%);
  padding-bottom: 60px;
}

/* 玻璃拟态头部 */
.glass-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.glass-header.scrolled {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 6px 16px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 600px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 28px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.site-title {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  transition: all 0.3s;
}

.search-btn:active {
  background: #eee;
  transform: scale(0.95);
}

.notice-badge {
  position: relative;
  font-size: 22px;
  color: #666;
  padding: 4px;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ff2442;
  color: white;
  font-size: 10px;
  padding: 0 5px;
  height: 16px;
  border-radius: 8px;
  line-height: 16px;
  font-weight: 600;
}

/* 主内容区 */
.main-content {
  padding-top: 60px;
  overflow-y: auto;
  height: 100vh;
  -webkit-overflow-scrolling: touch;
}

/* 轮播图区域 */
.hero-section {
  padding: 12px 16px;
}

.banner-container {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(255, 36, 66, 0.15);
}

:deep(.van-swipe) {
  border-radius: 16px;
}

.banner-slide {
  position: relative;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.banner-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.banner-slide.active img {
  transform: scale(1.05);
}

.banner-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70%;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
}

.banner-overlay {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 2;
  color: white;
}

.banner-tag {
  display: inline-block;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.3);
}

.banner-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 6px 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.banner-desc {
  font-size: 13px;
  opacity: 0.9;
  margin: 0;
}

.custom-indicators {
  position: absolute;
  bottom: 12px;
  right: 16px;
  display: flex;
  gap: 6px;
  z-index: 3;
}

.custom-indicators span {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background: rgba(255,255,255,0.4);
  transition: all 0.3s;
}

.custom-indicators span.active {
  width: 20px;
  background: white;
}

/* 骨架屏 */
.banner-skeleton {
  height: 200px;
  background: #f0f0f0;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  100% { left: 100%; }
}

.skeleton-content {
  position: absolute;
  bottom: 20px;
  left: 20px;
}

.skeleton-tag {
  width: 40px;
  height: 20px;
  background: rgba(255,255,255,0.3);
  border-radius: 10px;
  margin-bottom: 10px;
}

.skeleton-title {
  width: 150px;
  height: 24px;
  background: rgba(255,255,255,0.3);
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-desc {
  width: 100px;
  height: 16px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
}

/* 快捷入口 */
.quick-actions {
  padding: 16px;
}

.action-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: white;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.action-card:active {
  transform: scale(0.98);
}

.action-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 150px;
  height: 150px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
}

.action-icon {
  font-size: 40px;
  margin-right: 16px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.action-info {
  flex: 1;
}

.action-name {
  display: block;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 13px;
  opacity: 0.9;
}

.action-arrow {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.action-item {
  background: white;
  border-radius: 16px;
  padding: 16px 8px;
  text-align: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.action-item:active {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.item-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.figure .item-bg { background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%); }
.goods .item-bg { background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%); }
.hot .item-bg { background: linear-gradient(90deg, #fa709a 0%, #fee140 100%); }
.new .item-bg { background: linear-gradient(90deg, #30cfd0 0%, #330867 100%); }

.item-icon {
  font-size: 32px;
  margin-bottom: 8px;
  display: block;
}

.item-name {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

.item-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff2442;
  color: white;
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 700;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 推荐区域 */
.recommend-section {
  padding: 16px;
}

.section-header {
  margin-bottom: 16px;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.title-icon {
  font-size: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 800;
  color: #333;
  margin: 0;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #ff2442;
  background: rgba(255, 36, 66, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
  margin-left: auto;
}

.pulse {
  width: 6px;
  height: 6px;
  background: #ff2442;
  border-radius: 50%;
  animation: pulse-dot 1.5s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.filter-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tabs span {
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.filter-tabs span.active {
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.25);
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top-color: #ff2442;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 瀑布流列表 */
.waterfall-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.product-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-column.right {
  margin-top: 20px;
}

.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transition: all 0.3s;
  cursor: pointer;
}

.product-card:active {
  transform: scale(0.98);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f5f5f5;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.product-card:hover .card-image img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
}

.product-card:hover .image-overlay {
  opacity: 1;
}

.image-overlay .van-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.image-overlay span {
  font-size: 13px;
}

.discount-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.3);
}

.card-content {
  padding: 12px;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.tag {
  font-size: 10px;
  color: #ff2442;
  background: rgba(255, 36, 66, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.product-name {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 500;
}

.product-meta {
  margin-bottom: 10px;
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 6px;
}

.currency {
  font-size: 12px;
  color: #ff2442;
  font-weight: 600;
}

.price {
  font-size: 20px;
  color: #ff2442;
  font-weight: 800;
  font-family: 'DIN Alternate', sans-serif;
}

.original {
  font-size: 12px;
  color: #bbb;
  text-decoration: line-through;
}

.sales-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #666;
}

.shop-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
}

.shop-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

.shop-name {
  flex: 1;
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shop-arrow {
  font-size: 12px;
  color: #ccc;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-illustration {
  position: relative;
  height: 120px;
  margin-bottom: 20px;
}

.floating-box {
  font-size: 60px;
  animation: float 3s ease-in-out infinite;
  display: inline-block;
}

.shadow {
  width: 60px;
  height: 10px;
  background: rgba(0,0,0,0.1);
  border-radius: 50%;
  margin: 10px auto 0;
  animation: shadow 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes shadow {
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(0.8); opacity: 0.05; }
}

.empty-text {
  color: #999;
  font-size: 14px;
  margin-bottom: 20px;
}

.refresh-btn {
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s;
}

.refresh-btn:active {
  transform: scale(0.95);
}

/* 加载更多 */
.load-more {
  padding: 30px 20px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #ccc;
  font-size: 13px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #ddd, transparent);
}

/* 浮动活动入口 */
.floating-promo {
  position: fixed;
  right: 16px;
  bottom: 80px;
  z-index: 99;
  cursor: pointer;
}

.promo-pulse {
  position: absolute;
  inset: -8px;
  background: rgba(255, 36, 66, 0.3);
  border-radius: 50%;
  animation: promo-pulse 2s infinite;
}

@keyframes promo-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0; }
}

.promo-content {
  position: relative;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(255, 36, 66, 0.4);
  animation: promo-float 3s ease-in-out infinite;
}

@keyframes promo-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.promo-icon {
  font-size: 24px;
  line-height: 1;
}

.promo-text {
  font-size: 11px;
  font-weight: 600;
  margin-top: 2px;
}

/* TabBar样式 */
:deep(.van-tabbar) {
  height: 50px;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
}

/* 响应式适配 */
@media (min-width: 768px) {
  .waterfall-list {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .product-column.right {
    margin-top: 0;
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .anime-home {
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  }
  
  .glass-header {
    background: rgba(26, 26, 46, 0.9);
  }
  
  .site-title {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
    -webkit-background-clip: text;
  }
  
  .action-item,
  .product-card {
    background: #242442;
  }
  
  .product-name {
    color: #e0e0e0;
  }
  
  .filter-tabs span {
    background: #2a2a4a;
    color: #aaa;
  }
}
</style>