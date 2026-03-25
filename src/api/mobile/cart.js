import request from '@/utils/request'

export function getCartList(userId) {
  return request({
    url: '/mobile/cart/list',
    method: 'get',
    params: { userId }
  })
}

export function addCart(data) {
  return request({
    url: '/mobile/cart/add',
    method: 'post',
    data
  })
}

export function updateNum(id, num) {
  return request({
    url: '/mobile/cart/update/num',
    method: 'post',
    params: { id, num }
  })
}

export function deleteCart(id) {
  return request({
    url: '/mobile/cart/delete',
    method: 'delete',
    params: { id }
  })
}