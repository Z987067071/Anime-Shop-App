import request from '@/utils/request'

export function getHomeBannerList() {
  return request({
    url: '/mobile/banner/list',
    method: 'get'
  })
}