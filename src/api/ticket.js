import request from "../utils/request";

// 票务核销
export function verifyTicket(data) {
  return request({
    url: '/admin/ticket/verify',
    method: 'post',
    data
  })
}

// 分页查询核销日志
export function getVerifyLogList(params) {
  return request({
    url: '/admin/ticket/verifyLog/page',
    method: 'get',
    params
  })
}