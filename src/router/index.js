import { useUserStore } from '@/stores/user'
import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const routes = [
  // 公共路由（免登录）
  { path: '/admin/login', name: 'AdminLogin', component: () => import('@/admin/views/Login.vue') },
  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('@/views/Register.vue')},

  // 后台管理路由（需管理员权限）
  {
    path: '/admin',
    component: () => import('@/admin/views/Home.vue'),
    meta: {
      requiresAuth: true,
      adminOnly: true,
      roles: ['admin']
    },
    children:[
      { path: '', name: 'AdminHome', redirect: 'home'},
      { path: 'home', name: 'AdminIndex', component: () => import('@/admin/views/Index.vue') },
      { path: 'product', name: 'AdminProduct', component: () => import('@/admin/views/Product.vue')},
      { path: 'category', name: 'AdminCategory', component: () => import('@/admin/views/Category.vue') },
      { path: 'order', name: 'AdminOrder', component: () => import('@/admin/views/Order.vue') },
      { path: 'account', name: 'AdminAccount', component: () => import('@/admin/views/Account.vue') },
      { path: 'feedback', name: 'AdminFeedback', component: () => import('@/admin/views/Feedback.vue') },
      { path: 'comic-con', name: 'ComicConManage', component: () => import('@/admin/views/ComicConManage.vue') },
      { path: 'comic-con-ticket', name: 'ComicConTicketManage', component: () => import('@/admin/views/ComicConTicketManage.vue') },
      { path: 'id-verification', name: 'IdentityVerification', component: () => import('@/admin/views/IdentityVerification.vue') },
      { path: 'report', name: 'Report', component: () => import('@/admin/views/Report.vue') }
    ]
  },

  // 移动端路由
  {
    path: '/',
    component: () => import('@/views/Home.vue'),
    meta: {
      requiresAuth: true,
    },
    children:[
      { path: '', name: 'Index', component: () => import('@/views/Index.vue') },
      { path: 'category', name: 'MobileCategory', component: () => import('@/views/Category.vue')},
      { path: 'cart', name: 'Cart', component: () => import('@/views/Cart.vue') },
      { path: 'mine', name: 'Mine', component: () => import('@/views/Mine.vue') }, 
      { path: 'goods/list', name: 'GoodsList', component: () => import('@/views/GoodsList.vue') },
      { path: 'goods/detail/:id', name: 'GoodsDetail', component: () => import('@/views/GoodsDetail.vue') },
      { path: 'goods/comment', name: 'GoodsComment', component: () => import('@/views/GoodsComment.vue') },
      { path: '/search',name: 'Search',component: () => import('@/views/SearchPage.vue')},
      // 一级分类商品列表页
      { path: 'product-list', name: 'ProductList', component: () => import('@/views/ProductList.vue') },
      { path: 'address/list', name: 'AddressList', component: () => import('@/views/address/AddressList.vue') },
      { path: 'address/add', name: 'AddressAdd', component: () => import('@/views/address/AddressAdd.vue') },
      { path: 'address/edit/:id', name: 'AddressEdit', component: () => import('@/views/address/AddressEdit.vue') },
      { path: 'buyer/list', name: 'BuyerList', component: () => import('@/views/buyer/BuyerList.vue'), meta: { requiresAuth: true } },
      { path: 'buyer/add', name: 'BuyerAdd', component: () => import('@/views/buyer/BuyerAdd.vue'), meta: { requiresAuth: true } },
      { path: 'buyer/edit/:id', name: 'BuyerEdit', component: () => import('@/views/buyer/BuyerEdit.vue'), meta: { requiresAuth: true } },
      { path: '/order/confirm', name: 'OrderConfirm', component: () => import('@/views/OrderConfirm.vue'), 
        meta: { requiresAuth: true },
          beforeEnter: (to, from, next) => {
          if (to.query.orderData) {
            try {
              to.meta.orderData = JSON.parse(decodeURIComponent(to.query.orderData))
            } catch (e) {
              console.error('订单数据解析失败：', e)
              next({ path: '/cart' })
              return
            }
          } else {
            next({ path: '/cart' })
            return
          }
          next()
        }},
      { path: '/order/pay', name: 'Pay', component:() => import('@/views/Pay.vue'),meta: {requireAuth: true}},
      { path: '/mine/orderList', name: 'MineOrders', component: () => import('@/views/mine/OrderList.vue'),meta: {requireAuth: true}},
      { path: '/feedback', name: 'Feedback', component: () => import('@/views/mine/feedback/Feedback.vue'),meta: { requiresAuth: true }},
      { path: '/feedback/add', name: 'FeedbackAdd', component: () => import('@/views/mine/feedback/FeedbackAdd.vue'),meta: { requiresAuth: true }},
      { path: '/feedback/detail/:id', name: 'FeedbackDetail', component: () => import('@/views/mine/feedback/FeedbackDetail.vue'), props: true,meta: { requiresAuth: true }},
      { path: '/comic-con/list',name: 'ComicConList', component: () => import('@/views/comic-con/ComicConList.vue'),meta: { title: '漫展列表',requiresAuth: true }},
      { path: '/comic-con/detail/:id', name: 'ComicConDetail', component: () => import('@/views/comic-con/ComicConDetail.vue'),meta: { title: '漫展详情',requiresAuth: true }},
      { path: '/comic-con/my-order', name: 'MyComicConOrder', component: () => import('@/views/comic-con/MyComicConOrder.vue'), meta: { title: '我的票务订单',requiresAuth: true }},
      { path: '/productCollect', name: 'ProductCollect', component: () => import('@/views/mine/ProductCollect.vue'), meta: { title: '商品收藏',requiresAuth: true }},
      { path: '/postList', name: 'PostList', component: () => import('@/views/community/PostList.vue'), meta: { title: '社区帖子',requiresAuth: true }},
      { path: '/postList/detail/:id', name: 'PostDetail', component: () => import('@/views/community/PostDetail.vue'), meta: { title: '社区帖子详情',requiresAuth: true }},
      { path: '/postList/addPost', name: 'PostAdd', component: () => import('@/views/community/PostPublish.vue'), meta: { title: '发布帖子', requiresAuth: true }},
      { path: '/hot', name: 'Hot', component: () => import('@/views/Hot.vue'), meta: { title: '商品排行榜', requiresAuth: true }}
    ]
  },

  // 404路由
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫优化核心
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  // 1. 常量定义（集中管理，易维护）
  const NO_AUTH_WHITELIST = ['AdminLogin', 'Login', 'Register'] // 免登录页面
  const ADMIN_ROLE_WHITELIST = ['admin', 'manager', 'leader', 'member'] // 后台权限角色
  const LOGIN_PAGE_MAP = { // 登录页映射：不同端对应不同登录页
    admin: '/admin/login',
    mobile: '/login'
  }

  // 2. 免登录页面直接放行（优先级最高）
  if (NO_AUTH_WHITELIST.includes(to.name)) {
    next()
    return
  }

  // 3. Token 校验（核心优化）
  // 3.1 无Token：跳对应登录页 + 记录重定向地址
  if (!userStore.token) {
    const isAdminPage = to.path.startsWith('/admin')
    const loginPath = isAdminPage ? LOGIN_PAGE_MAP.admin : LOGIN_PAGE_MAP.mobile
    if (from.name !== NO_AUTH_WHITELIST.find(name => name.includes('Login'))) {
      ElMessage.warning('登录状态已过期，请重新登录')
    }
    
    next({ 
      path: loginPath, 
      query: { redirect: to.fullPath }
    })
    return
  }

  if (to.meta.adminOnly) {
    if (!ADMIN_ROLE_WHITELIST.includes(userStore.role)) {
      ElMessage.error('抱歉，您暂无后台管理权限，请联系管理员')
      next({ path: '/' })
      return
    }

    // 4.2 管理端子路由细粒度权限（可扩展）
    const permissionRules = [
      { path: '/admin/user', roles: ['admin', 'manager'], msg: '无用户管理权限' },
      { path: '/admin/order', roles: ['admin', 'manager', 'leader'], msg: '无订单管理权限' }
    ]
    // 匹配权限规则
    const matchRule = permissionRules.find(rule => to.path === rule.path)
    if (matchRule && !matchRule.roles.includes(userStore.role)) {
      ElMessage.error(matchRule.msg)
      next({ name: 'AdminHome' }) // 跳后台首页
      return
    }
  }

  // 5. 所有校验通过，正常放行
  next()
})

export default router