import request from '@/utils/request'

// 获取购票人审核分页列表
export function getBuyerAuditPage(params) {
  return request({
    url: '/admin/buyer/list',
    method: 'get',
    params
  })
}

// 审核购票人
export function auditBuyer(data) {
  return request({
    url: '/admin/buyer/audit',
    method: 'post',
    data
  })
}