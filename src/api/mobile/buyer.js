import request from '@/utils/request'

export function getBuyerList(params) {
  return request({
    url: '/mobile/buyer/list',
    method: 'get',
    params: params
  })
}

export function addBuyer(data) {
  if (!data.name) {
    return Promise.reject(new Error('请输入购票人姓名'))
  }
  if (!data.idCard || data.idCard.length !== 18) {
    return Promise.reject(new Error('请输入正确的18位身份证号'))
  }
  
  return request({
    url: '/mobile/buyer/add',
    method: 'post',
    data
  })
}

export function editBuyer(id, data) {
  return request({
    url: '/mobile/buyer/edit/' + id,
    method: 'put',
    data: data
  })
}

export function deleteBuyer(options) {
  const { id, userId } = options
  if (!id) {
    return Promise.reject(new Error('购票人ID不能为空'))
  }
  
  return request({
    url: `/mobile/buyer/delete/${id}`,
    method: 'delete',
    params: { userId: userId}
  })
}

export function getBuyerDetail(options) {
  const { id, userId } = options
  if (!id) {
    return Promise.reject(new Error('购票人ID不能为空'))
  }
  
  return request({
    url: `/mobile/buyer/detail/${id}`,
    method: 'get',
    params: { userId: userId}
  })
}