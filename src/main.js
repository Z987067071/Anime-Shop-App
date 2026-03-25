import { createApp } from 'vue'
import App from './App.vue'

import router from './router'
import request from '@/utils/request'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'


import Vant from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)
app.config.globalProperties.$request = request
// element icon
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(router).use(createPinia()).use(Vant).use(ElementPlus).mount('#app')