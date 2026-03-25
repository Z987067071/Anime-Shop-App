import axios from 'axios'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})


request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token){
      config.headers.token = token
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)


request.interceptors.response.use(
  response => response.data,
  error => {
    const msg = error.response?.data?.msg || error.message || '网络错误'
    showToast(msg)
    if (error.response?.status === 401) {
      const router = useRouter()
      router.replace('/login')
    }
    return Promise.reject(error)
  }
)

export default request