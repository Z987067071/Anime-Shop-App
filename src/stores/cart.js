import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCartList, addCart, deleteCart } from '@/api/mobile/cart'
import { useUserStore } from '@/stores/user'

export const useCartStore = defineStore('cart', () => {
  const cartList = ref([])
  const userId = ref('')
  const selectedCartIds = ref(new Set())
  const userStore = useUserStore()

  async function loadCart(uid) {
    userId.value = Number(uid)
    const res = await getCartList(uid)
    selectedCartIds.value.clear()
    cartList.value = (res.data || []).map(item => ({
      ...item,
      id: Number(item.id),
      goodsId: Number(item.goodsId),
      userId: Number(item.userId),
      num: Number(item.num) || 1,
      price: Number(item.price) || 0,
      skuId: item.skuId || '', 
      ticketType: item.ticketType || '',
      checked: false
    }))
  }

  async function addToCart(goodsId, num = 1, skuId = '', ticketType = '', price = 0) {
    userId.value = Number(userStore.id) || userId.value
    if (!userId.value || userId.value === 0) {
      throw new Error('请先登录')
    }
    await addCart({ 
      userId: userId.value, 
      goodsId: Number(goodsId),
      num: Number(num),
      skuId: skuId,
      ticketType: ticketType,
      price: Number(price)
    })
    await loadCart(userId.value)
  }

  function changeNum(cartId, newNum) {
    if (newNum < 1) return
    const targetItem = cartList.value.find(item => item.id === cartId)
    if (targetItem) targetItem.num = newNum
  }

  function toggleSelect(cartId, checked) {
    const id = Number(cartId)
    
    if (checked) {
      selectedCartIds.value.add(id)
    } else {
      selectedCartIds.value.delete(id)
    }
    
    const item = cartList.value.find(item => item.id === id)
    if (item) {
      item.checked = checked
    }
  }

  function toggleAllSelect(checked) {
    selectedCartIds.value.clear()
    
    cartList.value.forEach(item => {
      item.checked = checked
      if (checked) {
        selectedCartIds.value.add(item.id)
      }
    })
  }

  async function removeCart(cartId) {
    await deleteCart(cartId)
    cartList.value = cartList.value.filter(item => item.id !== cartId)
    selectedCartIds.value.delete(cartId)
  }

  const selectedList = computed(() => {
    return cartList.value.filter(item => selectedCartIds.value.has(item.id))
  })

  const totalPrice = computed(() => {
    const total = selectedList.value.reduce((sum, item) => {
      return sum + (Number(item.price) * Number(item.num))
    }, 0)
    return total.toFixed(2)
  })

  const isAllSelected = computed(() => {
    if (cartList.value.length === 0) return false
    return cartList.value.every(item => item.checked === true)
  })

  const getSubmitData = computed(() => {
    return selectedList.value.map(item => ({
      cartId: item.id,
      goodsId: item.goodsId,
      goodsName: item.goodsName,
      goodsImage: item.goodsImage,
      num: item.num,
      price: item.price,
      skuId: item.skuId, 
      ticketType: item.ticketType,
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