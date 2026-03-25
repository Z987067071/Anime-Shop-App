<template>
  <div class="search-page">
    <!-- 顶部搜索栏 - 悬浮固定 -->
    <div class="search-header" :class="{ 'is-scrolled': isScrolled }">
      <div class="search-bar-wrapper">
        <div class="back-btn" @click="handleCancel">
          <van-icon name="arrow-left" />
        </div>
        <div class="search-input-box">
          <van-icon name="search" class="search-icon" />
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索商品名称"
            @keyup.enter="handleSearch(searchKeyword)"
            @focus="handleFocus"
            @blur="handleBlur"
            ref="searchInput"
          />
          <van-icon 
            v-if="searchKeyword" 
            name="clear" 
            class="clear-icon" 
            @click="clearKeyword"
          />
        </div>
        <button class="search-btn" @click="handleSearch(searchKeyword)">搜索</button>
      </div>
    </div>

    <!-- 搜索建议下拉层 -->
    <div class="search-suggestions" v-if="showSuggestions && !searchResult.length">
      <div class="suggestion-section" v-if="hotSearchList.length">
        <div class="section-title">
          <van-icon name="fire" color="#ff2442" />
          <span>热门搜索</span>
        </div>
        <div class="tag-cloud">
          <span 
            v-for="(item, index) in hotSearchList" 
            :key="index"
            class="hot-tag"
            :style="{ animationDelay: `${index * 0.05}s` }"
            @click="searchByHistory(item)"
          >
            {{ item }}
          </span>
        </div>
      </div>

      <div class="suggestion-section" v-if="historyList.length">
        <div class="section-title">
          <van-icon name="clock" color="#999" />
          <span>历史记录</span>
          <van-icon name="delete" class="delete-icon" @click="clearHistory" />
        </div>
        <div class="history-list">
          <div 
            v-for="(item, index) in historyList" 
            :key="index"
            class="history-item"
            @click="searchByHistory(item)"
          >
            <van-icon name="clock-o" />
            <span class="text">{{ item }}</span>
            <van-icon name="cross" @click.stop="deleteHistory(index)" />
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索结果区域 -->
    <div class="search-content" v-else>
      <!-- 筛选栏 -->
      <div class="filter-bar" v-if="searchResult.length > 0" :class="{ 'sticky': isScrolled }">
        <div 
          v-for="filter in filters" 
          :key="filter.key"
          class="filter-item"
          :class="{ active: activeFilter === filter.key }"
          @click="handleFilter(filter.key)"
        >
          {{ filter.label }}
          <van-icon v-if="filter.key === 'price'" :name="priceSortIcon" />
        </div>
      </div>

      <!-- 加载中骨架屏 -->
      <div class="skeleton-wrap" v-if="searchLoading">
        <div v-for="i in 6" :key="i" class="skeleton-card">
          <div class="skeleton-img"></div>
          <div class="skeleton-info">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line price"></div>
          </div>
        </div>
      </div>

      <!-- 搜索结果为空 -->
      <div class="empty-wrap" v-else-if="searchResult.length === 0 && hasSearched">
        <div class="empty-illustration">
          <van-icon name="search" class="empty-icon" />
          <div class="empty-rays"></div>
        </div>
        <p class="empty-title">未找到相关商品</p>
        <p class="empty-subtitle">换个关键词试试看吧</p>
        <div class="recommend-section">
          <div class="recommend-title">为你推荐</div>
          <div class="recommend-list">
            <div 
              v-for="item in recommendList" 
              :key="item.id"
              class="recommend-item"
              @click="searchByHistory(item.productName)"
            >
              <img :src="item.coverImg" />
              <span>{{ item.productName }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 瀑布流商品列表 -->
      <div class="waterfall-container" v-else-if="searchResult.length > 0">
        <div class="waterfall-column" ref="leftColumn">
          <div 
            v-for="item in leftColumnData" 
            :key="item.id"
            class="product-card"
            @click="goProductDetail(item.id)"
          >
            <div class="img-wrapper">
              <img 
                :src="item.coverImg || (item.imageList && item.imageList[0]?.imageUrl) || ''" 
                :alt="item.productName"
                @error="handleImgError($event)"
                loading="lazy"
              />
              <div class="tag" v-if="item.tag">{{ item.tag }}</div>
            </div>
            <div class="product-info">
              <h3 class="title" :title="item.productName">{{ item.productName }}</h3>
              <div class="meta">
                <div class="price-section">
                  <span class="price-symbol">¥</span>
                  <span class="price-num">{{ formatPrice(item.price) }}</span>
                  <span class="original-price" v-if="item.originalPrice > item.price">
                    ¥{{ item.originalPrice }}
                  </span>
                </div>
                <div class="sales" v-if="item.salesCount">已售 {{ formatSales(item.salesCount) }}</div>
              </div>
              <div class="shop-info" v-if="item.shopName">
                <van-icon name="shop-o" />
                <span>{{ item.shopName }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="waterfall-column" ref="rightColumn">
          <div 
            v-for="item in rightColumnData" 
            :key="item.id"
            class="product-card"
            @click="goProductDetail(item.id)"
          >
            <div class="img-wrapper">
              <img 
                :src="item.coverImg || (item.imageList && item.imageList[0]?.imageUrl) || ''" 
                :alt="item.productName"
                @error="handleImgError($event)"
                loading="lazy"
              />
              <div class="tag" v-if="item.tag">{{ item.tag }}</div>
            </div>
            <div class="product-info">
              <h3 class="title" :title="item.productName">{{ item.productName }}</h3>
              <div class="meta">
                <div class="price-section">
                  <span class="price-symbol">¥</span>
                  <span class="price-num">{{ formatPrice(item.price) }}</span>
                  <span class="original-price" v-if="item.originalPrice > item.price">
                    ¥{{ item.originalPrice }}
                  </span>
                </div>
                <div class="sales" v-if="item.salesCount">已售 {{ formatSales(item.salesCount) }}</div>
              </div>
              <div class="shop-info" v-if="item.shopName">
                <van-icon name="shop-o" />
                <span>{{ item.shopName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 初始状态 -->
      <div class="init-wrap" v-else>
        <div class="search-illustration">
          <div class="search-circle">
            <van-icon name="search" />
          </div>
          <div class="floating-tags">
            <span v-for="(tag, i) in floatingTags" :key="i" :style="tag.style">{{ tag.text }}</span>
          </div>
        </div>
        <p class="init-text">输入关键词开始探索</p>
      </div>
    </div>

    <!-- 加载更多 -->
    <div class="load-more" v-if="searchResult.length > 0 && !searchLoading">
      <van-loading v-if="loadingMore" size="20px" />
      <span v-else-if="noMore">已经到底啦 ~</span>
      <span v-else @click="loadMore">加载更多</span>
    </div>

    <TabBar v-if="!hasSearched" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TabBar from '@/components/TabBar.vue'
import { searchProductList } from '@/api/mobile/product'

const router = useRouter()
const route = useRoute()
const searchInput = ref(null)

// 核心状态
const searchKeyword = ref('')
const searchResult = ref([])
const searchLoading = ref(false)
const hasSearched = ref(false)
const historyList = ref([])
const hotSearchList = ref(['海贼王', '火影忍者', '初音未来', '超时空辉夜姬', '魔女之旅', '龙珠'])
const recommendList = ref([])
const showSuggestions = ref(false)
const isScrolled = ref(false)

// 瀑布流相关
const leftColumnData = ref([])
const rightColumnData = ref([])

// 筛选相关
const activeFilter = ref('default')
const priceSort = ref('desc') // desc 或 asc
const filters = [
  { key: 'default', label: '综合' },
  { key: 'sales', label: '销量' },
  { key: 'price', label: '价格' },
  { key: 'new', label: '新品' }
]

// 分页相关
const pageNum = ref(1)
const pageSize = 10
const loadingMore = ref(false)
const noMore = ref(false)

// 动画标签
const floatingTags = ref([
  { text: '手办', style: { top: '20%', left: '10%', animationDelay: '0s' } },
  { text: '周边', style: { top: '60%', left: '5%', animationDelay: '1s' } },
  { text: '鼠标键盘', style: { top: '30%', right: '10%', animationDelay: '2s' } },
  { text: '漫画原作', style: { top: '70%', right: '15%', animationDelay: '0.5s' } }
])

// 计算属性：价格排序图标
const priceSortIcon = computed(() => {
  return priceSort.value === 'desc' ? 'arrow-down' : 'arrow-up'
})

// ========== 方法定义 ==========

// 处理图片加载失败
const handleImgError = (e) => {
  e.target.src = ''
}

// 格式化价格
const formatPrice = (price) => {
  return Number(price).toFixed(2)
}

// 格式化销量
const formatSales = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count
}

// 分配瀑布流数据
const distributeWaterfall = (data) => {
  const left = []
  const right = []
  data.forEach((item, index) => {
    if (index % 2 === 0) {
      left.push(item)
    } else {
      right.push(item)
    }
  })
  leftColumnData.value = left
  rightColumnData.value = right
}

// 执行搜索
const handleSearch = async (keyword) => {
  // if (!keyword?.trim()) {
  //   return window.$message?.warning('请输入搜索关键词')
  // }

  showSuggestions.value = false
  addHistory(keyword.trim())
  
  searchLoading.value = true
  hasSearched.value = true
  pageNum.value = 1
  noMore.value = false

  try {
    const res = await searchProductList({
      keyword: keyword.trim(),
      pageNum: 1,
      pageSize,
      sort: activeFilter.value,
      order: activeFilter.value === 'price' ? priceSort.value : undefined
    })
    
    if (res.code === 0 && res.data) {
      searchResult.value = res.data.records || []
      distributeWaterfall(searchResult.value)
      
      // 如果没有结果，加载推荐商品
      if (searchResult.value.length === 0) {
        loadRecommendations()
      }
    }
  } catch (error) {
    console.error('搜索商品失败：', error)
    searchResult.value = []
    window.$message?.error('搜索失败，请稍后重试')
  } finally {
    searchLoading.value = false
  }
}

// 加载推荐商品
const loadRecommendations = async () => {
  try {
    const res = await searchProductList({ pageNum: 1, pageSize: 6, random: true })
    if (res.code === 0) {
      recommendList.value = res.data.records || []
    }
  } catch (e) {
    console.error('加载推荐失败', e)
  }
}

// 加载更多
const loadMore = async () => {
  if (loadingMore.value || noMore.value) return
  
  loadingMore.value = true
  pageNum.value++
  
  try {
    const res = await searchProductList({
      keyword: searchKeyword.value,
      pageNum: pageNum.value,
      pageSize,
      sort: activeFilter.value
    })
    
    if (res.code === 0 && res.data) {
      const newRecords = res.data.records || []
      if (newRecords.length === 0) {
        noMore.value = true
      } else {
        searchResult.value.push(...newRecords)
        distributeWaterfall(searchResult.value)
      }
    }
  } catch (error) {
    console.error('加载更多失败', error)
  } finally {
    loadingMore.value = false
  }
}

// 筛选处理
const handleFilter = (key) => {
  if (key === 'price') {
    if (activeFilter.value === 'price') {
      priceSort.value = priceSort.value === 'desc' ? 'asc' : 'desc'
    }
  }
  activeFilter.value = key
  handleSearch(searchKeyword.value)
}

// 取消搜索
const handleCancel = () => {
  if (hasSearched.value) {
    hasSearched.value = false
    searchResult.value = []
    searchKeyword.value = ''
    showSuggestions.value = false
  } else {
    router.back()
  }
}

// 清空关键词
const clearKeyword = () => {
  searchKeyword.value = ''
  searchInput.value?.focus()
  showSuggestions.value = true
}

// 处理焦点
const handleFocus = () => {
  if (!hasSearched.value) {
    showSuggestions.value = true
  }
}

const handleBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// 跳转商品详情
const goProductDetail = (productId) => {
  router.push({
    path: '/goods/detail/' + productId
  })
}

// ========== 搜索历史相关 ==========
const addHistory = (keyword) => {
  historyList.value = historyList.value.filter(item => item !== keyword)
  historyList.value.unshift(keyword)
  if (historyList.value.length > 10) {
    historyList.value = historyList.value.slice(0, 10)
  }
  localStorage.setItem('searchHistory', JSON.stringify(historyList.value))
}

const clearHistory = () => {
  historyList.value = []
  localStorage.removeItem('searchHistory')
}

const deleteHistory = (index) => {
  historyList.value.splice(index, 1)
  localStorage.setItem('searchHistory', JSON.stringify(historyList.value))
}

const searchByHistory = (keyword) => {
  searchKeyword.value = keyword
  handleSearch(keyword)
}

// 监听滚动
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

// ========== 生命周期 ==========
onMounted(() => {
  const history = localStorage.getItem('searchHistory')
  if (history) {
    historyList.value = JSON.parse(history)
  }
  
  window.addEventListener('scroll', handleScroll)
  
  // 自动聚焦
  nextTick(() => {
    searchInput.value?.focus()
  })
})

watch(
  () => route.query.keyword,
  (newVal) => {
    if (newVal) {
      const decodeKeyword = decodeURIComponent(newVal)
      searchKeyword.value = decodeKeyword
      handleSearch(decodeKeyword)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-top: 56px;
}

/* 顶部搜索栏 - 玻璃拟态效果 */
.search-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}

.search-header.is-scrolled {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-bottom-color: rgba(0, 0, 0, 0.05);
}

.search-bar-wrapper {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 10px;
}

.back-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 20px;
  border-radius: 50%;
  transition: background 0.2s;
}

.back-btn:active {
  background: rgba(0, 0, 0, 0.05);
}

.search-input-box {
  flex: 1;
  height: 40px;
  background: #f5f6f7;
  border-radius: 20px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.search-input-box:focus-within {
  background: #fff;
  border-color: #ff2442;
  box-shadow: 0 0 0 3px rgba(255, 36, 66, 0.1);
}

.search-icon {
  color: #999;
  font-size: 18px;
}

.search-input-box input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #333;
  outline: none;
  height: 100%;
}

.search-input-box input::placeholder {
  color: #bbb;
}

.clear-icon {
  color: #ccc;
  font-size: 16px;
  padding: 4px;
}

.search-btn {
  border: none;
  background: linear-gradient(135deg, #ff2442 0%, #ff5c7f 100%);
  color: white;
  font-size: 14px;
  font-weight: 500;
  padding: 0 16px;
  height: 36px;
  border-radius: 18px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.search-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(255, 36, 66, 0.3);
}

/* 搜索建议面板 */
.search-suggestions {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 99;
  padding: 16px;
  overflow-y: auto;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestion-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  font-weight: 500;
}

.section-title .delete-icon {
  margin-left: auto;
  color: #999;
  font-size: 16px;
  padding: 4px;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hot-tag {
  padding: 8px 16px;
  background: linear-gradient(135deg, #fff5f7 0%, #fff0f3 100%);
  border: 1px solid rgba(255, 36, 66, 0.1);
  border-radius: 16px;
  font-size: 13px;
  color: #ff2442;
  cursor: pointer;
  transition: all 0.3s;
  animation: fadeInUp 0.5s ease backwards;
}

.hot-tag:active {
  transform: scale(0.95);
  background: #ff2442;
  color: white;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
  margin: 0 -16px;
  padding-left: 16px;
  padding-right: 16px;
}

.history-item:active {
  background: #f9f9f9;
}

.history-item .van-icon:first-child {
  color: #ccc;
  margin-right: 10px;
  font-size: 16px;
}

.history-item .text {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.history-item .van-icon:last-child {
  color: #ddd;
  font-size: 14px;
  padding: 4px;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  background: #fff;
  padding: 12px 16px;
  gap: 24px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 56px;
  z-index: 90;
}

.filter-bar.sticky {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-item {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
  position: relative;
}

.filter-item.active {
  color: #ff2442;
  font-weight: 600;
}

.filter-item.active::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: #ff2442;
  border-radius: 2px;
}

/* 骨架屏 */
.skeleton-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 8px;
}

.skeleton-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.skeleton-img {
  width: 100%;
  height: 180px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-info {
  padding: 12px;
}

.skeleton-line {
  height: 14px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 8px;
  animation: shimmer 1.5s infinite;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-line.price {
  width: 40%;
  height: 18px;
  margin-top: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 瀑布流布局 */
.waterfall-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 8px;
  padding-bottom: 20px;
}

.waterfall-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.product-card:active {
  transform: translateY(2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.img-wrapper {
  position: relative;
  width: 100%;
  background: #f5f5f5;
}

.img-wrapper img {
  width: 100%;
  display: block;
  object-fit: cover;
}

.tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(255, 36, 66, 0.9);
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.product-info {
  padding: 10px;
}

.title {
  font-size: 13px;
  color: #333;
  line-height: 1.5;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 400;
  min-height: 39px;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price-symbol {
  font-size: 12px;
  color: #ff2442;
  font-weight: 600;
}

.price-num {
  font-size: 18px;
  color: #ff2442;
  font-weight: 700;
  font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
}

.original-price {
  font-size: 12px;
  color: #bbb;
  text-decoration: line-through;
}

.sales {
  font-size: 11px;
  color: #999;
}

.shop-info {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 11px;
  color: #999;
}

/* 空状态 */
.empty-wrap {
  padding: 40px 20px;
  text-align: center;
}

.empty-illustration {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 60px;
  color: #ddd;
  z-index: 2;
}

.empty-rays {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px dashed #eee;
  border-radius: 50%;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-title {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.empty-subtitle {
  font-size: 13px;
  color: #999;
  margin-bottom: 24px;
}

.recommend-section {
  text-align: left;
  margin-top: 32px;
}

.recommend-title {
  font-size: 14px;
  color: #333;
  font-weight: 600;
  margin-bottom: 12px;
  padding-left: 4px;
}

.recommend-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.recommend-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.recommend-item:active {
  transform: scale(0.95);
}

.recommend-item img {
  width: 100%;
  height: 80px;
  object-fit: cover;
}

.recommend-item span {
  display: block;
  padding: 6px;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

/* 初始状态 */
.init-wrap {
  padding: 60px 20px;
  text-align: center;
}

.search-illustration {
  position: relative;
  height: 200px;
  margin-bottom: 20px;
}

.search-circle {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #ff2442 0%, #ff5c7f 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
  top: 40px;
  box-shadow: 0 10px 30px rgba(255, 36, 66, 0.3);
  animation: float 3s ease-in-out infinite;
}

.search-circle .van-icon {
  font-size: 48px;
  color: white;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.floating-tags span {
  position: absolute;
  background: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  animation: float 3s ease-in-out infinite;
}

.init-text {
  color: #999;
  font-size: 14px;
  margin-top: 20px;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 13px;
}

/* TabBar覆盖 */
:deep(.van-tabbar) {
  height: 50px;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .search-page {
    background: #1a1a1a;
  }
  
  .search-header {
    background: rgba(30, 30, 30, 0.95);
  }
  
  .search-input-box {
    background: #2a2a2a;
  }
  
  .search-input-box input {
    color: #fff;
  }
  
  .product-card,
  .recommend-item,
  .history-item:active {
    background: #242424;
  }
  
  .title {
    color: #e0e0e0;
  }
}
</style>