import request from "@/utils/request";

/**
 * 后台分页查询工单（POST /api/admin/feedback/page）
 */
export function getAdminFeedbackPage(params) {
  return request({
    url: '/admin/feedback/page',
    method: 'post',
    data: params
  });
}

/**
 * 查询工单详情（GET /api/admin/feedback/detail/{id}）
 */
export function getFeedbackDetail(id) {
  return request({
    url: `/admin/feedback/detail/${id}`,
    method: 'get'
  });
}

/**
 * 查询工单回复列表（GET /api/admin/feedback/reply/list/{feedbackId}）
 */
export function getFeedbackReplyList(feedbackId) {
  // 修正：使用 path 参数，不是 query 参数
  return request({
    url: `/admin/feedback/reply/list/${feedbackId}`,
    method: 'get'
  });
}

/**
 * 管理员回复工单（POST /api/admin/feedback/reply）
 */
export function addAdminFeedbackReply(data) {
  return request({
    url: '/admin/feedback/reply',
    method: 'post',
    data
  });
}

/**
 * 审核工单（POST /api/admin/feedback/audit）
 */
export function auditFeedback(data) {
  return request({
    url: '/admin/feedback/audit',
    method: 'post',
    data
  });
}

/**
 * 快捷修改工单状态（POST /api/admin/feedback/updateStatus/{id}）
 * 用于快速切换状态，不需要填写审核备注
 */
export function updateFeedbackStatus(id, status) {
  return request({
    url: `/admin/feedback/updateStatus/${id}`,
    method: 'post',
    params: { status }  // 使用 query 参数传递 status
  });
}

/**
 * 删除工单（如果后端有实现的话，目前 Controller 中没有，预留）
 */
export function deleteFeedback(id) {
  return request({
    url: `/admin/feedback/delete/${id}`,
    method: 'delete'
  });
}