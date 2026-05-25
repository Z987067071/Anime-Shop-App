<template>
  <div class="product-list-page">
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
    </div>

    <!-- 商品列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" v-else>
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="已经到底啦 ~"
        @load="onLoad"
        class="product-list"
        :class="{ 'grid-layout': isGrid }"
      >
        <!-- 网格布局 -->
        <template v-if="isGrid">
          <div
            class="grid-card"
            v-for="product in sortedList"
            :key="product.id"
            @click="goDetail(product.id)"
          >
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
                ¥{{ product.originalPrice }}
              </div>
            </div>
          </div>
        </template>

        <!-- 列表布局 -->
        <template v-else>
          <div
            class="list-card"
            v-for="product in sortedList"
            :key="product.id"
            @click="goDetail(product.id)"
          >
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
              </div>
            </div>
          </div>
        </template>
      </van-list>
    </van-pull-refresh>

    <TabBar />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TabBar from '@/components/TabBar.vue'
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

// 排序和布局
const sortType = ref('default')  // default | sales | price
const priceAsc = ref(true)
const isGrid = ref(true)

const firstCategoryId = computed(() => {
  const id = route.query.firstCategoryId
  return id ? Number(id) : ''
})

const categoryName = computed(() => {
  const categoryMap = {
    1: '手办', 2: '周边', 3: '图书漫画',
    4: '漫展演出', 5: 'IP', 6: '品牌'
  }
  return categoryMap[firstCategoryId.value] || '商品列表'
})

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

const handleImgError = (e) => { e.target.src = '' }

const goDetail = (id) => router.push({ name: 'GoodsDetail', params: { id } })

const loadProductList = async (isRefresh = false) => {
  if (loading.value) return
  if (!firstCategoryId.value) { finished.value = true; return }
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
      productList.value = isRefresh ? list : [...productList.value, ...list]
      finished.value = pageNum.value >= totalPages.value
    }
  } catch (e) {
    console.error('加载商品失败：', e)
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onRefresh = () => loadProductList(true)
const onLoad = () => {
  if (pageNum.value < totalPages.value) {
    pageNum.value++
    loadProductList(false)
  } else {
    loading.value = false
    finished.value = true
  }
}

watch(() => firstCategoryId.value, () => loadProductList(true), { immediate: true })
</script>

<style scoped>
.product-list-page {
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
  display: flex;
  flex-direction: column;
  align-items: center;
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
}

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
</style>
