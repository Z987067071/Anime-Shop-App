import request from '@/utils/request'

/**
 * 收货地址相关接口
 */

// 1. 获取用户地址列表
export function getAddressList(params) {
  return request({
    url: '/mobile/address/list',
    method: 'get',
    params
  })
}

// 2. 获取单个地址详情
export function getAddressDetail(id, params) {
  return request({
    url: `/mobile/address/detail/${id}`,
    method: 'get',
    params
  })
}

// 3. 新增收货地址
export function addAddress(data) {
  return request({
    url: '/mobile/address/add',
    method: 'post',
    data
  })
}

// 4. 编辑收货地址
export function editAddress(data) {
  return request({
    url: '/mobile/address/edit',
    method: 'post',
    data
  })
}

// 5. 删除收货地址
export function deleteAddress(id, params) {
  return request({
    url: `/mobile/address/delete/${id}`,
    method: 'delete',
    params
  })
}

// 6. 获取用户默认地址
export function getDefaultAddress(params) {
  return request({
    url: '/mobile/address/default',
    method: 'get',
    params
  })
}

export function editNickname(data){
  return request({
    url: '/mobile/user/editNickname',
    method: 'post',
    data
  })
}