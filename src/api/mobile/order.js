import request from '@/utils/request'

// 1. 提交订单
export function submitOrder(params) {
  return request({
    url: '/mobile/order/submit',
    method: 'post',
    data: params
  })
}

// 2. 获取订单详情
export function getOrderDetail(orderId) {
  return request({
    url: `/mobile/order/detail/${orderId}`,
    method: 'get'
  })
}

export function payOrder(orderId, payType) {
  return request({
    url: `/mobile/order/pay/${orderId}/${payType}`,
    method: 'post'
  })
}

// 4. 取消订单
export function cancelOrder(orderId) {
  return request({
    url: `/mobile/order/cancel/${orderId}`,
    method: 'post'
  })
}

// 5. 获取用户订单列表
export function getUserOrders(params) {
  return request({
    url: `/mobile/order/list/${params.userId}`,
    method: 'get',
    params: {
      page: params.page,
      pageSize: params.pageSize,
      status: params.status
    }
  })
}

// 6. 检查订单是否超时
export function checkOrderTimeout(orderId) {
  return request({
    url: `/mobile/order/timeout/${orderId}`,
    method: 'get'
  })
}