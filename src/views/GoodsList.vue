<template>
  <div class="goods-list-page">
    <van-nav-bar 
      :title="decodeCategoryName || '商品列表'" 
      left-arrow 
      @click-left="$router.back()"
    />

    <!-- 加载中状态 -->
    <van-loading v-if="loading && !goodsList.length" class="loading" type="spinner">
      加载中...
    </van-loading>

    <!-- 商品列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" v-else>
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="已经到底了"
        @load="onLoad"
        class="goods-list"
      >
        <!-- 商品卡片 -->
        <div 
          class="goods-card" 
          v-for="goods in goodsList" 
          :key="goods.id"
          @click="goDetail(goods.id)"
        >
          <div class="goods-img">
            <img 
              :src="goods.coverImg || ''" 
              alt="商品图片"
              @error="handleImgError($event)"
            />
          </div>
          <div class="goods-info">
            <h4 class="goods-name" :title="goods.productName">{{ goods.productName }}</h4>
            <p class="goods-price">¥{{ goods.price }}</p>
            <p class="goods-original-price" v-if="goods.originalPrice < goods.price">
              原价：¥{{ goods.originalPrice }}
            </p>
          </div>
        </div>
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

// 路由相关
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const goodsList = ref([])
const pageNum = ref(1)
const pageSize = ref(20)
const totalPages = ref(0)

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
  router.push({
    name: 'GoodsDetail',
    params: { id }
  })
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

// 下拉刷新
const onRefresh = () => {
  loadGoodsList(true)
}


const onLoad = () => {
  if (pageNum.value < totalPages.value) {
    pageNum.value++
    loadGoodsList(false)
  } else {
    loading.value = false
    finished.value = true
  }
}

watch(
  () => categoryId.value,
  () => loadGoodsList(true),
  { immediate: true }
)
</script>

<style scoped>
.goods-list-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.loading {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.goods-list {
  flex: 1;
  padding: 10px;
}

/* 商品卡片 */
.goods-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.goods-img {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.goods-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.goods-info {
  flex: 1;
  margin-left: 10px;
}

.goods-name {
  font-size: 14px;
  color: #333;
  margin: 0 0 5px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.goods-price {
  font-size: 16px;
  color: #f00;
  font-weight: bold;
  margin: 0 0 3px 0;
}

.goods-original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
  margin: 0;
}

/* 适配vant样式 */
:deep(.van-list__finished-text) {
  color: #999;
  padding: 20px 0;
}
:deep(.van-pull-refresh__head) {
  text-align: center;
}
</style>