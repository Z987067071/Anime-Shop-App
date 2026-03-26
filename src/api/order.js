import request from "../utils/request";

// 分页查询订单列表
export function getOrderList(params) {
  return request({
    url: '/admin/order/page',
    method: 'get',
    params 
  })
}

// 获取订单详情
export function getOrderDetail(id) {
  return request({
    url: `/admin/order/${id}`,
    method: 'get'
  })
}

// 更新订单状态
export function updateOrderStatus(data) {
  return request({
    url: '/admin/order/updateStatus',
    method: 'post',
    data
  })
}


// 删除订单
export function deleteOrder(id) {
  return request({
    url: `/admin/order/${id}`,
    method: 'delete'
  })
}