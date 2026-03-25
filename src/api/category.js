import request from "../utils/request";

export function getCategoryList(params) {
  return request({
    url: '/admin/category/list',
    method: 'get',
    params
  })
}


//获取树形分类
export function getCategoryTreeList() {
  return request({
    url: '/admin/category/tree/list',
    method: 'get'
  })
}

//  移动端分组列表接口
export function getCategoryGroupList() {
  return request({
    url: '/admin/category/group/list',
    method: 'get'
  })
}

// 新增分类
export function addCategory(data) {
  return request({
    url: '/admin/category/add',
    method: 'post',
    data
  })
}

// 修改分类
export function editCategory(data) {
  return request({
    url: '/admin/category/edit',
    method: 'post',
    data
  })
}

// 删除分类
export function deleteCategory(id) {
  return request({
    url: `/admin/category/delete/${id}`,
    method: 'post'
  })
}

// 根据ID查询分类
export function getCategoryById(id) {
  return request({
    url: `/admin/category/get/${id}`,
    method: 'get'
  })
}

// 修改排序（复用编辑接口，仅传id和sort）
export function updateCategorySort(data) {
  return request({
    url: '/admin/category/edit',
    method: 'post',
    data
  })
}

// 修改分类状态
export function updateCategoryStatus(data) {
  return request({
    url: '/admin/category/updateStatus',
    method: 'post',
    data
  })
}