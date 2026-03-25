import request from "../utils/request";

// 分页查询用户列表
export function getUsers(params) {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  })
}

// 新增用户
export function addUser(data) {
  return request({
    url: '/admin/users/add',
    method: 'post',
    data
  })
}

// 编辑用户信息
export function editUser(data) {
  return request({
    url: '/admin/users/edit',
    method: 'post',
    data
  })
}

// 重置用户密码
export function resetPassword(data) {
  return request({
    url: 'admin/users/resetPassword',
    method: 'post',
    data
  })
}

// 删除用户账户
export function deleteUser(id, operatorRole) {
  return request({
    url: `/admin/users/deleteAccount/${id}`,
    method: 'delete',
    params: { operatorRole }
  })
}

// 上传用户头像
export function uploadAvatar(formData) {
  return request({
    url: '/admin/users/avatar/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取用户头像
export function getUserAvatar(userId) {
  return request({
    url: `/admin/users/avatar/${userId}`,
    method: 'get'
  })
}

// 校验用户名唯一性
export function checkUsernameUnique(username) {
  return request({
    url: '/admin/users/checkUsernameUnique',
    method: 'get',
    params: { username }
  })
}