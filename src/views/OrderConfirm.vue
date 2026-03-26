<template>
  <div class="order-confirm-page">
    <!-- 导航栏 -->
    <van-nav-bar 
      title="确认订单" 
      left-arrow
      fixed
      placeholder
      @click-left="$router.back()"
    />

    <div class="address-card-wrap" @click="openAddressSelect" v-if="isTicket === 0">
      <div class="address-card" v-loading="addressLoading">
        <div class="address-card-header">
          <span class="title-text">收货地址</span>
          <van-icon name="arrow-right" class="arrow-icon" />
        </div>
        
        <div class="address-card-body" v-if="selectedAddress">
          <div class="address-card-top">
            <span class="consignee-name">{{ selectedAddress.consignee }}</span>
            <span class="phone-number">{{ selectedAddress.phone }}</span>
            <van-tag 
              type="primary" 
              size="mini" 
              class="default-tag"
              v-if="selectedAddress.isDefault === 1"
            >
              默认
            </van-tag>
          </div>
          <div class="address-card-bottom">
            <van-icon name="location-o" class="location-icon" />
            <span class="full-address">{{ selectedAddress.fullAddress }}</span>
          </div>
        </div>

        <div class="address-card-empty" v-else>
          <van-icon name="location-o" class="empty-location-icon" />
          <span class="empty-text">暂无收货地址，请添加</span>
          <van-button 
            size="small" 
            type="primary" 
            class="add-address-btn"
            @click.stop="goAddAddress"
          >
            立即添加
          </van-button>
        </div>
      </div>
    </div>

    <div class="buyer-card-wrap" @click="openBuyerSelect" v-if="isTicket === 1">
      <div class="buyer-card" v-loading="buyerLoading">
        <div class="address-card-header">
          <span class="title-text">购票人信息</span>
          <van-icon name="arrow-right" class="arrow-icon" />
          <span class="ticket-count" v-if="selectedBuyerList.length">
            已选{{ selectedBuyerList.length }}/{{ totalTicketCount }}人
          </span>
        </div>
        
        <div class="address-card-body" v-if="selectedBuyerList.length">
          <div class="buyer-list-wrap">
            <div class="buyer-item" v-for="(buyer, index) in selectedBuyerList" :key="buyer.id">
              <div class="address-card-top">
                <span class="consignee-name">{{ buyer.name }}</span>
                <span class="phone-number">{{ formatIdCard(buyer.idCard) }}</span>
                <van-tag 
                  type="success" 
                  size="mini" 
                  class="default-tag"
                >
                  审核通过
                </van-tag>
              </div>
              <div class="address-card-bottom">
                <van-icon name="user-o" class="location-icon" />
                <span class="full-address">购票人身份信息将用于入场核验</span>
              </div>
              <van-icon 
                name="close" 
                class="delete-buyer-icon"
                @click.stop="removeSelectedBuyer(buyer.id)"
                v-if="selectedBuyerList.length > 1"
              />
            </div>
          </div>
        </div>
        
        <div class="address-card-empty" v-else>
          <van-icon name="user-o" class="empty-location-icon" />
          <span class="empty-text">暂无购票人信息，请添加</span>
          <van-button 
            size="small" 
            type="primary" 
            class="add-address-btn"
            @click.stop="goAddBuyer"
          >
            立即添加
          </van-button>
        </div>
      </div>
    </div>

    <van-popup v-model:show="addressPopupShow" position="bottom" round style="height: 70%">
      <div class="address-select-header">
        <span class="title">选择收货地址</span>
        <van-button size="mini" type="primary" @click="goAddAddress">新增地址</van-button>
      </div>
      <div class="address-list" v-if="addressList.length">
        <div 
          class="address-item" 
          v-for="item in addressList" 
          :key="item.id"
          :class="{ active: selectedAddress?.id === item.id }"
          @click="selectAddress(item)"
        >
          <div class="address-item-header">
            <span class="name">{{ item.consignee }}</span>
            <span class="phone">{{ item.phone }}</span>
            <van-tag type="primary" size="mini" v-if="item.isDefault === 1">默认</van-tag>
            <van-icon 
              name="check" 
              class="check-icon" 
              v-if="selectedAddress?.id === item.id"
            />
          </div>
          <div class="address-item-detail">
            {{ item.fullAddress }}
          </div>
        </div>
      </div>
      <div class="address-empty-tip" v-else>
        <van-empty description="暂无收货地址" />
        <van-button type="primary" block @click="goAddAddress">添加收货地址</van-button>
      </div>
    </van-popup>

    <van-popup v-model:show="buyerPopupShow" position="bottom" round style="height: 70%">
      <div class="address-select-header">
        <span class="title">选择购票人（需选{{ totalTicketCount }}人）</span>
        <van-button size="mini" type="primary" @click="goAddBuyer">新增购票人</van-button>
      </div>
      <div class="selected-count-tip" v-if="selectedBuyerList.length">
        已选：{{ selectedBuyerList.length }}/{{ totalTicketCount }}人
      </div>
      <div class="address-list" v-if="buyerList.length">
        <div 
          class="address-item" 
          v-for="item in buyerList" 
          :key="item.id"
          :class="{ 
            active: isBuyerSelected(item.id),
            disabled: item.auditStatus !== 1 
          }"
          @click="selectBuyer(item)"
        >
          <div class="address-item-header">
            <span class="name">{{ item.name }}</span>
            <span class="phone">{{ formatIdCard(item.idCard) }}</span>
            <van-tag 
              type="success" 
              size="mini" 
              v-if="item.auditStatus === 1"
            >
              审核通过
            </van-tag>
            <van-tag 
              type="warning" 
              size="mini" 
              v-if="item.auditStatus === 0"
            >
              待审核
            </van-tag>
            <van-tag 
              type="danger" 
              size="mini" 
              v-if="item.auditStatus === 2"
            >
              审核驳回
            </van-tag>
            <van-icon 
              name="check" 
              class="check-icon" 
              v-if="isBuyerSelected(item.id)"
            />
          </div>
          <div class="address-item-detail">
            <span v-if="item.auditStatus === 1">身份审核通过，可正常购票</span>
            <span v-if="item.auditStatus === 0" class="disabled-text">身份待审核，不可购票</span>
            <span v-if="item.auditStatus === 2" class="disabled-text">身份审核驳回，不可购票</span>
          </div>
        </div>
      </div>
      <div class="address-empty-tip" v-else>
        <van-empty description="暂无购票人信息" />
        <van-button type="primary" block @click="goAddBuyer">添加购票人</van-button>
      </div>
    </van-popup>

    <div class="goods-wrap">
      <div class="goods-title">商品清单</div>
      <div class="goods-list" v-if="orderGoodsList.length">
        <div class="goods-item" v-for="item in orderGoodsList" :key="item.productId">
          <img 
            class="goods-thumb" 
            :src="item.productImg" 
            alt="商品图片"
            @error="(e) => e.target.src = ''"
          >
          <div class="goods-info">
            <div class="goods-name">{{ item.productName }}</div>
            <div class="goods-sku" v-if="item.ticketType || item.skuName">
              票种：{{ item.ticketType || item.skuName }}
            </div>
            <div class="goods-price">¥{{ item.productPrice }}</div>
          </div>
          <div class="goods-num">x{{ item.quantity }}</div>
        </div>
      </div>
      <div class="goods-empty" v-else>
        <van-empty description="暂无结算商品" />
        <van-button type="primary" block @click="$router.push('/cart')">返回购物车选择商品</van-button>
      </div>
    </div>

    <div class="price-wrap">
      <div class="price-item">
        <span>商品总价</span>
        <span>¥{{ totalPrice }}</span>
      </div>
      <div class="price-item">
        <span>运费</span>
        <span>¥{{ freightPrice }}</span>
      </div>
      <div class="price-item total">
        <span>实付款</span>
        <span>¥{{ finalPrice }}</span>
      </div>
    </div>

    <div class="submit-wrap">
      <van-button 
        type="danger" 
        block 
        class="submit-btn"
        @click="submitOrder"
        :loading="isSubmitting"
        :disabled="submitDisabled"
      >
        提交订单
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  showToast, 
  showFailToast, 
  showLoadingToast, 
  closeToast,
  Popup,
  Empty,
  Icon,
  Button,
  Loading,
  Tag
} from 'vant'
import { useUserStore } from '@/stores/user'
import { getAddressList } from '@/api/mobile/mine'
import { submitOrder as apiSubmitOrder } from '@/api/mobile/order'
import { 
  getBuyerList, 
  addBuyer, 
  deleteBuyer, 
  getBuyerDetail 
} from '@/api/mobile/buyer'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const orderGoodsList = ref([]) 
const isTicket = ref(0) 
const addressList = ref([]) 
const selectedAddress = ref(null) 
const addressLoading = ref(false)  
const addressPopupShow = ref(false) 
const buyerList = ref([])
const selectedBuyerList = ref([])
const buyerLoading = ref(false)
const buyerPopupShow = ref(false)

const freightPrice = ref('0.00')
const isSubmitting = ref(false)

const totalTicketCount = computed(() => {
  return orderGoodsList.value.reduce((total, item) => {
    return total + Number(item.quantity || 0)
  }, 0)
})

const submitDisabled = computed(() => {
  if (addressLoading.value || buyerLoading.value || !orderGoodsList.value.length || isSubmitting.value) {
    return true
  }
  if (isTicket.value === 0) {
    return !selectedAddress.value
  }
  if (isTicket.value === 1) {
    return selectedBuyerList.value.length !== totalTicketCount.value
  }
  return true
})

const totalPrice = computed(() => {
  return orderGoodsList.value
    .reduce((total, item) => {
      const price = Number(item.productPrice) || 0
      const num = Number(item.quantity) || 0
      return total + (price * num)
    }, 0)
    .toFixed(2)
})

const finalPrice = computed(() => {
  return (Number(totalPrice.value) + Number(freightPrice.value)).toFixed(2)
})

const formatIdCard = (idCard) => {
  if (!idCard || idCard.length !== 18) return idCard || '-'
  return idCard.substring(0, 6) + '********' + idCard.substring(14)
}
const isBuyerSelected = (buyerId) => {
  return selectedBuyerList.value.some(item => item.id === buyerId)
}

const removeSelectedBuyer = (buyerId) => {
  selectedBuyerList.value = selectedBuyerList.value.filter(item => item.id !== buyerId)
  showToast('已移除该购票人')
}

onMounted(() => {
  try {
    const orderDataStr = route.query.orderData
    if (!orderDataStr) throw new Error('无结算商品数据')

    const raw = JSON.parse(decodeURIComponent(orderDataStr))

    const rawDataList = Array.isArray(raw) ? raw : [raw]

    if (!rawDataList.length) {
      throw new Error('商品数据为空')
    }

    orderGoodsList.value = rawDataList.map(item => ({
      productId: item.productId || item.goodsId || '',
      productName: item.productName || item.goodsName || '',
      productImg: item.productImg || item.goodsImage || '',
      productPrice: (item.productPrice || item.price || '0.00').toString(),
      quantity: item.quantity || item.num || 1,
      skuId: item.skuId || '',
      skuName: item.skuName || '',
      ticketType: item.ticketType || '',
      isTicket: Number(item.isTicket || 0)
    }))

    isTicket.value = orderGoodsList.value[0]?.isTicket || 0

  } catch (err) {
    showFailToast('数据异常：' + err.message)
    setTimeout(() => router.push('/cart'), 1500)
    return
  }

  if (isTicket.value === 0) {
    fetchAddressList()
  } else {
    fetchBuyerList()
  }
})

const fetchAddressList = async () => {
  addressLoading.value = true
  try {
    if (!userStore.id || !userStore.token) {
      showToast('请先登录后再结算')
      router.push({
        path: '/login',
        query: { redirect: route.fullPath }
      })
      return
    }
    
    const res = await getAddressList({ userId: userStore.id })
    addressList.value = res.data || []
    
    if (addressList.value.length) {
      const defaultAddress = addressList.value.find(item => item.isDefault === 1)
      selectedAddress.value = defaultAddress || addressList.value[0]
    } else {
      selectedAddress.value = null
      showToast('暂无收货地址，请先添加')
    }
  } catch (err) {
    showFailToast('地址加载失败：' + (err.message || '网络异常'))
    console.error('获取地址列表失败：', err)
    addressList.value = []
    selectedAddress.value = null
  } finally {
    addressLoading.value = false
  }
}

const openAddressSelect = async () => {
  await fetchAddressList()
  addressPopupShow.value = true
}

const selectAddress = (address) => {
  selectedAddress.value = address
  addressPopupShow.value = false
  showToast(`已选择 ${address.consignee} 的地址`)
}

const goAddAddress = () => {
  addressPopupShow.value = false
  router.push({
    path: '/address/add',
    query: { redirect: route.fullPath }
  })
}

const fetchBuyerList = async () => {
  buyerLoading.value = true
  try {
    // 登录校验
    if (!userStore.id || !userStore.token) {
      showToast('请先登录后再结算')
      router.push({
        path: '/login',
        query: { redirect: route.fullPath }
      })
      return
    }
    
    const res = await getBuyerList({userId: userStore.id})
    buyerList.value = res.data || []
    
    // 初始化选中列表为空
    selectedBuyerList.value = []
  } catch (err) {
    showFailToast('购票人信息加载失败：' + (err.message || '网络异常'))
    console.error('获取购票人列表失败：', err)
    buyerList.value = []
    selectedBuyerList.value = []
  } finally {
    buyerLoading.value = false
  }
}

const openBuyerSelect = async () => {
  await fetchBuyerList()
  buyerPopupShow.value = true
}

const selectBuyer = (buyer) => {
  if (buyer.auditStatus !== 1) {
    showToast('仅审核通过的购票人可选择购票')
    return
  }
  
  const isSelected = isBuyerSelected(buyer.id)
  
  if (isSelected) {
    selectedBuyerList.value = selectedBuyerList.value.filter(item => item.id !== buyer.id)
    showToast(`已取消选择购票人：${buyer.name}`)
  } else {
    if (selectedBuyerList.value.length >= totalTicketCount.value) {
      showFailToast(`最多只能选择${totalTicketCount.value}人，请修改票数或取消已选购票人`)
      return
    }
    
    selectedBuyerList.value.push(buyer)
    showToast(`已选择购票人：${buyer.name}`)
    
    if (selectedBuyerList.value.length === totalTicketCount.value) {
      buyerPopupShow.value = false
    }
  }
}

const goAddBuyer = () => {
  buyerPopupShow.value = false
  router.push({
    path: '/buyer/add',
    query: { redirect: route.fullPath }
  })
}

const submitOrder = async () => {
  if (addressLoading.value || buyerLoading.value) {
    showToast('数据加载中，请稍候')
    return
  }
  if (!orderGoodsList.value.length) {
    showToast('暂无结算商品')
    return
  }
  if (!userStore.id || !userStore.token) {
    showToast('请先登录')
    router.push('/login')
    return
  }

  isSubmitting.value = true
  const loadingToast = showLoadingToast({ 
    message: '提交订单中...', 
    duration: 0,
    forbidClick: true
  })

  try {
    const orderParams = {
      userId: userStore.id,
      totalAmount: totalPrice.value,
      payAmount: finalPrice.value,
      freightAmount: freightPrice.value,
      discountAmount: '0.00',
      remark: '',
      isTicket: isTicket.value,
      orderItems: orderGoodsList.value.map(item => ({
        productId: item.productId,
        skuId: item.skuId,
        productName: item.productName,
        productImg: item.productImg,
        productPrice: Number(item.productPrice),
        quantity: Number(item.quantity),
        totalPrice: (Number(item.productPrice) * Number(item.quantity)).toFixed(2),
        ticketType: item.ticketType || item.skuName,
        skuName: item.skuName
      })),
      buyerList: selectedBuyerList.value.map(buyer => ({
        id: buyer.id,
        name: buyer.name,
        idCard: buyer.idCard
      }))
    }

    if (isTicket.value === 0) {
      orderParams.consignee = selectedAddress.value.consignee
      orderParams.consigneePhone = selectedAddress.value.phone
      orderParams.consigneeAddress = selectedAddress.value.fullAddress
    }

    const res = await apiSubmitOrder(orderParams)
    closeToast(loadingToast)

    if (res.code === 0) {
      showToast('订单提交成功，即将跳转到支付页')
      setTimeout(() => {
        router.push({ 
          path: '/order/pay', 
          query: { 
            orderId: res.data,
            payAmount: finalPrice.value,
            isTicket: isTicket.value
          } 
        })
      }, 1500)
    } else {
      showFailToast('订单提交失败：' + res.msg)
    }
  } catch (err) {
    closeToast(loadingToast)
    showFailToast('订单提交失败：' + (err.message || '网络异常，请重试'))
    console.error('提交订单失败：', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.order-confirm-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 80px;
}

.address-card-wrap, .buyer-card-wrap {
  margin-bottom: 15px;
}
.address-card, .buyer-card {
  margin: 10px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 18px;
  position: relative;
  cursor: pointer;
}
.address-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.address-card-header .title-text {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}
.address-card-header .arrow-icon {
  font-size: 18px;
  color: #999999;
}
.ticket-count {
  font-size: 12px;
  color: #ff2442;
}
.address-card-body {
  padding-top: 8px;
}
.buyer-list-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.buyer-item {
  position: relative;
  padding-bottom: 10px;
  border-bottom: 1px solid #f5f5f5;
}
.buyer-item:last-child {
  border-bottom: none;
}
.delete-buyer-icon {
  position: absolute;
  right: 0;
  top: 10px;
  font-size: 16px;
  color: #999;
  cursor: pointer;
}
.delete-buyer-icon:hover {
  color: #ff2442;
}
.address-card-top {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.consignee-name {
  font-size: 15px;
  color: #333333;
  margin-right: 12px;
}
.phone-number {
  font-size: 14px;
  color: #666666;
  margin-right: 8px;
}
.default-tag {
  background: #f44;
  border-radius: 4px;
}
.address-card-bottom {
  display: flex;
  align-items: flex-start;
  font-size: 14px;
  color: #666666;
  line-height: 1.5;
}
.location-icon {
  font-size: 14px;
  color: #999999;
  margin-right: 6px;
  margin-top: 2px;
}
.full-address {
  flex: 1;
}
.address-card-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  color: #999999;
}
.empty-location-icon {
  font-size: 32px;
  margin-bottom: 10px;
  color: #dddddd;
}
.empty-text {
  font-size: 14px;
  margin-bottom: 15px;
}
.add-address-btn {
  border-radius: 20px;
  padding: 6px 16px;
}

/* 地址/购票人选择弹窗样式 */
.address-select-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f5f5f5;
}
.address-select-header .title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.selected-count-tip {
  padding: 10px 15px;
  font-size: 14px;
  color: #ff2442;
  border-bottom: 1px solid #f5f5f5;
}
.address-list {
  padding: 10px;
  max-height: calc(100% - 60px);
  overflow-y: auto;
}
.address-item {
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  position: relative;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.address-item.active {
  border: 2px solid #f44;
}
.address-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f8f8f8;
}
.address-item-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.address-item-header .name {
  font-size: 15px;
  color: #333;
  margin-right: 10px;
}
.address-item-header .phone {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}
.check-icon {
  color: #f44;
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
}
.address-item-detail {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}
.disabled-text {
  color: #999;
}
.address-empty-tip {
  padding: 20px;
  text-align: center;
}

/* 商品列表样式 */
.goods-wrap {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 18px;
  margin-bottom: 15px;
  margin: 10px;
}
.goods-title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12px;
}
.goods-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f8f8f8;
}
.goods-item:last-child {
  border-bottom: none;
}
.goods-thumb {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  margin-right: 12px;
  object-fit: cover;
}
.goods-info {
  flex: 1;
}
.goods-name {
  font-size: 14px;
  color: #333333;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}
.goods-sku {
  font-size: 13px;
  color: #ff2442;
  margin-bottom: 4px;
  font-weight: 500;
}
.goods-price {
  font-size: 15px;
  font-weight: 600;
  color: #f44;
}
.goods-num {
  font-size: 14px;
  color: #666666;
}
.goods-empty {
  padding: 20px;
  text-align: center;
}

/* 价格计算样式 */
.price-wrap {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 18px;
  margin-bottom: 15px;
  margin: 10px;
}
.price-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #333333;
  margin-bottom: 10px;
  padding: 4px 0;
}
.price-item.total {
  font-size: 16px;
  font-weight: 600;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f8f8f8;
}
.price-item.total span:last-child {
  color: #f44;
}

/* 提交按钮样式 */
.submit-wrap {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 15px;
  background: #fff;
  border-top: 1px solid #f5f5f5;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}
.submit-btn {
  height: 48px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
}

/* 加载状态样式 */
:deep(.van-loading) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 全局样式 */
:deep(.van-button--primary) {
  background-color: #f44;
  border-color: #f44;
}
:deep(.van-tag--primary) {
  background-color: #f44;
}
:deep(.van-tag--success) {
  background-color: #07c160;
}
:deep(.van-tag--warning) {
  background-color: #ff976a;
}
:deep(.van-tag--danger) {
  background-color: #ee0a24;
}
</style>