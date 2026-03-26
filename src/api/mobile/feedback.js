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