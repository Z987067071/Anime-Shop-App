import { useUserStore } from '@/stores/user'
import { createRouter, createWebHistory } from 'vue-router'

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
      { path: '/order/pay', name: 'Pay', component:() => import('@/views/Pay.vue'), meta: { requiresAuth: true }},
      { path: '/mine/orderList', name: 'MineOrders', component: () => import('@/views/mine/OrderList.vue'), meta: { requiresAuth: true }},
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

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const NO_AUTH_WHITELIST = ['AdminLogin', 'Login', 'Register']
  const ADMIN_ROLE_WHITELIST = ['admin', 'manager', 'leader', 'member']

  if (NO_AUTH_WHITELIST.includes(to.name)) {
    next()
    return
  }

  if (!userStore.token) {
    const isAdminPage = to.path.startsWith('/admin')
    next({
      path: isAdminPage ? '/admin/login' : '/login',
      query: { redirect: to.fullPath }
    })
    return
  }

  if (to.meta.adminOnly) {
    if (!ADMIN_ROLE_WHITELIST.includes(userStore.role)) {
      next({ path: '/' })
      return
    }
  }

  next()
})

export default router