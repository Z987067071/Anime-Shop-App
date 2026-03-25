<template>
  <div class="rank-page">
    <!-- 玻璃拟态头部 -->
    <header class="glass-header" :class="{ 'scrolled': isScrolled }">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <van-icon name="arrow-left" />
        </div>
        <h1 class="page-title">热销排行榜</h1>
        <div class="header-actions">
          <div class="search-btn" @click="goSearch">
            <van-icon name="search" />
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content" @scroll="handleScroll">
      <!-- 顶部统计卡片 -->
      <section class="stats-section">
        <div class="stats-card">
          <div class="stats-bg"></div>
          <div class="stats-content">
            <div class="stats-item">
              <div class="stats-icon">🔥</div>
              <div class="stats-info">
                <span class="stats-num">{{ totalSales }}</span>
                <span class="stats-label">总销量</span>
              </div>
            </div>
            <div class="stats-divider"></div>
            <div class="stats-item">
              <div class="stats-icon">🏆</div>
              <div class="stats-info">
                <span class="stats-num">{{ topProductName }}</span>
                <span class="stats-label">销量冠军</span>
              </div>
            </div>
          </div>
          <div class="floating-icons">
            <span class="float-icon">⭐</span>
            <span class="float-icon">💎</span>
            <span class="float-icon">👑</span>
          </div>
        </div>
      </section>

      <!-- 榜单类型切换 - 优化版本 -->
      <section class="rank-tabs-section">
        <div class="rank-tabs-container">
          <div class="rank-tabs" :class="{ 'can-scroll': canScroll }">
            <div 
              v-for="(tab, index) in rankTabs" 
              :key="tab.key"
              class="rank-tab"
              :class="{ 'active': activeRank === tab.key }"
              :style="getTabStyle(index)"
              @click="switchRankTab(tab.key)"
            >
              <div class="tab-icon">{{ tab.icon }}</div>
              <span class="tab-name">{{ tab.name }}</span>
              <div class="tab-badge" v-if="tab.badge">{{ tab.badge }}</div>
              <div class="active-indicator" v-if="activeRank === tab.key"></div>
            </div>
          </div>
          <!-- 渐变遮罩提示 -->
          <div class="scroll-hint left" v-if="canScroll && scrollHint === 'left'">
            <van-icon name="arrow-left" />
          </div>
          <div class="scroll-hint right" v-if="canScroll && scrollHint === 'right'">
            <van-icon name="arrow-right" />
          </div>
        </div>
      </section>

      <!-- 时间筛选 -->
      <section class="time-filter">
        <div class="filter-scroll">
          <span 
            v-for="time in timeFilters" 
            :key="time.key"
            :class="{ 'active': activeTime === time.key }"
            @click="switchTimeFilter(time.key)"
          >
            {{ time.name }}
          </span>
        </div>
      </section>

      <!-- 榜单列表 -->
      <section class="rank-list-section">
        <div class="list-header">
          <div class="rank-title">
            <span class="title-icon">🏅</span>
            <span>{{ currentRankTitle }}</span>
          </div>
          <div class="update-time">
            <span class="pulse"></span>
            <span>{{ updateTime }}更新</span>
          </div>
        </div>

        <!-- 加载状态 -->
        <div class="loading-state" v-if="loading && !productList.length">
          <div class="spinner"></div>
          <p>正在加载榜单...</p>
        </div>

        <!-- 前三甲特殊展示 -->
        <div class="top-three" v-if="!loading && topThree.length > 0">
          <div 
            v-for="(item, index) in topThree" 
            :key="item.id"
            class="top-item"
            :class="`rank-${index + 1}`"
            @click="goProductDetail(item.id)"
          >
            <div class="rank-crown" v-if="index === 0">👑</div>
            <div class="rank-medal">{{ ['🥇', '🥈', '🥉'][index] }}</div>
            <div class="top-image">
              <img 
                :src="item.coverImg || (item.imageList && item.imageList[0]?.imageUrl) || ''" 
                :alt="item.productName"
                @error="handleImgError"
              />
              <div class="top-rank-num">{{ index + 1 }}</div>
            </div>
            <div class="top-info">
              <h3 class="top-name">{{ item.productName }}</h3>
              <div class="top-sales">
                <van-icon name="fire" color="#ff2442" />
                <span>已售 {{ formatSales(item.sales || 0) }}</span>
              </div>
              <div class="top-price">
                <span class="currency">¥</span>
                <span class="price">{{ formatPrice(item.price) }}</span>
              </div>
            </div>
            <div class="trend-indicator" :class="getTrendClass(item.trend)">
              <van-icon :name="getTrendIcon(item.trend)" />
              <span>{{ item.trend || '稳定' }}</span>
            </div>
          </div>
        </div>

        <!-- 普通列表 -->
        <div class="normal-list" v-if="!loading && normalList.length > 0">
          <div 
            v-for="(item, index) in normalList" 
            :key="item.id"
            class="rank-item"
            @click="goProductDetail(item.id)"
          >
            <div class="rank-number" :class="{ 'top-10': index < 7 }">{{ index + 4 }}</div>
            <div class="item-image">
              <img 
                :src="item.coverImg || (item.imageList && item.imageList[0]?.imageUrl) || ''" 
                :alt="item.productName"
                @error="handleImgError"
              />
            </div>
            <div class="item-content">
              <div class="item-main">
                <h3 class="item-name">{{ item.productName }}</h3>
                <div class="item-tags" v-if="item.tag">
                  <span v-for="tag in item.tag.split(',').slice(0, 2)" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
              <div class="item-bottom">
                <div class="sales-count">
                  <van-icon name="fire-o" color="#ff6b6b" />
                  <span>销量 {{ formatSales(item.sales || 0) }}</span>
                </div>
                <div class="price-box">
                  <span class="currency">¥</span>
                  <span class="price">{{ formatPrice(item.price) }}</span>
                  <span class="original" v-if="item.originalPrice > item.price">¥{{ item.originalPrice }}</span>
                </div>
              </div>
            </div>
            <div class="item-arrow">
              <van-icon name="arrow" />
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-if="!loading && productList.length === 0">
          <div class="empty-illustration">
            <div class="trophy-icon">🏆</div>
            <div class="shadow"></div>
          </div>
          <p class="empty-text">暂无榜单数据</p>
          <button class="refresh-btn" @click="loadRankData">刷新试试</button>
        </div>

        <!-- 加载更多 -->
        <div class="load-more" v-if="productList.length > 0 && !loading">
          <div class="divider">
            <span>已经到底啦 ~</span>
          </div>
        </div>
      </section>
    </main>

    <!-- 返回顶部 -->
    <div class="back-top" v-show="showBackTop" @click="scrollToTop">
      <van-icon name="back-top" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { searchProductList } from '@/api/mobile/product'
import { showToast } from 'vant'

const router = useRouter()

// 状态
const productList = ref([])
const loading = ref(false)
const isScrolled = ref(false)
const showBackTop = ref(false)
const activeRank = ref('sales')
const activeTime = ref('week')
const pageNum = ref(1)
const pageSize = 20
const updateTime = ref('刚刚')
const canScroll = ref(false)
const scrollHint = ref('')

// 榜单类型
const rankTabs = [
  { key: 'sales', name: '销量榜', icon: '🔥', badge: 'HOT' },
  { key: 'new', name: '新品榜', icon: '✨', badge: 'NEW' },
  { key: 'hot', name: '人气榜', icon: '❤️', badge: 'NICE' },
  // { key: 'good', name: '好评榜', icon: '👍', badge: 'GOOD' }
]

// 时间筛选
const timeFilters = [
  { key: 'day', name: '今日' },
  { key: 'week', name: '本周' },
  { key: 'month', name: '本月' },
  { key: 'total', name: '总榜' }
]

// 计算属性
const currentRankTitle = computed(() => {
  const tab = rankTabs.find(t => t.key === activeRank.value)
  return tab ? tab.name : '销量榜'
})

const topThree = computed(() => productList.value.slice(0, 3))
const normalList = computed(() => productList.value.slice(3))

const totalSales = computed(() => {
  const total = productList.value.reduce((sum, item) => sum + (item.sales || 0), 0)
  return formatSales(total)
})

const topProductName = computed(() => {
  return productList.value[0]?.productName?.slice(0, 6) + '...' || '-'
})

// 方法
const formatPrice = (price) => Number(price).toFixed(2)

const formatSales = (count) => {
  if (count >= 10000) return (count / 10000).toFixed(1) + '万'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
  return count
}

const handleImgError = (e) => {
  e.target.src = ''
}

const getTrendClass = (trend) => {
  if (!trend) return 'stable'
  if (trend === 'up') return 'up'
  if (trend === 'down') return 'down'
  return 'stable'
}

const getTrendIcon = (trend) => {
  if (trend === 'up') return 'arrow-up'
  if (trend === 'down') return 'arrow-down'
  return 'minus'
}

const handleScroll = (e) => {
  const scrollTop = e.target.scrollTop
  isScrolled.value = scrollTop > 50
  showBackTop.value = scrollTop > 300
}

const scrollToTop = () => {
  const mainContent = document.querySelector('.main-content')
  if (mainContent) {
    mainContent.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const getTabStyle = (index) => {
  // 根据索引返回不同的颜色渐变
  const gradients = [
    'linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  ]
  return {
    '--tab-gradient': gradients[index % gradients.length]
  }
}

const switchRankTab = async (key) => {
  activeRank.value = key
  pageNum.value = 1
  await loadRankData()
}

const switchTimeFilter = async (key) => {
  activeTime.value = key
  pageNum.value = 1
  await loadRankData()
}

// 检查是否需要滚动
const checkScrollable = () => {
  nextTick(() => {
    const tabsContainer = document.querySelector('.rank-tabs')
    if (tabsContainer) {
      const isScrollable = tabsContainer.scrollWidth > tabsContainer.clientWidth
      canScroll.value = isScrollable
      
      // 监听滚动位置显示提示
      tabsContainer.addEventListener('scroll', (e) => {
        const { scrollLeft, scrollWidth, clientWidth } = e.target
        if (scrollLeft <= 10) {
          scrollHint.value = 'right'
        } else if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollHint.value = 'left'
        } else {
          scrollHint.value = 'both'
        }
      })
      
      // 初始状态
      scrollHint.value = isScrollable ? 'right' : ''
    }
  })
}

// 加载榜单数据
const loadRankData = async () => {
  loading.value = true
  try {
    let keyword = ''
    if (activeRank.value === 'sales') {
      keyword = ''
    } else if (activeRank.value === 'new') {
      keyword = '新品'
    } else if (activeRank.value === 'hot') {
      keyword = '热门'
    } else if (activeRank.value === 'good') {
      keyword = '好评如潮'
    }

    const res = await searchProductList({
      keyword: keyword.trim(),
      pageNum: pageNum.value,
      pageSize,
      sort: 'sales',
      order: 'desc'
    })

    if (res.code === 0 && res.data) {
      const records = (res.data.records || []).map((item, index) => ({
        ...item,
        trend: index < 3 ? 'up' : (Math.random() > 0.5 ? 'up' : 'stable')
      }))
      productList.value = records
    } else {
      productList.value = []
    }

    const now = new Date()
    updateTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  } catch (error) {
    console.error('加载榜单失败：', error)
    showToast('加载失败，请稍后重试')
    productList.value = []
  } finally {
    loading.value = false
  }
}

// 导航
const goBack = () => router.back()
const goSearch = () => router.push('/search')
const goProductDetail = (id) => router.push('/goods/detail/' + id)

onMounted(() => {
  loadRankData()
  checkScrollable()
  window.addEventListener('resize', checkScrollable)
})
</script>

<style scoped>
.rank-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff5f7 0%, #ffffff 100%);
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

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #333;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.3s;
}

.back-btn:active {
  background: #f5f5f5;
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
  flex: 1;
  text-align: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.3s;
}

.search-btn:active {
  background: #f5f5f5;
}

/* 主内容区 */
.main-content {
  padding-top: 60px;
  overflow-y: auto;
  height: 100vh;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px;
}

/* 统计卡片 */
.stats-section {
  padding: 12px 16px;
}

.stats-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 24px 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.3);
}

.stats-bg {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.stats-content {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.stats-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 20px;
}

.stats-icon {
  font-size: 32px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.stats-info {
  display: flex;
  flex-direction: column;
  color: white;
}

.stats-num {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 4px;
}

.stats-label {
  font-size: 12px;
  opacity: 0.9;
}

.floating-icons {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
}

.float-icon {
  font-size: 16px;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
}

.float-icon:nth-child(2) {
  animation-delay: 0.5s;
}

.float-icon:nth-child(3) {
  animation-delay: 1s;
}

/* ===== 优化后的榜单类型切换 ===== */
.rank-tabs-section {
  padding: 0 16px;
  margin-top: 8px;
}

.rank-tabs-container {
  position: relative;
  width: 100%;
}

.rank-tabs {
  display: flex;
  gap: 12px;
  padding: 4px;
  border-radius: 20px;
  background: rgba(245, 245, 245, 0.5);
  /* 默认居中，不滚动 */
  justify-content: center;
  flex-wrap: wrap;
}

/* 当需要滚动时的样式 */
.rank-tabs.can-scroll {
  flex-wrap: nowrap;
  justify-content: flex-start;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background: transparent;
  padding: 4px 0;
}

.rank-tabs.can-scroll::-webkit-scrollbar {
  display: none;
}

.rank-tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 2px solid transparent;
  flex-shrink: 0;
  /* 非滚动状态下可以收缩 */
  flex: 0 0 auto;
}

.rank-tabs.can-scroll .rank-tab {
  scroll-snap-align: center;
  flex: 0 0 auto;
}

.rank-tab.active {
  background: var(--tab-gradient, linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%));
  color: white;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(255, 36, 66, 0.25);
  border-color: rgba(255, 255, 255, 0.3);
}

.tab-icon {
  font-size: 20px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.tab-name {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.tab-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  animation: badge-pulse 2s infinite;
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.active-indicator {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: white;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

/* 滚动提示 */
.scroll-hint {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #666;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  animation: hint-pulse 1.5s infinite;
  z-index: 10;
  pointer-events: none;
}

.scroll-hint.left {
  left: 0;
}

.scroll-hint.right {
  right: 0;
}

@keyframes hint-pulse {
  0%, 100% { opacity: 0.6; transform: translateY(-50%) scale(1); }
  50% { opacity: 1; transform: translateY(-50%) scale(1.1); }
}

/* 时间筛选 */
.time-filter {
  padding: 16px;
}

.filter-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  /* 居中显示 */
  justify-content: center;
  flex-wrap: wrap;
}

.filter-scroll::-webkit-scrollbar {
  display: none;
}

/* 当空间不够时允许滚动 */
@media (max-width: 400px) {
  .filter-scroll {
    flex-wrap: nowrap;
    justify-content: flex-start;
  }
  
  .filter-scroll span {
    scroll-snap-align: center;
  }
}

.filter-scroll span {
  padding: 8px 20px;
  background: #f5f5f5;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  flex-shrink: 0;
}

.filter-scroll span.active {
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.25);
  transform: scale(1.05);
}

/* 榜单列表 */
.rank-list-section {
  padding: 0 16px 20px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.rank-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 800;
  color: #333;
}

.title-icon {
  font-size: 24px;
}

.update-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #999;
}

.pulse {
  width: 6px;
  height: 6px;
  background: #52c41a;
  border-radius: 50%;
  animation: pulse-dot 1.5s infinite;
}

/* 前三甲 */
.top-three {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.top-item {
  background: white;
  border-radius: 20px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.top-item:active {
  transform: scale(0.98);
}

.top-item.rank-1 {
  background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
  border: 2px solid #ffd700;
}

.top-item.rank-2 {
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  border: 2px solid #c0c0c0;
}

.top-item.rank-3 {
  background: linear-gradient(135deg, #fff5f0 0%, #ffffff 100%);
  border: 2px solid #cd7f32;
}

.rank-crown {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  animation: bounce 2s infinite;
}

.rank-medal {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 24px;
  z-index: 2;
}

.top-image {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f5;
}

.top-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.top-rank-num {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  color: white;
  font-size: 24px;
  font-weight: 800;
  text-align: center;
  padding: 20px 0 8px;
}

.top-info {
  flex: 1;
  min-width: 0;
}

.top-name {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-sales {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #ff6b6b;
  margin-bottom: 8px;
}

.top-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.top-price .currency {
  font-size: 14px;
  color: #ff2442;
  font-weight: 600;
}

.top-price .price {
  font-size: 24px;
  color: #ff2442;
  font-weight: 800;
}

.trend-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.trend-indicator.up {
  background: #f6ffed;
  color: #52c41a;
}

.trend-indicator.down {
  background: #fff2f0;
  color: #ff4d4f;
}

.trend-indicator.stable {
  background: #f5f5f5;
  color: #999;
}

/* 普通列表 */
.normal-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rank-item {
  background: white;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: all 0.3s;
}

.rank-item:active {
  transform: scale(0.98);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.rank-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  color: #999;
  background: #f5f5f5;
  border-radius: 50%;
  flex-shrink: 0;
}

.rank-number.top-10 {
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f5;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 80px;
}

.item-main {
  flex: 1;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 10px;
  color: #ff2442;
  background: rgba(255, 36, 66, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sales-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-box .currency {
  font-size: 12px;
  color: #ff2442;
  font-weight: 600;
}

.price-box .price {
  font-size: 18px;
  color: #ff2442;
  font-weight: 800;
}

.price-box .original {
  font-size: 11px;
  color: #bbb;
  text-decoration: line-through;
  margin-left: 4px;
}

.item-arrow {
  color: #ddd;
  font-size: 16px;
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

.trophy-icon {
  font-size: 60px;
  animation: float 3s ease-in-out infinite;
  display: inline-block;
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

/* 返回顶部 */
.back-top {
  position: fixed;
  right: 16px;
  bottom: 30px;
  width: 44px;
  height: 44px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #666;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  cursor: pointer;
  transition: all 0.3s;
  z-index: 99;
}

.back-top:active {
  transform: scale(0.9);
}

/* 动画 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .rank-page {
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  }
  
  .glass-header {
    background: rgba(26, 26, 46, 0.9);
  }
  
  .page-title {
    color: #e0e0e0;
  }
  
  .rank-tab,
  .top-item,
  .rank-item {
    background: #242442;
  }
  
  .rank-tabs {
    background: rgba(42, 42, 74, 0.5);
  }
  
  .top-item.rank-1 {
    background: linear-gradient(135deg, #3d3518 0%, #242442 100%);
  }
  
  .top-item.rank-2 {
    background: linear-gradient(135deg, #2a2a3a 0%, #242442 100%);
  }
  
  .top-item.rank-3 {
    background: linear-gradient(135deg, #3d2818 0%, #242442 100%);
  }
  
  .top-name,
  .item-name,
  .rank-title {
    color: #e0e0e0;
  }
  
  .filter-scroll span {
    background: #2a2a4a;
    color: #aaa;
  }
  
  .rank-number {
    background: #2a2a4a;
    color: #888;
  }
}

/* 响应式适配 */
@media (min-width: 768px) {
  .rank-tabs {
    gap: 16px;
  }
  
  .rank-tab {
    padding: 14px 24px;
  }
}
</style>