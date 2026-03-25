// src/api/mobile/comic-con.js
import request from '@/utils/request' // 复用项目已封装的request工具

/**
 * 查询当前用户的漫展票务订单（移动端核心接口）
 * @returns {Promise} 票务订单列表
 */
export function getUserComicConTickets() {
  return request({
    url: '/mobile/user/comic-con/ticket',
    method: 'get'
  })
}

/**
 * 取消漫展票务订单（移动端-待支付订单）
 * @param {Number} orderId 订单ID
 * @returns {Promise} 取消结果
 */
export function cancelComicConOrder(orderId) {
  return request({
    url: `/mobile/order/cancel/${orderId}`,
    method: 'post'
  })
}

/**
 * 申请退票（移动端-已支付未核销订单）
 * @param {Number} orderId 订单ID
 * @returns {Promise} 退票结果
 */
export function refundComicConOrder(orderId) {
  return request({
    url: `/mobile/order/refund/${orderId}`,
    method: 'post'
  })
}

/**
 * 票务订单支付（移动端-待支付订单）
 * @param {Number} orderId 订单ID
 * @param {Number} payType 支付方式（1=支付宝，2=微信）
 * @returns {Promise} 支付参数/结果
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
 * @param {Number} orderId 订单ID
 * @returns {Promise} 订单详情
 */
export function getComicConOrderDetail(orderId) {
  return request({
    url: `/api/mobile/order/detail/${orderId}`,
    method: 'get'
  })
}