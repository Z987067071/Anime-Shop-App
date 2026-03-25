import request from '@/utils/request'

export default {
  // 社区帖子列表
  getPostList(params) {
    return request({
      url: '/mobile/community/post/list',
      method: 'get',
      params
    })
  },

  // 发布帖子
  publishPost(data) {
    return request({
      url: '/mobile/community/post/addPost',
      method: 'post',
      data
    })
  },

  // 帖子图片
  uploadPostImage(formData) {
    return request({
      url: '/mobile/community/post/uploadImage',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 帖子详情
  getPostDetail(id) {
    return request({
      url: `/mobile/community/post/detail/${id}`,
      method: 'get'
    })
  },

  // 帖子点赞
  likePost(postId) {
    return request({
      url: `/mobile/community/post/like/${postId}`,
      method: 'get'
    })
  },

  // 社区帖子评论
  getCommunityCommentList(params) {
    return request({
      url: '/mobile/community/comment/list',
      method: 'get',
      params
    })
  },

  // 帖子评论/回复
  publishCommunityComment(data) {
    return request({
      url: '/mobile/community/comment/add',
      method: 'post',
      data
    })
  },

  // 帖子评论删除
  deleteCommunityComment(commentId) {
    return request({
      url: `/mobile/community/comment/delete/${commentId}`,
      method: 'post'
    })
  },

  // 帖子评论点赞
  toggleCommunityCommentLike(commentId) {
    return request({
      url: `/mobile/community/comment/like/${commentId}`,
      method: 'post'
    })
  },

  // 帖子评论图片上传
  uploadCommunityCommentImage(formData) {
    return request({
      url: '/mobile/community/comment/upload/image',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  getCommentCount: (postId) => {
    return request({
      url: `/mobile/community/comment/count/${postId}`,
      method: 'get'
    })
  }

}