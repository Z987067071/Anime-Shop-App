<template>
  <div class="product-collect">
    <header class="glass-header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <van-icon name="arrow-left" />
        </div>
        <h1 class="page-title">我的收藏</h1>
        <div class="header-action" @click="goShopping">
          <van-icon name="shopping-cart-o" />
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 加载状态 -->
      <div class="loading-state" v-if="loading && collectList.length === 0">
        <van-loading type="spinner" />
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else-if="collectList.length === 0">
        <div class="empty-icon">❤️</div>
        <h3>暂无收藏</h3>
        <p>看到喜欢的商品？点击爱心收藏起来</p>
        <button class="shop-btn" @click="goShopping">
          去逛逛
        </button>
      </div>

      <!-- 收藏列表 -->
      <div class="collect-list" v-else>
        <div 
          v-for="item in collectList" 
          :key="item.id"
          class="collect-card"
          @click="toDetail(item.id)"
        >
          <!-- 商品封面 -->
          <div class="card-image">
            <img 
              :src="item.coverImg || (item.imageList && item.imageList[0]?.imageUrl) || 'https://www.helloimg.com/i/2026/01/27/69783066c0b56.png'" 
              @error="handleImgError"
              alt="商品封面" 
            />
            <div class="discount-badge" v-if="item.originalPrice && item.originalPrice > item.price">
              {{ Math.round((1 - item.price / item.originalPrice) * 100) }}% OFF
            </div>
          </div>

          <!-- 商品信息 -->
          <div class="card-info">
            <h3 class="product-name">{{ item.productName }}</h3>
            
            <!-- 标签 -->
            <div class="product-tags" v-if="item.tag">
              <span 
                v-for="tag in item.tag.split(',').slice(0, 3)" 
                :key="tag" 
                class="tag"
              >
                {{ tag }}
              </span>
            </div>

            <!-- 价格与操作 -->
            <div class="card-footer">
              <div class="price-wrap">
                <span class="price-symbol">¥</span>
                <span class="price-num">{{ item.price || 0 }}</span>
                <span class="original-price" v-if="item.originalPrice && item.originalPrice > item.price">
                  ¥{{ item.originalPrice }}
                </span>
              </div>
              
              <button 
                class="cancel-btn" 
                @click.stop="cancelCollect(item.id)"
              >
                <van-icon name="delete-o" />
              </button>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div class="load-more" v-if="!finished">
          <van-button 
            size="small" 
            type="default" 
            :loading="loading"
            @click="onLoad"
          >
            {{ loading ? '加载中...' : '加载更多' }}
          </van-button>
        </div>
        
        <div class="no-more" v-else-if="collectList.length > 0">
          没有更多收藏了
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { getCollectList, collectProduct } from '@/api/mobile/product'

const router = useRouter()

// 加载状态
const loading = ref(false)
const finished = ref(false)

// 分页参数
const pageNum = ref(1)
const pageSize = ref(10)

// 收藏列表数据
const collectList = ref([])

/**
 * 加载收藏列表
 * @param {Boolean} isLoadMore - 是否为加载更多
 */
const loadCollectList = async (isLoadMore = false) => {
  if (loading.value) return
  
  try {
    loading.value = true
    const response = await getCollectList({
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })

    if (response.code === 0) {
      const data = response.data || {}
      const records = data.records || []
      
      if (isLoadMore) {
        collectList.value.push(...records)
      } else {
        collectList.value = records
      }

      finished.value = records.length < pageSize.value
    } else {
      showToast(response.msg || '加载收藏列表失败')
      finished.value = true
      if (response.msg && response.msg.includes('登录')) {
        setTimeout(() => {
          router.push('/login')
        }, 1000)
      }
    }
  } catch (error) {
    console.error('加载收藏列表失败：', error)
    showToast('网络错误，加载失败')
    finished.value = true
  } finally {
    loading.value = false
  }
}

/**
 * 加载更多
 */
const onLoad = () => {
  if (finished.value || loading.value) return
  pageNum.value++
  loadCollectList(true)
}

/**
 * 取消收藏
 * @param {Number} productId - 商品ID
 */
const cancelCollect = async (productId) => {
  try {
    await showConfirmDialog({
      title: '取消收藏',
      message: '确定要取消收藏该商品吗？',
      confirmButtonColor: '#ff2442'
    })

    const response = await collectProduct({
      productId,
      isCollect: 0
    })

    if (response.code === 0) {
      showToast({ type: 'success', message: '已取消收藏' })
      // 本地移除，无需重新加载
      collectList.value = collectList.value.filter(item => item.id !== productId)
      if (collectList.value.length === 0) {
        pageNum.value = 1
        finished.value = false
        loadCollectList(false)
      }
    } else {
      showToast(response.msg || '取消收藏失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消收藏失败：', error)
    }
  }
}

/**
 * 跳转到商品详情
 */
const toDetail = (id) => {
  router.push({ path: `/goods/detail/${id}` })
}

/**
 * 返回上一页
 */
const goBack = () => {
  router.back()
}

/**
 * 去购物首页
 */
const goShopping = () => {
  router.push('/')
}

/**
 * 图片错误处理
 */
const handleImgError = (e) => {
  e.target.src = 'https://www.helloimg.com/i/2026/01/27/69783066c0b56.png'
}

// 初始化
onMounted(() => {
  loadCollectList(false)
})
</script>

<style scoped>
.product-collect {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 20px;
}

/* 玻璃拟态头部 - 与工单页面保持一致 */
.glass-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 16px;
  max-width: 600px;
  margin: 0 auto;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #333;
  font-size: 20px;
}

.back-btn:active {
  background: rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.header-action {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  border-radius: 50%;
  color: white;
  font-size: 18px;
}

/* 主内容区 */
.main-content {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 60px;
  color: #999;
}

/* 空状态 - 与工单页面风格一致 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.empty-state h3 {
  font-size: 18px;
  color: #333;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.empty-state p {
  font-size: 14px;
  color: #999;
  margin: 0 0 24px 0;
}

.shop-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.shop-btn:active {
  transform: scale(0.95);
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.3);
}

/* 收藏列表 - 卡片式布局 */
.collect-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.collect-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.collect-card:active {
  transform: scale(0.98);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* 商品图片区域 */
.card-image {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  background: #f5f5f5;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
}

/* 商品信息区域 */
.card-info {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 标签样式 */
.product-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.tag {
  font-size: 11px;
  color: #ff2442;
  background: rgba(255, 36, 66, 0.08);
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 500;
}

/* 底部价格与操作 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price-wrap {
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
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
  margin-left: 6px;
}

/* 取消收藏按钮 */
.cancel-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:active {
  background: rgba(255, 36, 66, 0.1);
  color: #ff2442;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 20px;
}

.no-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 13px;
}
</style>