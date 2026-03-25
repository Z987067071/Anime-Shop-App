// src/api/product.js
import request from '@/utils/request' // 引入你已封装好的request


// 【核对/补充】商品/票种状态校验接口
export function checkProductStatus(productId, skuId) {
  return request({
    url: '/api/mobile/product/check-status',
    method: 'get',
    params: {
      productId, // 商品ID（必传）
      skuId      // 票种SKU ID（可选，票务商品传，普通商品不传）
    }
  })
}
/**
 * 获取商品分页列表
 */
export function getProductPage(params) {
  return request({
    url: '/admin/product/page',
    method: 'post',
    data: params
  })
}

/**
 * 获取商品详情
 */
export function getProductDetail(id) {
  return request({
    url: `/admin/product/detail/${id}`,
    method: 'get'
  })
}

/**
 * 新增商品
 */
export function addProduct(data) {
  return request({
    url: '/admin/product/add',
    method: 'post',
    data: data
  })
}

/**
 * 编辑商品
 */
export function editProduct(data) {
  return request({
    url: '/admin/product/edit',
    method: 'post',
    data: data
  })
}

/**
 * 修改商品状态
 * @param {Object} data {id, status}
 */
export function updateProductStatus(params) {
  return request({
    url: '/admin/product/updateStatus',
    method: 'post',
    params: params
  })
}

/**
 * 删除商品
 * @param {Number} id 商品ID
 */
export function deleteProduct(id) {
  return request({
    url: `/admin/product/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 获取分类列表
 * @returns {Promise}
 */
export function getCategoryList() {
  return request({
    url: '/admin/category/tree/list',
    method: 'get'
  })
}