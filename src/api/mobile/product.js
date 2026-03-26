import request from '@/utils/request'

/**
 * 移动端 - 按二级分类查询上架商品
 */
export function getProductListByCategory(categoryId) {
  return request({
    url: `/mobile/product/category/${categoryId}`,
    method: 'get'
  })
}

/**
 * 移动端 - 按IP（tag）查询上架商品
 * @param {String} tag 商品标签（tag）
 * @returns {Promise} 商品列表Promise对象
 */
export function getProductListByTag(tag) {
  return request({
    url: `/mobile/product/tag/${tag}`,
    method: 'get'
  })
}

/**
 * 移动端 - 查询商品详情
 * @param {Number|String} id 商品ID
 * @returns {Promise} 商品详情Promise对象
 */
export function getMobileProductDetail(id) {
  return request({
    url: `/mobile/product/detail/${id}`,
    method: 'get'
  })
}

export function getProductListByFirstCategory(firstCategoryId, pageParams = {}) {
  const { pageNum = 1, pageSize = 10 } = pageParams
  return request({
    url: `/mobile/product/first-category/${firstCategoryId}`,
    method: 'get',
    params: { pageNum, pageSize }
  })
}

export const searchProductList = (params) => {
  return request({
    url: '/mobile/product/search',
    method: 'get',
    params
  })
}

// 首页全商品列表（分页）
export function getHomeProductList(pageParams = {}) {
  const { pageNum = 1, pageSize = 10 } = pageParams
  return request({
    url: '/mobile/product/list',
    method: 'get',
    params: { pageNum, pageSize }
  })
}

/**
 * 移动端 - 校验商品/票种状态和库存
 * @param {Number|String} productId
 * @param {Number|String} skuId
 * @returns {Promise}
 */
export function checkProductStatus(productId, skuId = '') {
  return request({
    url: '/mobile/product/check-status',
    method: 'get',
    params: { productId, skuId }
  })
}

/**
 * 收藏/取消收藏商品
 */
export function collectProduct(data) {
  return request({
    url: '/mobile/product/collect',
    method: 'post',
    params: data
  })
}

/**
 * 查询用户收藏的商品列表
 */
export function getCollectList(params) {
  return request({
    url: '/mobile/product/collect/list',
    method: 'get',
    params
  })
}

/**
 * 商品点赞/取消点赞
 * @returns 
 */
export const likeProduct = (productId, isLike) => {
  return request({
    url: `/mobile/product/like/${productId}`,
    method: 'post',
    params: {
      isLike,
      userId: localStorage.getItem('id') || ''
    }
  })
}

/**
 * 获取商品点赞状态和数量
 */
export const getProductLikeInfo = (productId) => {
  return request({
    url: `/mobile/product/like/info/${productId}`,
    method: 'get',
    params: {
      userId: localStorage.getItem('id') || ''
    }
  })
}

export const getProductCommentCount = (productId) => {
  return request({
    url: '/mobile/product/comment/count/' + productId,
    method: 'get'
  })
}

export const getCommentList = (params) => {
  return request({
    url: '/mobile/product/comment/list',
    method: 'get',
    params,
    headers: {
      token: params.token || ''
    }
  })
}

export const toggleCommentLike = (commentId, token) => {
  return request({
    url: `/mobile/product/comment/like/${commentId}`,
    method: 'post',
    headers: {
      token
    }
  })
}

export const deleteComment = (commentId, token) => {
  return request({
    url: `/mobile/product/comment/delete/${commentId}`,
    method: 'post',
    headers: {
      token
    }
  })
}

/**
 * 发表评论/回复评论（通用方法）
 */
export const submitComment = (data, token) => {
  return request({
    url: '/mobile/product/comment/add',
    method: 'post',
    data,
    headers: {
      token
    }
  })
}

export const uploadCommentImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/mobile/product/comment/upload/image',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
      'token': localStorage.getItem('token')
    },
    data: formData
  })
}