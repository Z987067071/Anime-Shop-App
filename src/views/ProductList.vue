<template>
  <div class="product-list-page">
    <van-nav-bar 
      :title="categoryName" 
      left-arrow 
      @click-left="$router.back()"
    />

    <!-- 加载中状态 -->
    <van-loading v-if="loading && !productList.length" class="loading" type="spinner">
      加载中...
    </van-loading>

    <!-- 空数据状态 -->
    <van-empty 
      v-else-if="!productList.length && !loading"
      image="search" 
      description="暂无该分类商品"
    />

    <!-- 商品列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" v-else>
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="已经到底了"
        @load="onLoad"
        class="product-list"
      >
        <!-- 商品卡片 -->
        <div 
          class="product-card" 
          v-for="product in productList" 
          :key="product.id"
          @click="goDetail(product.id)"
        >
          <div class="product-img">
            <img 
              :src="product.coverImg || ''" 
              alt="商品图片"
              @error="handleImgError($event)"
            />
          </div>
          <div class="product-info">
            <h4 class="product-name" :title="product.productName">
              {{ product.productName }}
            </h4>
            <p class="product-price">¥{{ product.price }}</p>
            <p class="product-original-price" v-if="product.originalPrice > product.price">
              原价：¥{{ product.originalPrice }}
            </p>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <TabBar v-if="showTabBar" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
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
const showTabBar = ref(true)

const firstCategoryId = computed(() => {
  const id = route.query.firstCategoryId
  return id ? Number(id) : ''
})

const categoryName = computed(() => {
  const categoryMap = {
    1: '手办',
    2: '周边',
    3: '图书漫画',
    4: '漫展演出',
    5: 'IP',
    6: '品牌'
  }
  return categoryMap[firstCategoryId.value] || '商品列表'
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


const loadProductList = async (isRefresh = false) => {
  if (loading.value) return
  if (!firstCategoryId.value) {
    finished.value = true
    return
  }

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
      const pageData = res.data
      const list = pageData.records || []
      totalPages.value = pageData.pages || 0

      if (isRefresh) {
        productList.value = list
      } else {
        productList.value = [...productList.value, ...list]
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
  loadProductList(true)
}

// 上拉加载更多
const onLoad = () => {
  if (pageNum.value < totalPages.value) {
    pageNum.value++
    loadProductList(false)
  } else {
    loading.value = false
    finished.value = true
  }
}

// 监听分类ID变化
watch(
  () => firstCategoryId.value,
  () => loadProductList(true),
  { immediate: true }
)

// 页面挂载时初始化
onMounted(() => {
  // showTabBar.value = false
})
</script>

<style scoped>
.product-list-page {
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

.product-list {
  flex: 1;
  padding: 10px;
}

/* 商品卡片样式 */
.product-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.product-img {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-info {
  flex: 1;
  margin-left: 10px;
}

.product-name {
  font-size: 15px;
  color: #333;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.product-price {
  font-size: 18px;
  color: #e54847;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.product-original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
  margin: 0;
}

/* Vant组件样式适配 */
:deep(.van-empty) {
  padding: 60px 0;
}

:deep(.van-list__finished-text) {
  color: #999;
  padding: 20px 0;
}

:deep(.van-pull-refresh__head) {
  text-align: center;
}
</style>