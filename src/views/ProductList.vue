<template>
  <div class="product-list-page">
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
    </div>

    <!-- 商品列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" v-else>
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="— 已经到底了 —"
        @load="onLoad"
        class="product-list"
      >
        <!-- 网格布局 -->
        <div class="product-grid" v-if="isGridLayout">
          <div
            class="grid-card"
            v-for="product in sortedList"
            :key="product.id"
            @click="goDetail(product.id)"
          >
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
                ¥{{ product.originalPrice }}
              </div>
            </div>
          </div>
        </div>

        <!-- 列表布局 -->
        <div class="product-rows" v-else>
          <div
            class="row-card"
            v-for="product in sortedList"
            :key="product.id"
            @click="goDetail(product.id)"
          >
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
              </div>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
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
const totalCount = ref(0)
const isScrolled = ref(false)
const isGridLayout = ref(true)
const sortType = ref('default')
const priceAsc = ref(true)

const firstCategoryId = computed(() => {
  const id = route.query.firstCategoryId
  return id ? Number(id) : ''
})

const categoryName = computed(() => {
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
  }
  return list
})

const setSort = (type) => {
  if (type === 'price' && sortType.value === 'price') {
    priceAsc.value = !priceAsc.value
  } else {
    sortType.value = type
  }
}

const toggleLayout = () => { isGridLayout.value = !isGridLayout.value }

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
      totalCount.value = res.data.total || 0
      productList.value = isRefresh ? list : [...productList.value, ...list]
      finished.value = pageNum.value >= totalPages.value
    }
  } catch (e) {
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
  display: flex;
  align-items: center;
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
</style>
