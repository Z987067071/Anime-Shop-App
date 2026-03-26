<template>
  <div class="comic-con-page">
    <div class="nav-header" :class="{ 'is-scrolled': isScrolled }">
      <div class="nav-content">
        <div class="back-btn" @click="$router.back()">
          <van-icon name="arrow-left" />
        </div>
        <div class="nav-title">漫展票务</div>
        <div class="search-btn" @click="showSearch = true">
          <van-icon name="search" />
        </div>
      </div>
    </div>

    <!-- 城市筛选栏 - 横向滚动 -->
    <!-- <div class="city-filter" :class="{ 'filter-fixed': isScrolled }">
      <div class="filter-scroll">
        <div 
          v-for="city in cityList" 
          :key="city.value"
          class="city-item"
          :class="{ active: currentCity === city.value }"
          @click="handleCityFilter(city.value)"
        >
          {{ city.label }}
        </div>
      </div>
    </div> -->

    <!-- 状态筛选标签 -->
    <!-- <div class="status-filter" v-if="!isScrolled">
      <div 
        v-for="status in statusList" 
        :key="status.value"
        class="status-tag"
        :class="{ active: currentStatus === status.value }"
        @click="handleStatusFilter(status.value)"
      >
        {{ status.label }}
      </div>
    </div> -->

    <!-- 加载中骨架屏 -->
    <div class="skeleton-wrap" v-if="loading && comicConList.length === 0">
      <div v-for="i in 4" :key="i" class="skeleton-card">
        <div class="skeleton-img"></div>
        <div class="skeleton-info">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line price"></div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-wrap" v-else-if="comicConList.length === 0 && !loading">
      <div class="empty-illustration">
        <van-icon name="calendar-o" class="empty-icon" />
        <div class="empty-rays"></div>
      </div>
      <p class="empty-title">暂无漫展信息</p>
      <p class="empty-subtitle">去看看其他城市的漫展吧 ~</p>
    </div>

    <div class="waterfall-container" v-else>
      <div class="waterfall-column" ref="leftColumn">
        <div 
          v-for="item in leftColumnData" 
          :key="item.id"
          class="comic-card"
          @click="toDetail(item.id)"
        >
          <div class="card-image-wrapper">
            <img 
              :src="item.imageList && item.imageList.length > 0 ? item.imageList[0].imageUrl : (item.coverImg || defaultCover)" 
              class="card-image"
              loading="lazy"
              @error="handleImgError"
            />
            <div class="status-badge" :class="getStatusClass(item)">
              {{ getStatusText(item) }}
            </div>
            <div class="fav-btn" @click.stop="toggleFav(item)">
              <van-icon :name="item.isFav ? 'like' : 'like-o'" :color="item.isFav ? '#ff2442' : '#fff'" size="18" />
            </div>
          </div>
          
          <div class="card-content">
            <h3 class="card-title">{{ item.productName }}</h3>
            
            <div class="tag-group" v-if="item.tag">
              <span 
                v-for="(tag, idx) in item.tag.split(',').slice(0, 2)" 
                :key="idx" 
                class="mini-tag"
              >
                {{ tag }}
              </span>
            </div>

            <div class="meta-info">
              <div class="meta-item" v-if="item.venue">
                <van-icon name="location-o" size="12" color="#999" />
                <span class="venue-text">{{ item.venue }}</span>
              </div>
            </div>

            <div class="card-footer">
              <div class="price-section">
                <span class="price-symbol">¥</span>
                <span class="price-num">{{ item.price || 0 }}</span>
                <span class="price-unit">起</span>
                <span v-if="item.originalPrice && item.originalPrice > item.price" class="original-price">
                  ¥{{ item.originalPrice }}
                </span>
              </div>
              <div class="stock-badge" :class="{ 'low-stock': item.stock < 50 }">
                {{ item.stock < 50 ? '即将售罄' : '有票' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="waterfall-column" ref="rightColumn">
        <div 
          v-for="item in rightColumnData" 
          :key="item.id"
          class="comic-card"
          @click="toDetail(item.id)"
        >
          <div class="card-image-wrapper">
            <img 
              :src="item.imageList && item.imageList.length > 0 ? item.imageList[0].imageUrl : (item.coverImg || defaultCover)" 
              class="card-image"
              loading="lazy"
              @error="handleImgError"
            />
            <div class="status-badge" :class="getStatusClass(item)">
              {{ getStatusText(item) }}
            </div>
            <div class="fav-btn" @click.stop="toggleFav(item)">
              <van-icon :name="item.isFav ? 'like' : 'like-o'" :color="item.isFav ? '#ff2442' : '#fff'" size="18" />
            </div>
          </div>
          
          <div class="card-content">
            <h3 class="card-title">{{ item.productName }}</h3>
            
            <div class="tag-group" v-if="item.tag">
              <span 
                v-for="(tag, idx) in item.tag.split(',').slice(0, 2)" 
                :key="idx" 
                class="mini-tag"
              >
                {{ tag }}
              </span>
            </div>

            <div class="meta-info">
              <div class="meta-item" v-if="item.venue">
                <van-icon name="location-o" size="12" color="#999" />
                <span class="venue-text">{{ item.venue }}</span>
              </div>
            </div>

            <div class="card-footer">
              <div class="price-section">
                <span class="price-symbol">¥</span>
                <span class="price-num">{{ item.price || 0 }}</span>
                <span class="price-unit">起</span>
                <span v-if="item.originalPrice && item.originalPrice > item.price" class="original-price">
                  ¥{{ item.originalPrice }}
                </span>
              </div>
              <div class="stock-badge" :class="{ 'low-stock': item.stock < 50 }">
                {{ item.stock < 50 ? '即将售罄' : '有票' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="load-more" v-if="comicConList.length > 0">
      <van-loading v-if="loading" size="20px" color="#ff2442" />
      <span v-else-if="finished">已经到底啦 ~</span>
      <span v-else @click="onLoad">加载更多</span>
    </div>

    <van-back-top target=".comic-con-page" bottom="30" right="20" visibility-height="200">
      <div class="back-top-btn">
        <van-icon name="arrow-up" color="#ff2442" />
      </div>
    </van-back-top>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';

import { searchProductList } from '@/api/mobile/product';

const router = useRouter();

const defaultCover = 'https://www.helloimg.com/i/2026/01/27/69783066c0b56.png';

const loading = ref(false);
const finished = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const comicConList = ref([]);
const isScrolled = ref(false);
const showSearch = ref(false);

const currentCity = ref('all');
const currentStatus = ref('all');

const cityList = [
  { label: '全部', value: 'all' },
  { label: '上海', value: '上海' },
  { label: '北京', value: '北京' },
  { label: '广州', value: '广州' },
  { label: '深圳', value: '深圳' },
  { label: '成都', value: '成都' },
  { label: '杭州', value: '杭州' },
  { label: '武汉', value: '武汉' },
  { label: '南京', value: '南京' },
  { label: '重庆', value: '重庆' },
];

const statusList = [
  { label: '全部', value: 'all' },
  { label: '即将开售', value: 'upcoming' },
  { label: '热销中', value: 'onsale' },
  { label: '即将开展', value: 'opening' },
];

const leftColumnData = computed(() => {
  return comicConList.value.filter((_, index) => index % 2 === 0);
});

const rightColumnData = computed(() => {
  return comicConList.value.filter((_, index) => index % 2 === 1);
});

const getStatusClass = (item) => {
  const now = new Date();
  const startTime = item.startTime ? new Date(item.startTime) : null;
  const endTime = item.endTime ? new Date(item.endTime) : null;
  const saleStartTime = item.saleStartTime ? new Date(item.saleStartTime) : null;
  
  if (endTime && now > endTime) return 'status-ended';
  if (startTime && now >= startTime && now <= endTime) return 'status-ongoing';
  if (saleStartTime && now < saleStartTime) return 'status-upcoming';
  if (item.stock === 0) return 'status-soldout';
  return 'status-onsale';
};

const getStatusText = (item) => {
  const now = new Date();
  const startTime = item.startTime ? new Date(item.startTime) : null;
  const endTime = item.endTime ? new Date(item.endTime) : null;
  const saleStartTime = item.saleStartTime ? new Date(item.saleStartTime) : null;
  
  if (endTime && now > endTime) return '已结束';
  if (startTime && now >= startTime && now <= endTime) return '进行中';
  if (saleStartTime && now < saleStartTime) return '即将开售';
  if (item.stock === 0) return '售罄';
  return '热销中';
};

const handleImgError = (e) => {
  e.target.src = defaultCover;
};

const toggleFav = (item) => {
  item.isFav = !item.isFav;
  showToast(item.isFav ? '已收藏' : '取消收藏');
};

const handleCityFilter = (city) => {
  currentCity.value = city;
  pageNum.value = 1;
  finished.value = false;
  comicConList.value = [];
  loadComicConList(false);
};

const handleStatusFilter = (status) => {
  currentStatus.value = status;
  pageNum.value = 1;
  finished.value = false;
  comicConList.value = [];
  loadComicConList(false);
};

const loadComicConList = async (isLoadMore = false) => {
  if (loading.value) return;
  
  try {
    loading.value = true;
    
    const params = {
      keyword: '漫展',
      isTicket: 1,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    };

    if (currentCity.value !== 'all') {
      params.city = currentCity.value;
    }

    const now = new Date();
    if (currentStatus.value === 'upcoming') {
      params.saleStatus = 0;
    } else if (currentStatus.value === 'onsale') {
      params.saleStatus = 1;
    } else if (currentStatus.value === 'opening') {
      params.startTimeBegin = now.toISOString();
      params.startTimeEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    const response = await searchProductList(params);

    if (response.code === 0) {
      const data = response.data || {};
      const records = data.records || [];
      
      const processedRecords = records.map(item => ({
        ...item,
        isFav: false,
      }));
      
      if (isLoadMore) {
        comicConList.value.push(...processedRecords);
      } else {
        comicConList.value = processedRecords;
      }

      finished.value = records.length < pageSize.value;
    } else {
      showToast(response.msg || '加载失败');
      finished.value = true;
    }
  } catch (error) {
    console.error('加载漫展列表失败：', error);
    showToast('网络错误，加载失败');
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

const onLoad = () => {
  if (finished.value || loading.value) return;
  pageNum.value++;
  loadComicConList(true);
};

const toDetail = (id) => {
  router.push({ path: `/goods/detail/${id}` });
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

onMounted(() => {
  loadComicConList(false);
  window.addEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.comic-con-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-top: 60px;
}

.nav-header {
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

.nav-header.is-scrolled {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-bottom-color: rgba(0, 0, 0, 0.05);
}

.nav-content {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  height: 44px;
}

.back-btn, .search-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 20px;
  border-radius: 50%;
  transition: background 0.2s;
}

.back-btn:active, .search-btn:active {
  background: rgba(0, 0, 0, 0.05);
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.city-filter {
  position: fixed;
  top: 44px;
  left: 0;
  right: 0;
  z-index: 99;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.filter-fixed {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-scroll {
  display: flex;
  overflow-x: auto;
  padding: 0 12px;
  gap: 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-scroll::-webkit-scrollbar {
  display: none;
}

.city-item {
  flex-shrink: 0;
  padding: 6px 14px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  border-radius: 16px;
  transition: all 0.3s;
  border: 1px solid transparent;
  white-space: nowrap;
}

.city-item.active {
  background: linear-gradient(135deg, #ff2442 0%, #ff5c7f 100%);
  color: #fff;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(255, 36, 66, 0.3);
}

/* 状态筛选标签 */
.status-filter {
  display: flex;
  padding: 12px;
  gap: 10px;
  background: #fff;
  overflow-x: auto;
  scrollbar-width: none;
}

.status-filter::-webkit-scrollbar {
  display: none;
}

.status-tag {
  padding: 6px 14px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  border-radius: 14px;
  white-space: nowrap;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.status-tag.active {
  background: #fff0f3;
  color: #ff2442;
  border-color: rgba(255, 36, 66, 0.2);
  font-weight: 500;
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
  height: 200px;
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

/* 瀑布流容器 */
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

/* 漫展卡片 */
.comic-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;
}

.comic-card:active {
  transform: translateY(2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3比例 */
  overflow: hidden;
  background: #f0f0f0;
}

.card-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.comic-card:hover .card-image {
  transform: scale(1.05);
}

/* 状态角标 */
.status-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 6px;
  font-weight: 600;
  color: #fff;
  z-index: 2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.status-upcoming { background: linear-gradient(135deg, #23ade5 0%, #1e9bde 100%); }
.status-onsale { background: linear-gradient(135deg, #ff2442 0%, #ff5c7f 100%); }
.status-ongoing { background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%); }
.status-ended { background: #999; }
.status-soldout { background: #666; }

/* 收藏按钮 */
.fav-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  z-index: 2;
  transition: all 0.3s;
}

.fav-btn:active {
  transform: scale(0.9);
  background: rgba(255, 36, 66, 0.8);
}

/* 卡片内容 */
.card-content {
  padding: 10px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 40px;
}

/* 标签组 */
.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.mini-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f0f0f0;
  color: #666;
}

/* 元信息 */
.meta-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #999;
}

.venue-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}

/* 卡片底部 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f5f5f5;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 2px;
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
  letter-spacing: -0.5px;
}

.price-unit {
  font-size: 11px;
  color: #999;
  margin-left: 2px;
}

.original-price {
  font-size: 11px;
  color: #bbb;
  text-decoration: line-through;
  margin-left: 4px;
}

.stock-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #d9f7be;
}

.stock-badge.low-stock {
  background: #fff2f0;
  color: #ff4d4f;
  border-color: #ffccc7;
}

/* 空状态 */
.empty-wrap {
  padding: 60px 20px;
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
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 13px;
}

/* 返回顶部按钮 */
.back-top-btn {
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  font-size: 20px;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .comic-con-page {
    background: #1a1a1a;
  }
  
  .nav-header,
  .city-filter {
    background: rgba(30, 30, 30, 0.95);
  }
  
  .nav-title {
    color: #fff;
  }
  
  .back-btn, .search-btn {
    color: #fff;
  }
  
  .city-item,
  .status-tag {
    background: #2a2a2a;
    color: #ccc;
  }
  
  .comic-card {
    background: #242424;
  }
  
  .card-title {
    color: #e0e0e0;
  }
  
  .mini-tag {
    background: #333;
    color: #999;
  }
  
  .meta-item {
    color: #777;
  }
}
</style>