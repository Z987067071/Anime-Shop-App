import request from "@/utils/request";

//  移动端分组列表接口
export function getCategoryGroupList() {
  return request({
    url: '/mobile/category/group/list',
    method: 'get'
  })
}