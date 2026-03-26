import request from '@/utils/request'

/**
 * 查询当前用户的漫展票务订单（移动端核心接口）
 */
export function getUserComicConTickets() {
  return request({
    url: '/mobile/user/comic-con/ticket',
    method: 'get'
  })
}

/**
 * 取消漫展票务订单（移动端-待支付订单）
 */
export function cancelComicConOrder(orderId) {
  return request({
    url: `/mobile/order/cancel/${orderId}`,
    method: 'post'
  })
}

/**
 * 申请退票（移动端-已支付未核销订单）
 */
export function refundComicConOrder(orderId) {
  return request({
    url: `/mobile/order/refund/${orderId}`,
    method: 'post'
  })
}

/**
 * 票务订单支付（移动端-待支付订单）
 */
export function payComicConOrder(orderId, payType) {
  return request({
    url: `/mobile/order/pay/${orderId}`,
    method: 'post',
    data: { payType }
  })
}

/**
 * 获取票务订单详情（移动端）
 */
export function getComicConOrderDetail(orderId) {
  return request({
    url: `/api/mobile/order/detail/${orderId}`,
    method: 'get'
  })
}