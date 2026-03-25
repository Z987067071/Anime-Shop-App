import request from "@/utils/request";

export function getFeedbackReplyList(feedbackId) {
  return request({
    url: '/mobile/feedback/reply/list',
    method: 'get',
    params: { feedbackId }
  })
}

/**
 * 添加工单回复
 * @param {Object} data - 回复参数
 * @param {Number} data.feedbackId - 工单ID
 * @param {Number} data.userId - 用户ID
 * @param {String} data.content - 回复内容
 * @param {Number} data.isAdmin - 是否管理员（0-用户 1-管理员）
 */
export function addFeedbackReply(data) {
  return request({
    url: '/mobile/feedback/reply',
    method: 'post',
    data: data
  })
}

/**
 * 批量上传反馈图片
 * @param {FormData} formData - 包含图片文件的FormData对象（key为files）
 */
export function uploadFeedbackImage(formData) {
  return request({
    url: '/mobile/feedback/uploadImage',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 提交工单反馈
 * @param {Object} data - 反馈参数
 * @param {Number} data.userId - 用户ID
 * @param {String} data.feedbackContent - 反馈内容
 * @param {String} data.creator - 用户昵称
 * @param {Array} data.imageUrls - 图片URL列表
 */
export function addFeedback(data) {
  return request({
    url: '/mobile/feedback/add',
    method: 'post',
    data: data
  })
}

/**
 * 查询用户工单列表
 * @param {Object} params - 查询参数
 * @param {Number} params.userId - 用户ID
 * @param {Number} [params.status] - 工单状态（0-待审核 1-审核中 2-已解决 3-已驳回 4-已关闭）
 * @param {Number} [params.page=1] - 页码
 * @param {Number} [params.size=10] - 每页条数
 */
export function getFeedbackList(params) {
  return request({
    url: '/mobile/feedback/list',
    method: 'get',
    params: params
  })
}

/**
 * 查询工单详情
 * @param {Object} params - 查询参数
 * @param {Number} params.id - 工单ID
 * @param {Number} params.userId - 用户ID
 */
export function getFeedbackDetail(params) {
  return request({
    url: `/mobile/feedback/detail/${params.id}`,
    method: 'get',
    params: {
      userId: params.userId
    }
  })
}