import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCartList, addCart, deleteCart } from '@/api/mobile/cart'
import { useUserStore } from '@/stores/user'

export const useCartStore = defineStore('cart', () => {
  const cartList = ref([])
  const userId = ref('')
  const selectedCartIds = ref(new Set())
  const userStore = useUserStore()

  // 加载购物车（适配SKU/票种字段）
  async function loadCart(uid) {
    userId.value = Number(uid)
    const res = await getCartList(uid)
    selectedCartIds.value.clear()
    // 扩展字段：skuId、ticketType（票种名称），保证类型正确
    cartList.value = (res.data || []).map(item => ({
      ...item,
      id: Number(item.id),
      goodsId: Number(item.goodsId),
      userId: Number(item.userId),
      num: Number(item.num) || 1,
      price: Number(item.price) || 0,
      skuId: item.skuId || '',        // 新增：票种SKU ID
      ticketType: item.ticketType || '', // 新增：票种名称（早鸟票/VIP票）
      checked: false
    }))
  }

  // 加入购物车（新增SKU参数，支持票务商品）
  async function addToCart(goodsId, num = 1, skuId = '', ticketType = '', price = 0) {
    userId.value = Number(userStore.id) || userId.value
    if (!userId.value || userId.value === 0) {
      throw new Error('请先登录')
    }
    // 调用后端接口时，传递SKU/票种参数
    await addCart({ 
      userId: userId.value, 
      goodsId: Number(goodsId),
      num: Number(num),
      skuId: skuId,          // 新增：票种SKU ID
      ticketType: ticketType, // 新增：票种名称
      price: Number(price)    // 新增：票种单价（避免后端重新查询）
    })
    // 重新加载购物车，同步最新数据
    await loadCart(userId.value)
  }

  // 修改商品数量（兼容SKU商品）
  function changeNum(cartId, newNum) {
    if (newNum < 1) return
    const targetItem = cartList.value.find(item => item.id === cartId)
    if (targetItem) targetItem.num = newNum
  }

  // 单选切换（逻辑不变，兼容SKU商品）
  function toggleSelect(cartId, checked) {
    const id = Number(cartId)
    
    if (checked) {
      selectedCartIds.value.add(id)
    } else {
      selectedCartIds.value.delete(id)
    }
    
    // 同步更新 item.checked
    const item = cartList.value.find(item => item.id === id)
    if (item) {
      item.checked = checked
    }
  }

  // 全选切换（逻辑不变）
  function toggleAllSelect(checked) {
    selectedCartIds.value.clear()
    
    cartList.value.forEach(item => {
      item.checked = checked
      if (checked) {
        selectedCartIds.value.add(item.id)
      }
    })
  }

  // 删除购物车商品（逻辑不变）
  async function removeCart(cartId) {
    await deleteCart(cartId)
    cartList.value = cartList.value.filter(item => item.id !== cartId)
    selectedCartIds.value.delete(cartId)
  }

  // 选中的商品列表（包含SKU参数）
  const selectedList = computed(() => {
    return cartList.value.filter(item => selectedCartIds.value.has(item.id))
  })

  // 选中商品总价（逻辑不变）
  const totalPrice = computed(() => {
    const total = selectedList.value.reduce((sum, item) => {
      return sum + (Number(item.price) * Number(item.num))
    }, 0)
    return total.toFixed(2)
  })

  // 全选状态（逻辑不变）
  const isAllSelected = computed(() => {
    if (cartList.value.length === 0) return false
    return cartList.value.every(item => item.checked === true)
  })

  // 结算提交数据（新增SKU/票种参数，适配确认订单页）
  const getSubmitData = computed(() => {
    return selectedList.value.map(item => ({
      cartId: item.id,
      goodsId: item.goodsId,
      goodsName: item.goodsName,
      goodsImage: item.goodsImage,
      num: item.num,
      price: item.price,
      skuId: item.skuId,          // 新增：传递票种SKU ID
      ticketType: item.ticketType, // 新增：传递票种名称
      isTicket: item.isTicket || 0
    }))
  })

  return {
    cartList,
    selectedCartIds,
    loadCart,
    addToCart,
    changeNum,
    toggleSelect,
    toggleAllSelect,
    removeCart,
    selectedList,
    totalPrice,
    isAllSelected,
    getSubmitData
  }
})