<template>
  <div class="product-list-page">
<<<<<<< HEAD
    <!-- 玻璃拟态头部 -->
    <div class="page-header" :class="{ 'header-scrolled': isScrolled }">
      <div class="header-content">
        <div class="back-btn" @click="$router.back()">
          <van-icon name="arrow-left" />
        </div>
        <div class="header-center">
          <span class="header-title">{{ categoryName }}</span>
          <span class="header-count" v-if="totalCount > 0">{{ totalCount }}件</span>
        </div>
        <div class="search-btn" @click="$router.push('/search')">
          <van-icon name="search" />
        </div>
      </div>

      <!-- 排序/筛选栏 -->
      <div class="filter-bar">
        <div
          class="filter-item"
          :class="{ active: sortType === 'default' }"
          @click="setSort('default')"
        >综合</div>
        <div
          class="filter-item"
          :class="{ active: sortType === 'sales' }"
          @click="setSort('sales')"
        >
          销量
          <van-icon name="arrow-down" v-if="sortType !== 'sales'" />
          <van-icon name="arrow-down" v-else class="sort-active-icon" />
        </div>
        <div
          class="filter-item"
          :class="{ active: sortType === 'price' }"
          @click="setSort('price')"
        >
          价格
          <van-icon :name="priceAsc ? 'arrow-up' : 'arrow-down'" v-if="sortType === 'price'" class="sort-active-icon" />
          <van-icon name="arrow-down" v-else />
        </div>
        <div
          class="filter-item layout-toggle"
          @click="toggleLayout"
        >
          <van-icon :name="isGridLayout ? 'list-switch' : 'apps-o'" />
        </div>
      </div>
    </div>

    <!-- 骨架屏 -->
    <div v-if="loading && !productList.length" class="skeleton-wrap" :class="{ 'list-mode': !isGridLayout }">
      <template v-if="isGridLayout">
        <div class="skeleton-card" v-for="i in 6" :key="i">
          <div class="skeleton-img shimmer"></div>
          <div class="skeleton-info">
            <div class="skeleton-line shimmer" style="width:80%"></div>
            <div class="skeleton-line shimmer" style="width:55%"></div>
            <div class="skeleton-price shimmer"></div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="skeleton-row" v-for="i in 5" :key="i">
          <div class="skeleton-row-img shimmer"></div>
          <div class="skeleton-row-info">
            <div class="skeleton-line shimmer" style="width:75%"></div>
            <div class="skeleton-line shimmer" style="width:50%"></div>
            <div class="skeleton-price shimmer" style="width:30%"></div>
          </div>
        </div>
      </template>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!productList.length && !loading" class="empty-state">
      <div class="empty-icon">🎎</div>
      <p class="empty-title">该分类暂无商品</p>
      <p class="empty-desc">去其他分类逛逛吧</p>
      <div class="empty-btn" @click="$router.push('/')">返回首页</div>
=======
    <!-- 顶部导航 -->
    <div class="nav-bar">
      <van-icon name="arrow-left" class="back-btn" @click="$router.back()" />
      <span class="nav-title">{{ categoryName }}</span>
      <div class="nav-right">
        <van-icon name="search" class="nav-icon" @click="$router.push('/search')" />
      </div>
    </div>

    <!-- 排序/筛选栏 -->
    <div class="filter-bar">
      <div
        class="filter-item"
        :class="{ active: sortType === 'default' }"
        @click="setSort('default')"
      >综合</div>
      <div
        class="filter-item"
        :class="{ active: sortType === 'sales' }"
        @click="setSort('sales')"
      >
        销量
      </div>
      <div
        class="filter-item price-sort"
        :class="{ active: sortType === 'price' }"
        @click="setSort('price')"
      >
        价格
        <span class="sort-arrows">
          <van-icon name="arrow-up" :class="{ 'arrow-active': sortType === 'price' && priceAsc }" />
          <van-icon name="arrow-down" :class="{ 'arrow-active': sortType === 'price' && !priceAsc }" />
        </span>
      </div>
      <div class="filter-item layout-toggle" @click="toggleLayout">
        <van-icon :name="isGrid ? 'bars' : 'apps-o'" />
      </div>
    </div>

    <!-- 加载中 -->
    <div class="loading-wrap" v-if="loading && !productList.length">
      <van-loading type="spinner" color="#ff2442" size="28" />
      <span>加载中...</span>
    </div>

    <!-- 空状态 -->
    <div class="empty-wrap" v-else-if="!productList.length && !loading">
      <div class="empty-icon">🔍</div>
      <p class="empty-text">该分类暂无商品</p>
      <van-button round size="small" type="primary" class="empty-btn" @click="$router.push('/')">
        去首页逛逛
      </van-button>
>>>>>>> master
    </div>

    <!-- 商品列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" v-else>
      <van-list
        v-model:loading="loading"
        :finished="finished"
<<<<<<< HEAD
        finished-text="— 已经到底了 —"
=======
        finished-text="已经到底啦 ~"
>>>>>>> master
        @load="onLoad"
        class="product-list"
        :class="{ 'grid-layout': isGrid }"
      >
        <!-- 网格布局 -->
<<<<<<< HEAD
        <div class="product-grid" v-if="isGridLayout">
=======
        <template v-if="isGrid">
>>>>>>> master
          <div
            class="grid-card"
            v-for="product in sortedList"
            :key="product.id"
            @click="goDetail(product.id)"
          >
<<<<<<< HEAD
            <div class="card-img-wrap">
              <img :src="product.coverImg || ''" alt="" @error="handleImgError" />
              <div class="card-tag" v-if="product.tag">{{ product.tag.split(',')[0] }}</div>
              <div class="discount-badge" v-if="product.originalPrice && product.originalPrice > product.price">
                {{ Math.round((product.price / product.originalPrice) * 10) }}折
              </div>
            </div>
            <div class="card-info">
              <p class="card-name">{{ product.productName }}</p>
              <div class="card-bottom">
                <div class="card-price">
                  <span class="price-sym">¥</span>
                  <span class="price-val">{{ product.price }}</span>
                </div>
                <div class="card-sales" v-if="product.sales">{{ product.sales }}+人买</div>
              </div>
              <div class="card-original" v-if="product.originalPrice && product.originalPrice > product.price">
=======
            <div class="grid-img-wrap">
              <img
                :src="product.coverImg || ''"
                class="grid-img"
                alt="商品图片"
                @error="handleImgError($event)"
              />
              <div class="grid-tag" v-if="product.tag">{{ product.tag.split(',')[0] }}</div>
              <div class="discount-badge" v-if="product.originalPrice > product.price">
                -{{ Math.round((1 - product.price / product.originalPrice) * 100) }}%
              </div>
            </div>
            <div class="grid-info">
              <div class="grid-name">{{ product.productName }}</div>
              <div class="grid-bottom">
                <div class="grid-price">
                  <span class="price-sym">¥</span>
                  <span class="price-int">{{ Math.floor(product.price) }}</span>
                  <span class="price-dec">.{{ (product.price % 1).toFixed(2).slice(2) }}</span>
                </div>
                <div class="grid-sales" v-if="product.sales">{{ product.sales }}人付款</div>
              </div>
              <div class="grid-original" v-if="product.originalPrice > product.price">
>>>>>>> master
                ¥{{ product.originalPrice }}
              </div>
            </div>
          </div>
<<<<<<< HEAD
        </div>

        <!-- 列表布局 -->
        <div class="product-rows" v-else>
          <div
            class="row-card"
=======
        </template>

        <!-- 列表布局 -->
        <template v-else>
          <div
            class="list-card"
>>>>>>> master
            v-for="product in sortedList"
            :key="product.id"
            @click="goDetail(product.id)"
          >
<<<<<<< HEAD
            <div class="row-img-wrap">
              <img :src="product.coverImg || ''" alt="" @error="handleImgError" />
              <div class="row-tag" v-if="product.tag">{{ product.tag.split(',')[0] }}</div>
            </div>
            <div class="row-info">
              <p class="row-name">{{ product.productName }}</p>
              <div class="row-tags" v-if="product.categoryName">
                <span class="row-cat">{{ product.categoryName }}</span>
              </div>
              <div class="row-bottom">
                <div class="row-price">
                  <span class="price-sym">¥</span>
                  <span class="price-val">{{ product.price }}</span>
                  <span class="row-original" v-if="product.originalPrice && product.originalPrice > product.price">
                    ¥{{ product.originalPrice }}
                  </span>
                </div>
                <div class="row-sales" v-if="product.sales">已售 {{ product.sales }}+</div>
=======
            <div class="list-img-wrap">
              <img
                :src="product.coverImg || ''"
                class="list-img"
                alt="商品图片"
                @error="handleImgError($event)"
              />
              <div class="discount-badge" v-if="product.originalPrice > product.price">
                -{{ Math.round((1 - product.price / product.originalPrice) * 100) }}%
              </div>
            </div>
            <div class="list-info">
              <div class="list-name">{{ product.productName }}</div>
              <div class="list-tag-row" v-if="product.tag">
                <span class="list-tag" v-for="t in product.tag.split(',').slice(0,2)" :key="t">{{ t }}</span>
              </div>
              <div class="list-bottom">
                <div class="list-price">
                  <span class="price-sym">¥</span>
                  <span class="price-main">{{ product.price }}</span>
                  <span class="price-original" v-if="product.originalPrice > product.price">
                    ¥{{ product.originalPrice }}
                  </span>
                </div>
                <div class="list-sales" v-if="product.sales">
                  <van-icon name="fire-o" size="11" />
                  {{ product.sales }}人付款
                </div>
>>>>>>> master
              </div>
            </div>
          </div>
        </template>
      </van-list>
    </van-pull-refresh>
<<<<<<< HEAD
=======

    <TabBar />
>>>>>>> master
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductListByFirstCategory } from '@/api/mobile/product'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const productList = ref([])
const pageNum = ref(1)
const pageSize = ref(20)
const totalPages = ref(0)
<<<<<<< HEAD
const totalCount = ref(0)
const isScrolled = ref(false)
const isGridLayout = ref(true)
const sortType = ref('default')
const priceAsc = ref(true)
=======

// 排序和布局
const sortType = ref('default')  // default | sales | price
const priceAsc = ref(true)
const isGrid = ref(true)
>>>>>>> master

const firstCategoryId = computed(() => {
  const id = route.query.firstCategoryId
  return id ? Number(id) : ''
})

const categoryName = computed(() => {
<<<<<<< HEAD
  const map = { 1: '手办', 2: '周边', 3: '图书漫画', 4: '漫展演出', 5: 'IP', 6: '品牌' }
  return map[firstCategoryId.value] || '商品列表'
})

const sortedList = computed(() => {
  const list = [...productList.value]
  if (sortType.value === 'sales') return list.sort((a, b) => (b.sales || 0) - (a.sales || 0))
  if (sortType.value === 'price') {
    return priceAsc.value
      ? list.sort((a, b) => a.price - b.price)
      : list.sort((a, b) => b.price - a.price)
=======
  const categoryMap = {
    1: '手办', 2: '周边', 3: '图书漫画',
    4: '漫展演出', 5: 'IP', 6: '品牌'
>>>>>>> master
  }
  return list
})

<<<<<<< HEAD
const setSort = (type) => {
  if (type === 'price' && sortType.value === 'price') {
    priceAsc.value = !priceAsc.value
  } else {
    sortType.value = type
  }
}

const toggleLayout = () => { isGridLayout.value = !isGridLayout.value }

=======
const sortedList = computed(() => {
  const list = [...productList.value]
  if (sortType.value === 'sales') {
    return list.sort((a, b) => (b.sales || 0) - (a.sales || 0))
  }
  if (sortType.value === 'price') {
    return list.sort((a, b) => priceAsc.value ? a.price - b.price : b.price - a.price)
  }
  return list
})

const setSort = (type) => {
  if (type === 'price' && sortType.value === 'price') {
    priceAsc.value = !priceAsc.value
  } else {
    sortType.value = type
    priceAsc.value = true
  }
}

const toggleLayout = () => { isGrid.value = !isGrid.value }

>>>>>>> master
const handleImgError = (e) => { e.target.src = '' }

const goDetail = (id) => router.push({ name: 'GoodsDetail', params: { id } })

const loadProductList = async (isRefresh = false) => {
  if (loading.value) return
  if (!firstCategoryId.value) { finished.value = true; return }
<<<<<<< HEAD

=======
>>>>>>> master
  if (isRefresh) {
    pageNum.value = 1
    productList.value = []
    finished.value = false
    totalPages.value = 0
  }
  loading.value = true
  try {
    const res = await getProductListByFirstCategory(firstCategoryId.value, {
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    if (res.code === 0 && res.data) {
      const list = res.data.records || []
      totalPages.value = res.data.pages || 0
<<<<<<< HEAD
      totalCount.value = res.data.total || 0
=======
>>>>>>> master
      productList.value = isRefresh ? list : [...productList.value, ...list]
      finished.value = pageNum.value >= totalPages.value
    }
  } catch (e) {
<<<<<<< HEAD
=======
    console.error('加载商品失败：', e)
>>>>>>> master
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onRefresh = () => loadProductList(true)
const onLoad = () => {
  if (pageNum.value < totalPages.value) { pageNum.value++; loadProductList() }
  else { loading.value = false; finished.value = true }
}

watch(() => firstCategoryId.value, () => loadProductList(true), { immediate: true })
</script>

<style scoped>
.product-list-page {
<<<<<<< HEAD
  background: #f5f7fa;
  min-height: 100vh;
  padding-top: 100px;
}

/* 头部 */
.page-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s;
}
.page-header.header-scrolled {
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  gap: 12px;
}

.back-btn, .search-btn {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  font-size: 18px; color: #333;
  cursor: pointer; flex-shrink: 0;
}

.header-center {
  flex: 1;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
}
.header-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
}
.header-count {
  font-size: 12px;
  color: #999;
}

/* 筛选栏 */
.filter-bar {
=======
  min-height: 100vh;
  background: #f4f5f7;
  padding-bottom: 60px;
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
  flex-shrink: 0;
}
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
}
.nav-right {
  flex-shrink: 0;
  width: 24px;
  display: flex;
  justify-content: flex-end;
}
.nav-icon {
  font-size: 20px;
  color: #555;
  cursor: pointer;
}

/* ===== 筛选栏 ===== */
.filter-bar {
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 4px;
  position: sticky;
  top: 48px;
  z-index: 99;
}
.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 40px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
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
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: #ff2442;
  border-radius: 2px;
}
.price-sort {
  gap: 2px;
}
.sort-arrows {
  display: flex;
  flex-direction: column;
  gap: 0;
  line-height: 1;
}
.sort-arrows .van-icon {
  font-size: 10px;
  color: #ccc;
  line-height: 1.1;
}
.sort-arrows .arrow-active {
  color: #ff2442;
}
.layout-toggle {
  flex: 0 0 44px;
  font-size: 18px;
  color: #999;
}

/* ===== 加载/空状态 ===== */
.loading-wrap {
>>>>>>> master
  display: flex;
  flex-direction: column;
  align-items: center;
<<<<<<< HEAD
  height: 40px;
  padding: 0 16px;
  border-top: 1px solid rgba(0,0,0,0.04);
  gap: 4px;
}
.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  height: 100%;
  border-radius: 6px;
  transition: all 0.2s;
}
.filter-item.active {
  color: #ff2442;
  font-weight: 600;
}
.filter-item.layout-toggle {
  flex: 0 0 40px;
  color: #999;
}
.sort-active-icon {
  color: #ff2442;
}

/* 骨架屏 */
.skeleton-wrap {
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.skeleton-wrap.list-mode {
  grid-template-columns: 1fr;
}
.skeleton-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}
.skeleton-img {
  width: 100%; padding-top: 100%;
}
.skeleton-row {
  background: #fff;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  gap: 12px;
}
.skeleton-row-img {
  width: 90px; height: 90px;
  border-radius: 12px; flex-shrink: 0;
}
.skeleton-row-info {
  flex: 1;
  display: flex; flex-direction: column; gap: 8px;
  padding-top: 4px;
}
.skeleton-info {
  padding: 10px;
  display: flex; flex-direction: column; gap: 8px;
}
.skeleton-line {
  height: 12px; border-radius: 6px;
}
.skeleton-price {
  height: 16px; width: 40%; border-radius: 6px;
}
.shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
=======
  gap: 12px;
  padding: 60px 0;
  color: #999;
  font-size: 14px;
}
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

/* ===== 列表容器 ===== */
.product-list { padding: 10px; }
.product-list.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 10px;
}

/* ===== 网格卡片 ===== */
.grid-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.2s;
}
.grid-card:active { transform: scale(0.97); }

.grid-img-wrap {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: #f8f8f8;
  overflow: hidden;
}
.grid-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
.grid-card:hover .grid-img { transform: scale(1.04); }

.grid-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 10px;
}
.discount-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
>>>>>>> master
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 空状态 */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 80px 20px;
}
.empty-icon { font-size: 72px; margin-bottom: 16px; }
.empty-title { font-size: 16px; font-weight: 600; color: #333; margin: 0 0 8px; }
.empty-desc { font-size: 13px; color: #999; margin: 0 0 24px; }
.empty-btn {
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  color: #fff; padding: 10px 32px;
  border-radius: 24px; font-size: 14px; font-weight: 600; cursor: pointer;
}

/* 列表容器 */
.product-list { padding: 12px; }

<<<<<<< HEAD
/* 网格布局 */
.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.grid-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.grid-card:active {
  transform: scale(0.97);
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
}
.card-img-wrap {
  position: relative;
  width: 100%; padding-top: 100%;
  background: #f8f8f8; overflow: hidden;
}
.card-img-wrap img {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.3s;
}
.grid-card:active .card-img-wrap img { transform: scale(1.04); }
.card-tag {
  position: absolute; top: 8px; left: 8px;
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  color: #fff; font-size: 10px; padding: 2px 6px;
  border-radius: 8px; font-weight: 600;
}
.discount-badge {
  position: absolute; top: 8px; right: 8px;
  background: rgba(255,36,66,0.88);
  color: #fff; font-size: 10px; padding: 2px 5px;
  border-radius: 6px; font-weight: 600;
}
.card-info { padding: 10px 12px 12px; }
.card-name {
  font-size: 13px; color: #1a1a1a; margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden; line-height: 1.5; font-weight: 500;
}
.card-bottom {
  display: flex; align-items: center; justify-content: space-between;
}
.card-price { display: flex; align-items: baseline; color: #ff2442; }
.price-sym { font-size: 11px; font-weight: 600; }
.price-val { font-size: 18px; font-weight: 700; line-height: 1; }
.card-sales { font-size: 10px; color: #bbb; }
.card-original { font-size: 11px; color: #ccc; text-decoration: line-through; margin-top: 2px; }

/* 列表布局 */
.product-rows { display: flex; flex-direction: column; gap: 10px; }
.row-card {
  background: #fff;
  border-radius: 16px;
  padding: 12px;
  display: flex; gap: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.2s;
}
.row-card:active { transform: scale(0.98); }
.row-img-wrap {
  position: relative;
  width: 100px; height: 100px;
  border-radius: 12px; overflow: hidden;
  background: #f8f8f8; flex-shrink: 0;
}
.row-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
.row-tag {
  position: absolute; bottom: 6px; left: 6px;
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  color: #fff; font-size: 9px; padding: 1px 5px;
  border-radius: 6px; font-weight: 600;
}
.row-info {
  flex: 1; display: flex; flex-direction: column; justify-content: space-between;
  min-width: 0;
}
.row-name {
  font-size: 14px; color: #1a1a1a; margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden; line-height: 1.5; font-weight: 500;
}
.row-tags { display: flex; gap: 6px; margin-top: 4px; }
.row-cat {
  font-size: 11px; color: #ff2442;
  background: rgba(255,36,66,0.08);
  padding: 2px 7px; border-radius: 8px;
}
.row-bottom {
  display: flex; align-items: center; justify-content: space-between;
}
.row-price { display: flex; align-items: baseline; gap: 6px; }
.row-price .price-sym { font-size: 12px; font-weight: 600; color: #ff2442; }
.row-price .price-val { font-size: 20px; font-weight: 700; color: #ff2442; line-height: 1; }
.row-original { font-size: 12px; color: #ccc; text-decoration: line-through; }
.row-sales { font-size: 12px; color: #bbb; }

/* vant 覆盖 */
:deep(.van-list__finished-text) {
  color: #bbb; font-size: 12px; padding: 20px 0;
}
=======
.grid-info {
  padding: 10px 10px 12px;
}
.grid-name {
  font-size: 13px;
  color: #1a1a1a;
  font-weight: 500;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
  min-height: 36px;
}
.grid-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.grid-price {
  display: flex;
  align-items: baseline;
  color: #ff2442;
}
.price-sym { font-size: 11px; font-weight: 600; }
.price-int { font-size: 18px; font-weight: 700; }
.price-dec { font-size: 12px; font-weight: 600; }
.grid-sales {
  font-size: 10px;
  color: #aaa;
}
.grid-original {
  font-size: 11px;
  color: #bbb;
  text-decoration: line-through;
  margin-top: 2px;
}

/* ===== 列表卡片 ===== */
.list-card {
  display: flex;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.2s;
}
.list-card:active { transform: scale(0.98); }

.list-img-wrap {
  position: relative;
  width: 110px;
  height: 110px;
  flex-shrink: 0;
  background: #f8f8f8;
  overflow: hidden;
}
.list-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.list-img-wrap .discount-badge {
  top: 6px;
  right: 6px;
}

.list-info {
  flex: 1;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}
.list-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.list-tag-row {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
.list-tag {
  font-size: 10px;
  color: #667eea;
  background: #f0f2ff;
  padding: 2px 7px;
  border-radius: 8px;
}
.list-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.list-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.list-price .price-sym { font-size: 12px; color: #ff2442; font-weight: 600; }
.list-price .price-main { font-size: 20px; font-weight: 700; color: #ff2442; }
.price-original {
  font-size: 12px;
  color: #bbb;
  text-decoration: line-through;
}
.list-sales {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #aaa;
}

/* ===== Vant 覆盖 ===== */
:deep(.van-list__finished-text) {
  color: #bbb;
  font-size: 12px;
  padding: 20px 0;
}
:deep(.van-pull-refresh__head) { text-align: center; }
>>>>>>> master
</style>
