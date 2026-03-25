import request from '@/utils/request'

// 分页查询票种列表
export function getTicketList(params) {
  return request({
    url: '/admin/comic-con-ticket/list',
    method: 'get',
    params
  })
}

// 获取所有漫展（用于下拉选择）
export function getComicConList(params = { pageNum: 1, pageSize: 1000 }) {
  return request({
    url: '/admin/comic-con/list',
    method: 'get',
    params
  })
}

// 获取票种详情
export function getTicketDetail(id) {
  return request({
    url: `/admin/comic-con-ticket/${id}`,
    method: 'get'
  })
}

// 新增票种
export function addTicket(data) {
  return request({
    url: '/admin/comic-con-ticket/add',
    method: 'post',
    data
  })
}

// 修改票种
export function updateTicket(id, data) {
  return request({
    url: `/admin/comic-con-ticket/${id}`,
    method: 'put',
    data
  })
}

// 修改票种状态
export function updateTicketStatus(id, status) {
  return request({
    url: `/admin/comic-con-ticket/${id}/status`,
    method: 'put',
    params: { status }
  })
}

// 删除票种
export function deleteTicket(id) {
  return request({
    url: `/admin/comic-con-ticket/${id}`,
    method: 'delete'
  })
}