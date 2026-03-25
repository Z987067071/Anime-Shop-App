import request from '@/utils/request' // 引入你已封装好的request工具
import { getProductPage, getCategoryList } from './product'

export async function getComicProductList() {
  try {
    // 第一步：获取全部分类树
    const categoryRes = await getCategoryList()
    if (categoryRes.code !== 0 || !categoryRes.data) {
      return { code: 1, data: { records: [] }, msg: '获取分类列表失败' }
    }

    // 第二步：递归遍历，只提取【二级分类】中含“漫展”的分类ID
    let comicSecondCateId = null
    // 递归函数：只处理二级分类（categoryLevel === 2）
    const findComicSecondCategory = (categories) => {
      for (const cate of categories) {
        // 先处理当前分类的子分类（保证先找二级）
        if (cate.children && cate.children.length > 0) {
          findComicSecondCategory(cate.children)
          // 找到后直接终止递归
          if (comicSecondCateId) return
        }
        // 核心：只匹配二级分类 + 名称含“漫展”
        if (cate.categoryLevel === 2 && cate.categoryName.includes('漫展')) {
          comicSecondCateId = cate.id
          return
        }
      }
    }
    findComicSecondCategory(categoryRes.data)

    // 未找到漫展相关二级分类，返回空
    if (!comicSecondCateId) {
      return { code: 0, data: { records: [] }, msg: '未找到漫展相关二级分类，请先在商品分类中创建' }
    }

    // 第三步：根据漫展二级分类ID，获取商品（只取上架的漫展虚拟商品）
    const productRes = await getProductPage({
      pageNum: 1,
      pageSize: 100,
      categoryId: comicSecondCateId, // 精准传二级分类ID
      productType: 1, // 额外过滤：只取商品类型为“漫展虚拟商品”的，双重保险
      status: 1       // 只取上架商品
    })

    return {
      code: productRes.code,
      data: productRes.data || { records: [] },
      msg: productRes.msg || 'success'
    }
  } catch (error) {
    console.error('获取漫展商品列表异常：', error)
    return { code: 1, data: { records: [] }, msg: '获取漫展商品列表失败' }
  }
}

/**
 * 新增漫展
 * @param {Object} data 漫展信息对象（包含name、startTime、endTime、venue等字段）
 * @returns {Promise} 请求Promise对象
 */
export function addComicCon(data) {
  return request({
    url: '/admin/comic-con/add', // 如果你选择加/add就用这个路径；如果没加，改成 '/api/admin/comic-con'
    method: 'post',
    data: data
  })
}

/**
 * 删除漫展
 * @param {Number|String} id 漫展ID
 * @returns {Promise} 请求Promise对象
 */
export function deleteComicCon(id) {
  return request({
    url: `/admin/comic-con/${id}`, // 如果你想加/delete，可改成 `/api/admin/comic-con/delete/${id}`
    method: 'delete'
  })
}

/**
 * 修改漫展信息
 * @param {Number|String} id 漫展ID
 * @param {Object} data 要修改的漫展信息
 * @returns {Promise} 请求Promise对象
 */
export function updateComicCon(id, data) {
  return request({
    url: `/admin/comic-con/${id}`, // 如果你想加/update，可改成 `/api/admin/comic-con/update/${id}`
    method: 'put',
    data: data
  })
}

/**
 * 查询单个漫展详情
 * @param {Number|String} id 漫展ID
 * @returns {Promise} 请求Promise对象
 */
export function getComicConDetail(id) {
  return request({
    url: `/admin/comic-con/${id}`, // 如果你想加/detail，可改成 `/api/admin/comic-con/detail/${id}`
    method: 'get'
  })
}

/**
 * 分页查询漫展列表
 * @param {Object} params 查询参数（pageNum、pageSize、name）
 * @returns {Promise} 请求Promise对象
 */
export function getComicConList(params) {
  return request({
    url: '/admin/comic-con/list',
    method: 'get',
    params: params // get请求用params传参，post用data，和后端对应
  })
}

/**
 * 修改漫展状态
 * @param {Number|String} id 漫展ID
 * @param {Number} status 新状态（1-可售 0-停售 2-已结束）
 * @returns {Promise} 请求Promise对象
 */
export function updateComicConStatus(id, status) {
  return request({
    url: `/admin/comic-con/${id}/status`, // 如果你想加/updateStatus，可改成 `/api/admin/comic-con/updateStatus/${id}`
    method: 'put',
    params: { status }
  })
}