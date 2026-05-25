<template>
  <div class="goods-list-page">
    <!-- 顶部导航 -->
    <div class="nav-bar">
      <van-icon name="arrow-left" class="back-btn" @click="$router.back()" />
      <span class="nav-title">{{ decodeCategoryName }}</span>
      <van-icon name="search" class="nav-icon" @click="$router.push('/search')" />
    </div>

    <!-- 排序/布局栏 -->
    <div class="filter-bar">
      <div class="filter-item" :class="{ active: sortType === 'default' }" @click="setSort('default')">综合</div>
      <div class="filter-item" :class="{ active: sortType === 'sales' }" @click="setSort('sales')">销量</div>
      <div class="filter-item price-sort" :class="{ active: sortType === 'price' }" @click="setSort('price')">
        价格
        <span class="sort-arrows">
          <van-icon name="arrow-up" :class="{ 'arrow-active': sortType === 'price' && priceAsc }" />
          <van-icon name="arrow-down" :class="{ 'arrow-active': sortType === 'price' && !priceAsc }" />
        </span>
      </div>
      <div class="filter-item layout-toggle" @click="isGrid = !isGrid">
        <van-icon :name="isGrid ? 'bars' : 'apps-o'" />
      </div>
    </div>

    <!-- 加载中 -->
    <div class="loading-wrap" v-if="loading && !goodsList.length">
      <van-loading type="spinner" color="#ff2442" size="28" />
      <span>加载中...</span>
    </div>

    <!-- 空状态 -->
    <div class="empty-wrap" v-else-if="!goodsList.length && !loading">
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
        class="goods-list"
        :class="{ 'grid-layout': isGrid }"
      >
        <!-- 网格布局 -->
        <template v-if="isGrid">
          <div class="grid-card" v-for="goods in sortedList" :key="goods.id" @click="goDetail(goods.id)">
            <div class="grid-img-wrap">
              <img :src="goods.coverImg || ''" class="grid-img" alt="商品图片" @error="handleImgError($event)" />
              <div class="grid-tag" v-if="goods.tag">{{ goods.tag.split(',')[0] }}</div>
              <div class="discount-badge" v-if="goods.originalPrice > goods.price">
                -{{ Math.round((1 - goods.price / goods.originalPrice) * 100) }}%
              </div>
            </div>
            <div class="grid-info">
              <div class="grid-name">{{ goods.productName }}</div>
              <div class="grid-bottom">
                <div class="grid-price">
                  <span class="price-sym">¥</span>
                  <span class="price-int">{{ Math.floor(goods.price) }}</span>
                  <span class="price-dec">.{{ (goods.price % 1).toFixed(2).slice(2) }}</span>
                </div>
                <div class="grid-sales" v-if="goods.sales">{{ goods.sales }}人付款</div>
              </div>
              <div class="grid-original" v-if="goods.originalPrice > goods.price">¥{{ goods.originalPrice }}</div>
            </div>
          </div>
        </template>

        <!-- 列表布局 -->
        <template v-else>
          <div class="list-card" v-for="goods in sortedList" :key="goods.id" @click="goDetail(goods.id)">
            <div class="list-img-wrap">
              <img :src="goods.coverImg || ''" class="list-img" alt="商品图片" @error="handleImgError($event)" />
              <div class="discount-badge" v-if="goods.originalPrice > goods.price">
                -{{ Math.round((1 - goods.price / goods.originalPrice) * 100) }}%
              </div>
            </div>
            <div class="list-info">
              <div class="list-name">{{ goods.productName }}</div>
              <div class="list-tag-row" v-if="goods.tag">
                <span class="list-tag" v-for="t in goods.tag.split(',').slice(0,2)" :key="t">{{ t }}</span>
              </div>
              <div class="list-bottom">
                <div class="list-price">
                  <span class="price-sym">¥</span>
                  <span class="price-main">{{ goods.price }}</span>
                  <span class="price-original" v-if="goods.originalPrice > goods.price">¥{{ goods.originalPrice }}</span>
                </div>
                <div class="list-sales" v-if="goods.sales">
                  <van-icon name="fire-o" size="11" />{{ goods.sales }}人付款
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
import { getProductListByCategory } from '@/api/mobile/product'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const goodsList = ref([])
const pageNum = ref(1)
const pageSize = ref(20)
const totalPages = ref(0)

const sortType = ref('default')
const priceAsc = ref(true)
const isGrid = ref(true)

const categoryId = computed(() => {
  const id = route.query.categoryId
  return id ? Number(id) : ''
})

const decodeCategoryName = computed(() => {
  const name = route.query.categoryName
  if (!name) return '商品列表'
  try { return decodeURIComponent(name) } catch { return name }
})

const sortedList = computed(() => {
  const list = [...goodsList.value]
  if (sortType.value === 'sales') return list.sort((a, b) => (b.sales || 0) - (a.sales || 0))
  if (sortType.value === 'price') return list.sort((a, b) => priceAsc.value ? a.price - b.price : b.price - a.price)
  return list
})

const setSort = (type) => {
  if (type === 'price' && sortType.value === 'price') priceAsc.value = !priceAsc.value
  else { sortType.value = type; priceAsc.value = true }
}

const handleImgError = (e) => { e.target.src = '' }
const goDetail = (id) => router.push({ name: 'GoodsDetail', params: { id } })

const loadGoodsList = async (isRefresh = false) => {
  if (loading.value) return
  if (!categoryId.value) { finished.value = true; return }
  if (isRefresh) { pageNum.value = 1; goodsList.value = []; finished.value = false; totalPages.value = 0 }
  loading.value = true
  try {
    const res = await getProductListByCategory(categoryId.value, { pageNum: pageNum.value, pageSize: pageSize.value })
    if (res.code === 0) {
      const list = res.data?.records || []
      totalPages.value = res.data?.pages || 0
      goodsList.value = isRefresh ? list : [...goodsList.value, ...list]
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

const onRefresh = () => loadGoodsList(true)
const onLoad = () => {
  if (pageNum.value < totalPages.value) { pageNum.value++; loadGoodsList(false) }
  else { loading.value = false; finished.value = true }
}

watch(() => categoryId.value, () => loadGoodsList(true), { immediate: true })
</script>

<style scoped>
.goods-list-page {
  min-height: 100vh;
  background: #f4f5f7;
  padding-bottom: 60px;
}

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
.back-btn { font-size: 20px; color: #333; cursor: pointer; flex-shrink: 0; }
.nav-title { flex: 1; text-align: center; font-size: 17px; font-weight: 700; color: #1a1a1a; }
.nav-icon { font-size: 20px; color: #555; cursor: pointer; flex-shrink: 0; }

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
  position: relative;
}
.filter-item.active { color: #ff2442; font-weight: 600; }
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
.price-sort { gap: 2px; }
.sort-arrows { display: flex; flex-direction: column; }
.sort-arrows .van-icon { font-size: 10px; color: #ccc; line-height: 1.1; }
.sort-arrows .arrow-active { color: #ff2442; }
.layout-toggle { flex: 0 0 44px; font-size: 18px; color: #999; }

.loading-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 0; color: #999; font-size: 14px; }
.empty-wrap { display: flex; flex-direction: column; align-items: center; padding: 60px 0 40px; }
.empty-icon { font-size: 56px; margin-bottom: 12px; }
.empty-text { font-size: 14px; color: #999; margin-bottom: 20px; }
.empty-btn { min-width: 120px; background: linear-gradient(135deg, #ff2442, #ff6b6b); border: none; }

.goods-list { padding: 10px; }
.goods-list.grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px; }

.grid-card { background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.06); cursor: pointer; transition: transform 0.2s; }
.grid-card:active { transform: scale(0.97); }
.grid-img-wrap { position: relative; width: 100%; padding-top: 100%; background: #f8f8f8; overflow: hidden; }
.grid-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.grid-tag { position: absolute; top: 8px; left: 8px; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; font-size: 10px; padding: 2px 7px; border-radius: 10px; }
.discount-badge { position: absolute; top: 8px; right: 8px; background: linear-gradient(135deg, #ff2442, #ff6b6b); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px; }
.grid-info { padding: 10px 10px 12px; }
.grid-name { font-size: 13px; color: #1a1a1a; font-weight: 500; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 6px; min-height: 36px; }
.grid-bottom { display: flex; align-items: flex-end; justify-content: space-between; }
.grid-price { display: flex; align-items: baseline; color: #ff2442; }
.price-sym { font-size: 11px; font-weight: 600; }
.price-int { font-size: 18px; font-weight: 700; }
.price-dec { font-size: 12px; font-weight: 600; }
.grid-sales { font-size: 10px; color: #aaa; }
.grid-original { font-size: 11px; color: #bbb; text-decoration: line-through; margin-top: 2px; }

.list-card { display: flex; background: #fff; border-radius: 14px; overflow: hidden; margin-bottom: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); cursor: pointer; transition: transform 0.2s; }
.list-card:active { transform: scale(0.98); }
.list-img-wrap { position: relative; width: 110px; height: 110px; flex-shrink: 0; background: #f8f8f8; overflow: hidden; }
.list-img { width: 100%; height: 100%; object-fit: cover; }
.list-img-wrap .discount-badge { top: 6px; right: 6px; }
.list-info { flex: 1; padding: 12px 14px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0; }
.list-name { font-size: 14px; font-weight: 500; color: #1a1a1a; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.list-tag-row { display: flex; gap: 5px; flex-wrap: wrap; }
.list-tag { font-size: 10px; color: #667eea; background: #f0f2ff; padding: 2px 7px; border-radius: 8px; }
.list-bottom { display: flex; align-items: center; justify-content: space-between; }
.list-price { display: flex; align-items: baseline; gap: 4px; }
.list-price .price-sym { font-size: 12px; color: #ff2442; font-weight: 600; }
.list-price .price-main { font-size: 20px; font-weight: 700; color: #ff2442; }
.price-original { font-size: 12px; color: #bbb; text-decoration: line-through; }
.list-sales { display: flex; align-items: center; gap: 3px; font-size: 11px; color: #aaa; }

:deep(.van-list__finished-text) { color: #bbb; font-size: 12px; padding: 20px 0; }
</style>
