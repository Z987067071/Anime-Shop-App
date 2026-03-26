<template>
  <div class="category-page">
    <header class="glass-header" :class="{ 'scrolled': isScrolled }">
      <div class="header-content">
        <div class="back-btn" @click="router.back()">
          <van-icon name="arrow-left" />
        </div>
        <h1 class="page-title">全部分类</h1>
        <div class="search-btn" @click="goSearch">
          <van-icon name="search" />
        </div>
      </div>
    </header>

    <div class="main-container">
      <!-- 左侧导航 -->
      <div class="side-nav">
        <div class="nav-list">
          <div 
            v-for="(item, index) in sideList" 
            :key="item.id"
            class="nav-item"
            :class="{ 
              'active': activeIndex === index,
              'has-new': item.isNew 
            }"
            @click="handleSideChange(index)"
          >
            <div class="nav-icon" v-if="item.icon">{{ item.icon }}</div>
            <span class="nav-text">{{ item.categoryName }}</span>
            <div class="active-indicator" v-if="activeIndex === index">
              <div class="indicator-glow"></div>
            </div>
            <div class="new-badge" v-if="item.isNew">NEW</div>
          </div>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="content-area" ref="contentRef" @scroll="handleScroll">
        <!-- 分类横幅 -->
        <!-- <div class="category-banner" v-if="currentCategory">
          <div class="banner-bg" :style="{ backgroundImage: `linear-gradient(135deg, ${currentCategory.themeColor || '#667eea'} 0%, ${currentCategory.themeColor2 || '#764ba2'} 100%)` }">
            <div class="banner-content">
              <h2 class="banner-title">{{ currentCategory.categoryName }}</h2>
              <p class="banner-desc">{{ currentCategory.description || '探索更多精彩商品' }}</p>
              <div class="banner-stats" v-if="currentCategory.productCount">
                <span>{{ formatNumber(currentCategory.productCount) }}件商品</span>
              </div>
            </div>
            <div class="banner-decoration">
              <div class="circle circle-1"></div>
              <div class="circle circle-2"></div>
              <div class="circle circle-3"></div>
            </div>
          </div>
        </div> -->

        <!-- 加载状态 -->
        <div class="loading-state" v-if="loading">
          <div class="spinner"></div>
          <span>加载中...</span>
        </div>

        <!-- 子分类网格 -->
        <div class="subcategory-section" v-else-if="currentSecondList.length > 0">
          <div class="section-header">
            <div class="header-line"></div>
            <span class="header-text"></span>
            <div class="header-line"></div>
          </div>

          <div class="category-grid">
            <div 
              v-for="category in currentSecondList" 
              :key="category.id"
              class="category-card"
              @click="goGoodsList(category.id, category.categoryName)"
            >
              <div class="card-visual">
                <div class="image-wrapper">
                  <img 
                    :src="category.icon || category.imageUrl" 
                    :alt="category.categoryName"
                    @error="handleImgError($event)"
                    loading="lazy"
                  />
                  <div class="image-overlay">
                    <van-icon name="arrow" />
                  </div>
                </div>
                <div class="card-badge" v-if="category.tag">{{ category.tag }}</div>
                <div class="trending-tag" v-if="category.isHot">
                  <van-icon name="fire" />
                  <span>HOT</span>
                </div>
              </div>
              <div class="card-info">
                <h3 class="category-name">{{ category.categoryName }}</h3>
                <p class="category-desc" v-if="category.description">{{ category.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-else>
          <div class="empty-illustration">
            <div class="floating-icon">📂</div>
            <div class="shadow"></div>
          </div>
          <h3>暂无子分类</h3>
          <p>该分类下暂时没有更多细分</p>
          <button 
            class="explore-btn" 
            @click="goGoodsList(currentCategory.id, currentCategory.categoryName)"
          >
            浏览全部商品
          </button>
        </div>

        <!-- 推荐商品预览 -->
        <div class="preview-section" v-if="previewProducts.length > 0">
          <div class="section-title">
            <span class="title-icon">✨</span>
            <span>热门推荐</span>
            <div class="view-more" @click="goGoodsList(currentCategory.id, currentCategory.categoryName)">
              查看更多 <van-icon name="arrow" />
            </div>
          </div>
          
          <div class="product-scroll">
            <div 
              v-for="product in previewProducts" 
              :key="product.id"
              class="product-item"
              @click="goProductDetail(product.id)"
            >
              <div class="product-image">
                <img :src="product.coverImg" :alt="product.productName" />
                <div class="product-tag" v-if="product.tag">{{ product.tag }}</div>
              </div>
              <div class="product-info">
                <div class="product-name">{{ product.productName }}</div>
                <div class="product-price">
                  <span class="currency">¥</span>
                  <span class="price">{{ formatPrice(product.price) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <TabBar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TabBar from '@/components/TabBar.vue'
import { getCategoryGroupList } from '@/api/mobile/category'

const router = useRouter()
const contentRef = ref(null)

// 状态
const activeIndex = ref(0)
const sideList = ref([])
const categoryGroupData = ref([])
const loading = ref(false)
const isScrolled = ref(false)
const previewProducts = ref([])

// 计算属性
const currentCategory = computed(() => categoryGroupData.value[activeIndex.value] || {})
const currentSecondList = computed(() => {
  const current = categoryGroupData.value[activeIndex.value]
  return current?.secondCategoryList || []
})

// 方法
const formatNumber = (num) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num
}

const formatPrice = (price) => Number(price).toFixed(2)

const handleImgError = (e) => {
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f5f5f5"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="12" fill="%23999" text-anchor="middle" dy=".3em"%3E暂无图片%3C/text%3E%3C/svg%3E'
}

const handleSideChange = async (index) => {
  activeIndex.value = index
  loading.value = true
  
  await new Promise(resolve => setTimeout(resolve, 300))
  loading.value = false
  
  if (contentRef.value) {
    contentRef.value.scrollTop = 0
  }
}

const handleScroll = () => {
  if (contentRef.value) {
    isScrolled.value = contentRef.value.scrollTop > 10
  }
}

const goGoodsList = (categoryId, categoryName) => {
  if (!categoryId) return
  
  router.push({
    path: '/goods/list',
    query: { 
      categoryId: categoryId,
      categoryName: categoryName || '商品列表'
    }
  })
}

const goProductDetail = (productId) => {
  router.push(`/goods/detail/${productId}`)
}

const goSearch = () => {
  router.push('/search')
}

// 数据加载
const getGroupList = async () => {
  try {
    const res = await getCategoryGroupList()
    if (res.code === 0) {
      categoryGroupData.value = res.data || []
      sideList.value = categoryGroupData.value.map(item => ({
        id: item.id,
        categoryName: item.categoryName,
        icon: item.icon,
        isNew: item.isNew || false
      }))
    }
  } catch (error) {
    console.error('获取分类数据失败：', error)
  }
}

onMounted(() => {
  getGroupList()
})
</script>

<style scoped>
.category-page {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.glass-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}

.glass-header.scrolled {
  border-bottom-color: rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 16px;
  position: relative;
}

/* 返回按钮 - 固定左侧 */
.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #333;
  font-size: 20px;
  transition: all 0.3s;
  flex-shrink: 0;
}

.back-btn:active {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(0.95);
}

/* 标题 - 绝对居中 */
.page-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
  white-space: nowrap;
}

/* 搜索按钮 - 固定右侧 */
.search-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #333;
  font-size: 20px;
  transition: all 0.3s;
  flex-shrink: 0;
  margin-left: auto;
}

.search-btn:active {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(0.95);
}

/* 主容器 */
.main-container {
  display: flex;
  flex: 1;
  margin-top: 50px;
  height: calc(100vh - 50px);
  overflow: hidden;
}

/* 左侧导航 */
.side-nav {
  width: 90px;
  background: #fff;
  border-right: 1px solid #f0f0f0;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 12px 8px;
  flex-shrink: 0;
}

.side-nav::-webkit-scrollbar {
  display: none;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  position: relative;
  padding: 14px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: transparent;
}

.nav-item:active {
  transform: scale(0.95);
}

.nav-item.active {
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(255, 36, 66, 0.3);
}

.nav-icon {
  font-size: 24px;
  line-height: 1;
  transition: transform 0.3s;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-text {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.active-indicator {
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: #ff2442;
  border-radius: 0 4px 4px 0;
  opacity: 0;
  transition: opacity 0.3s;
}

.nav-item.active .active-indicator {
  opacity: 1;
}

.indicator-glow {
  position: absolute;
  inset: -4px;
  background: rgba(255, 36, 66, 0.3);
  border-radius: 4px;
  filter: blur(4px);
}

.new-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ffd700;
  color: #333;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 8px;
  transform: scale(0.8);
}

/* 右侧内容区 */
.content-area {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px;
  background: #f8f9fa;
}

/* 分类横幅 */
.category-banner {
  margin-bottom: 20px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}

.banner-bg {
  padding: 24px 20px;
  color: white;
  position: relative;
  overflow: hidden;
  min-height: 120px;
  display: flex;
  align-items: center;
}

.banner-content {
  position: relative;
  z-index: 2;
}

.banner-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.banner-desc {
  font-size: 13px;
  opacity: 0.9;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.banner-stats {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.2);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  backdrop-filter: blur(10px);
}

.banner-decoration {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 50%;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
}

.circle-1 {
  width: 120px;
  height: 120px;
  right: -40px;
  top: -40px;
}

.circle-2 {
  width: 80px;
  height: 80px;
  right: 40px;
  bottom: -20px;
  background: rgba(255,255,255,0.15);
}

.circle-3 {
  width: 40px;
  height: 40px;
  right: 100px;
  top: 40%;
  background: rgba(255,255,255,0.2);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
  font-size: 14px;
  gap: 12px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top-color: #ff2442;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 子分类区域 */
.subcategory-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.header-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #ddd, transparent);
}

.header-text {
  font-size: 13px;
  color: #999;
  font-weight: 500;
}

/* 分类网格 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.category-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

/* 修复：移动端使用 active 代替 hover */
.category-card:active {
  transform: scale(0.98);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.category-card:active .image-wrapper img {
  transform: scale(1.1);
}

.category-card:active .image-overlay {
  opacity: 1;
}

.category-card:active .image-overlay .van-icon {
  transform: translateX(0);
}

.category-card:active .arrow-icon {
  background: #ff2442;
  color: white;
  transform: translateX(4px);
}

.card-visual {
  position: relative;
  aspect-ratio: 1;
  background: #f5f5f5;
  overflow: hidden;
}

.image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-overlay .van-icon {
  color: white;
  font-size: 28px;
  transform: translateX(-10px);
  transition: transform 0.3s;
}

.card-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0,0,0,0.6);
  color: white;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.trending-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.3);
}

.trending-tag .van-icon {
  font-size: 12px;
}

.card-info {
  padding: 12px;
}

.category-name {
  font-size: 15px;
  font-weight: 700;
  color: #333;
  margin: 0 0 6px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category-desc {
  font-size: 12px;
  color: #999;
  margin: 0 0 10px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
}

.product-count {
  font-size: 12px;
  color: #ff2442;
  font-weight: 600;
}

.arrow-icon {
  width: 24px;
  height: 24px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
  transition: all 0.3s;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-illustration {
  position: relative;
  height: 100px;
  margin-bottom: 20px;
}

.floating-icon {
  font-size: 60px;
  animation: float 3s ease-in-out infinite;
  display: inline-block;
}

.shadow {
  width: 50px;
  height: 8px;
  background: rgba(0,0,0,0.1);
  border-radius: 50%;
  margin: 10px auto 0;
  animation: shadow-scale 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes shadow-scale {
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(0.8); opacity: 0.05; }
}

.empty-state h3 {
  font-size: 18px;
  color: #333;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: #999;
  margin: 0 0 20px 0;
}

.explore-btn {
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(255, 36, 66, 0.3);
}

.explore-btn:active {
  transform: scale(0.95);
}

/* 推荐商品预览 */
.preview-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.title-icon {
  font-size: 20px;
}

.view-more {
  margin-left: auto;
  font-size: 13px;
  color: #999;
  font-weight: normal;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color 0.3s;
}

.view-more:active {
  color: #ff2442;
}

.product-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 8px;
}

.product-scroll::-webkit-scrollbar {
  display: none;
}

.product-item {
  flex-shrink: 0;
  width: 140px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.3s;
}

.product-item:active {
  transform: scale(0.95);
}

.product-image {
  position: relative;
  aspect-ratio: 1;
  background: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-tag {
  position: absolute;
  top: 6px;
  left: 6px;
  background: #ff2442;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 600;
}

.product-info {
  padding: 10px;
}

.product-name {
  font-size: 13px;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 36px;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.currency {
  font-size: 11px;
  color: #ff2442;
  font-weight: 600;
}

.price {
  font-size: 16px;
  color: #ff2442;
  font-weight: 800;
  font-family: 'DIN Alternate', sans-serif;
}

/* TabBar */
:deep(.van-tabbar) {
  height: 50px;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .category-page {
    background: #1a1a2e;
  }
  
  .glass-header {
    background: rgba(26, 26, 46, 0.95);
  }
  
  .page-title {
    color: #fff;
  }
  
  .side-nav {
    background: #242442;
    border-right-color: #2a2a4a;
  }
  
  .nav-item:not(.active) {
    color: #999;
  }
  
  .content-area {
    background: #1a1a2e;
  }
  
  .category-card,
  .product-item {
    background: #242442;
  }
  
  .category-name {
    color: #e0e0e0;
  }
  
  .section-title {
    color: #e0e0e0;
  }
}
</style>