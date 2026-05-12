import axios from 'axios'
import { showToast } from 'vant'
<<<<<<< HEAD
=======
import router from '@/router'
>>>>>>> master

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 防止 401 重复触发跳转
let isRedirectingToLogin = false

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.token = token
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

const DISABLED_CODE = 10008

request.interceptors.response.use(
  response => {
    const data = response.data
    // 账户被禁用，踢出登录
    if (data?.code === DISABLED_CODE) {
      if (!isRedirectingToLogin) {
        isRedirectingToLogin = true
        localStorage.removeItem('token')
        localStorage.removeItem('id')
        localStorage.removeItem('role')
        localStorage.removeItem('username')
        localStorage.removeItem('avatar')
        showToast('账号已被禁用，请联系管理员')
        setTimeout(() => {
          isRedirectingToLogin = false
          window.location.href = '/login'
        }, 1500)
      }
      return Promise.reject(new Error(data.msg))
    }
    return data
  },
  error => {
    const status = error.response?.status
    const msg = error.response?.data?.msg || error.message || '网络错误'
<<<<<<< HEAD

    if (status === 401) {
      if (!isRedirectingToLogin) {
        isRedirectingToLogin = true
        localStorage.removeItem('token')
        localStorage.removeItem('id')
        localStorage.removeItem('role')
        localStorage.removeItem('username')
        localStorage.removeItem('avatar')
        showToast('登录已过期，请重新登录')
        setTimeout(() => {
          isRedirectingToLogin = false
          window.location.href = '/login'
        }, 1200)
      }
    } else {
      showToast(msg)
=======
    showToast(msg)
    if (error.response?.status === 401) {
      const isAdminPage = router.currentRoute.value.path.startsWith('/admin')
      router.replace(isAdminPage ? '/admin/login' : '/login')
>>>>>>> master
    }

    return Promise.reject(error)
  }
)

export default request