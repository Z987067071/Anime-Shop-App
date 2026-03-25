<template>
  <div class="goods-list-page">
    <!-- 导航栏：显示分类名称 -->
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

// 页面状态
const loading = ref(false)       // 加载状态
const refreshing = ref(false)    // 下拉刷新状态
const finished = ref(false)      // 加载完成
const goodsList = ref([])        // 商品列表
const pageNum = ref(1)           // 当前页码
const pageSize = ref(20)         // 页大小
const totalPages = ref(0)        // 总页数（关键：判断是否加载到底）

// 解析分类ID和名称
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

// 图片加载失败兜底
const handleImgError = (e) => {
  e.target.src = '' // 兜底图
}

// 跳商品详情
const goDetail = (id) => {
  router.push({
    name: 'GoodsDetail',
    params: { id }
  })
}

// 核心：请求分类商品数据（修复分页参数+数据解析）
const loadGoodsList = async (isRefresh = false) => {
  if (loading.value) return
  // 无分类ID直接返回
  if (!categoryId.value) {
    finished.value = true
    return
  }

  // 刷新时重置状态
  if (isRefresh) {
    pageNum.value = 1
    goodsList.value = []
    finished.value = false
    totalPages.value = 0
  }

  loading.value = true
  try {
    // 修复1：传递分页参数给接口
    const res = await getProductListByCategory(categoryId.value, {
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    
    if (res.code === 0) {
      const pageData = res.data || {}
      const list = pageData.records || [] // 核心：商品列表在records中
      totalPages.value = pageData.pages || 0 // 获取总页数

      if (isRefresh) {
        goodsList.value = list
      } else {
        goodsList.value = [...goodsList.value, ...list]
      }

      // 修复3：判断是否加载到底（当前页码 >= 总页数）
      finished.value = pageNum.value >= totalPages.value
    }
  } catch (error) {
    console.error('加载商品失败：', error)
    finished.value = true // 加载失败标记为完成，避免重复请求
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  loadGoodsList(true)
}

// 上拉加载更多（修复分页逻辑）
const onLoad = () => {
  // 还有更多页才请求
  if (pageNum.value < totalPages.value) {
    pageNum.value++ // 页码+1
    loadGoodsList(false) // 不刷新，加载更多
  } else {
    loading.value = false
    finished.value = true
  }
}

// 监听分类ID变化（切换分类时重新请求）
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

/* 加载中 */
.loading {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

/* 商品列表 */
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