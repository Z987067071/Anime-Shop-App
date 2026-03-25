import request from "@/utils/request";

/**
 * 后台工单管理相关接口封装
 * 统一管理工单的查询、详情、回复、审核、删除等操作
 */

/**
 * 后台分页查询工单（POST /api/admin/feedback/page）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页条数
 * @param {string|number} [params.status] - 工单状态（0-待审核 1-审核中 2-已解决 3-已驳回 4-已关闭）
 * @param {string|number} [params.userId] - 用户ID
 * @param {string} [params.keyword] - 工单内容/用户昵称关键词
 * @param {string} [params.startTime] - 开始时间（格式：YYYY-MM-DD HH:mm:ss）
 * @param {string} [params.endTime] - 结束时间（格式：YYYY-MM-DD HH:mm:ss）
 * @returns {Promise} 请求Promise对象
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
 * @param {string|number} id - 工单ID
 * @returns {Promise} 请求Promise对象
 */
export function getFeedbackDetail(id) {
  return request({
    url: `/admin/feedback/detail/${id}`,
    method: 'get'
  });
}

/**
 * 查询工单回复列表（GET /api/admin/feedback/reply/list/{feedbackId}）
 * @param {string|number} feedbackId - 工单ID
 * @returns {Promise} 请求Promise对象
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
 * @param {Object} data - 回复参数
 * @param {string|number} data.feedbackId - 工单ID
 * @param {string|number} data.userId - 回复人ID（管理员ID）
 * @param {string} data.content - 回复内容
 * @param {number} data.isAdmin - 是否管理员回复（固定为1）
 * @param {string} data.replyer - 回复人昵称
 * @returns {Promise} 请求Promise对象
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
 * @param {Object} data - 审核参数
 * @param {string|number} data.id - 工单ID
 * @param {number} data.status - 审核状态（2-已解决 3-已驳回 4-已关闭）
 * @param {string} [data.replyContent] - 审核备注（驳回时必填）
 * @param {string} data.auditor - 审核人昵称
 * @param {string|number} data.auditorId - 审核人ID
 * @returns {Promise} 请求Promise对象
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
 * @param {string|number} id - 工单ID
 * @param {number} status - 目标状态
 * @returns {Promise} 请求Promise对象
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
 * @param {string|number} id - 工单ID
 * @returns {Promise} 请求Promise对象
 */
export function deleteFeedback(id) {
  return request({
    url: `/admin/feedback/delete/${id}`,
    method: 'delete'
  });
}