import request from '@/utils/request'

/**
 * 提交举报（商品评论/社区帖子/社区评论）
 * @param {Object} data - 举报参数
 * @param {Number} data.targetType - 举报目标类型：1=商品，2=商品评论，3=社区帖子，4=社区帖子评论
 * @param {Number} data.targetId - 举报目标ID（评论ID/帖子ID）
 * @param {Number} data.reportReason - 举报理由枚举：1=违反法律规定,2=色情低俗...99=其他
 * @param {String} [data.customReason] - 自定义理由（仅reportReason=99时必填）
 * @returns {Promise}
 */
export const submitReport = (data) => {
  return request({
    url: '/mobile/report/submit',
    method: 'post',
    data
  })
}