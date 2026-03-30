<template>
  <div class="goods-list-page">
    <!-- 自定义头部 -->
    <div class="page-header" :class="{ 'header-scrolled': isScrolled }">
      <div class="header-content">
        <div class="back-btn" @click="$router.back()">
          <van-icon name="arrow-left" />
        </div>
        <div class="header-title">{{ decodeCategoryName }}</div>
        <div class="header-right">
          <div class="search-btn" @click="$router.push('/search')">
            <van-icon name="search" />
          </div>
        </div>
      </div>
    </div>

    <!-- 加载骨架屏 -->
    <div v-if="loading && !goodsList.length" class="skeleton-wrap">
      <div class="skeleton-card" v-for="i in 6" :key="i">
        <div class="skeleton-img shimmer"></div>
        <div class="skeleton-info">
          <div class="skeleton-line shimmer" style="width: 80%"></div>
          <div class="skeleton-line shimmer" style="width: 50%"></div>
          <div class="skeleton-price shimmer"></div>
        </div>
      </div>
    </div>

    <!-- 商品列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" v-else>
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="— 已经到底了 —"
        @load="onLoad"
        class="goods-list"
      >
        <div class="goods-grid">
          <div
            class="goods-card"
            v-for="goods in goodsList"
            :key="goods.id"
            @click="goDetail(goods.id)"
          >
            <div class="goods-img-wrap">
              <img
                :src="goods.coverImg || ''"
                alt="商品图片"
                @error="handleImgError($event)"
              />
              <div class="goods-tag" v-if="goods.tag">{{ goods.tag }}</div>
              <div class="discount-badge" v-if="goods.originalPrice && goods.originalPrice > goods.price">
                {{ Math.round((goods.price / goods.originalPrice) * 10) }}折
              </div>
            </div>
            <div class="goods-info">
              <h4 class="goods-name">{{ goods.productName }}</h4>
              <div class="goods-bottom">
                <div class="price-wrap">
                  <span class="price-symbol">¥</span>
                  <span class="price-value">{{ goods.price }}</span>
                </div>
                <div class="original-price" v-if="goods.originalPrice && goods.originalPrice > goods.price">
                  ¥{{ goods.originalPrice }}
                </div>
              </div>
              <div class="goods-sales" v-if="goods.sales">已售 {{ goods.sales }}+</div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!goodsList.length && !loading" class="empty-state">
          <div class="empty-icon">🎎</div>
          <p class="empty-text">该分类暂无商品</p>
          <div class="empty-btn" @click="$router.push('/')">去首页逛逛</div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
const isScrolled = ref(false)

const categoryId = computed(() => {
  const id = route.query.categoryId
  return id ? Number(id) : ''
})

const decodeCategoryName = computed(() => {
  const name = route.query.categoryName
  if (!name) return '商品列表'
  try {
    return decodeURIComponent(name)
  } catch (e) {
    return name
  }
})

const handleImgError = (e) => {
  e.target.src = ''
}

const goDetail = (id) => {
  router.push({ name: 'GoodsDetail', params: { id } })
}

const loadGoodsList = async (isRefresh = false) => {
  if (loading.value) return
  if (!categoryId.value) {
    finished.value = true
    return
  }

  if (isRefresh) {
    pageNum.value = 1
    goodsList.value = []
    finished.value = false
    totalPages.value = 0
  }

  loading.value = true
  try {
    const res = await getProductListByCategory(categoryId.value, {
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })

    if (res.code === 0) {
      const pageData = res.data || {}
      const list = pageData.records || []
      totalPages.value = pageData.pages || 0

      if (isRefresh) {
        goodsList.value = list
      } else {
        goodsList.value = [...goodsList.value, ...list]
      }

      finished.value = pageNum.value >= totalPages.value
    }
  } catch (error) {
    console.error('加载商品失败：', error)
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onRefresh = () => loadGoodsList(true)

const onLoad = () => {
  if (pageNum.value < totalPages.value) {
    pageNum.value++
    loadGoodsList(false)
  } else {
    loading.value = false
    finished.value = true
  }
}

watch(() => categoryId.value, () => loadGoodsList(true), { immediate: true })
</script>

<style scoped>
.goods-list-page {
  background: #f5f7fa;
  min-height: 100vh;
  padding-top: 56px;
}

/* 头部 */
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 56px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.page-header.header-scrolled {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 16px;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  font-size: 18px;
  color: #333;
  cursor: pointer;
  flex-shrink: 0;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
}

.header-right {
  width: 36px;
  display: flex;
  justify-content: flex-end;
}

.search-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  font-size: 18px;
  color: #333;
  cursor: pointer;
}

/* 骨架屏 */
.skeleton-wrap {
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.skeleton-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}

.skeleton-img {
  width: 100%;
  padding-top: 100%;
  background: #f0f0f0;
}

.skeleton-info {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: #f0f0f0;
}

.skeleton-price {
  height: 16px;
  width: 40%;
  border-radius: 6px;
  background: #f0f0f0;
}

.shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 商品网格 */
.goods-list {
  padding: 12px;
}

.goods-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.goods-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.goods-card:active {
  transform: scale(0.97);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}

.goods-img-wrap {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background: #f8f8f8;
}

.goods-img-wrap img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.goods-card:active .goods-img-wrap img {
  transform: scale(1.03);
}

.goods-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 600;
}

.discount-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 36, 66, 0.9);
  color: #fff;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 6px;
  font-weight: 600;
}

.goods-info {
  padding: 10px 12px 12px;
}

.goods-name {
  font-size: 13px;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  font-weight: 500;
}

.goods-bottom {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 4px;
}

.price-wrap {
  display: flex;
  align-items: baseline;
  color: #ff2442;
}

.price-symbol {
  font-size: 11px;
  font-weight: 600;
}

.price-value {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.original-price {
  font-size: 11px;
  color: #bbb;
  text-decoration: line-through;
}

.goods-sales {
  font-size: 11px;
  color: #999;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 15px;
  color: #999;
  margin: 0 0 20px 0;
}

.empty-btn {
  background: linear-gradient(135deg, #ff2442, #ff6b6b);
  color: #fff;
  padding: 10px 28px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

/* vant 样式覆盖 */
:deep(.van-list__finished-text) {
  color: #bbb;
  font-size: 12px;
  padding: 20px 0;
}

:deep(.van-pull-refresh__head) {
  text-align: center;
}
</style>
