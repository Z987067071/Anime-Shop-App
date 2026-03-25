import request from '@/utils/request'

export function getReportPage(params) {
  return request({
    url: '/admin/report/list',
    method: 'get',
    params
  })
}

export function handleReport(reportId, data) {
  return request({
    url: `/admin/report/handle/${reportId}`,
    method: 'post',
    data
  })
}