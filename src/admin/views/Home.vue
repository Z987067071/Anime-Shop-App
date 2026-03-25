<template>
  <div class="admin-home">
    <el-header class="header">
      <div class="header-left">
        <h1 class="logo">Anime Shop Management</h1>
      </div>
      <div class="header-right">
        <AvatarUpload 
          :avatar-url="user.avatar" 
          @avatar-change="handleAvatarChange"
        />
        <el-button type="text" @click="logout">退出</el-button>
      </div>
    </el-header>

    <el-container class="container">
      <el-aside class="aside">
        <el-menu 
          :default-active="activePath" 
          router 
          class="menu"
          :unique-opened="true"
        >
          <el-menu-item index="/admin/home">
            <template #title>首页</template>
          </el-menu-item>
          <el-sub-menu index="product">
            <template #title>商品</template>
            <el-menu-item index="/admin/product">商品管理</el-menu-item>
            <el-menu-item index="/admin/category">分类管理</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="comic-con">
            <template #title>漫展票务</template>
            <el-menu-item index="/admin/comic-con">漫展管理</el-menu-item>
            <el-menu-item index="/admin/comic-con-ticket">票种管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="order">
            <template #title>订单</template>
            <el-menu-item index="/admin/order">订单管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="audit">
            <template #title>审核</template>
            <el-menu-item index="/admin/report">言论审核</el-menu-item>
            <el-menu-item index="/admin/id-verification">票务身份审核</el-menu-item>
          </el-sub-menu>

          <!-- 恢复和其他模块一致的工单菜单，无额外样式/角标 -->
          <el-sub-menu index="feedback">
            <template #title>工单</template>
            <el-menu-item index="/admin/feedback">工单审核</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="account">
            <template #title>账户</template>
            <el-menu-item index="/admin/account">账户管理</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <el-main class="main">
        <!-- 纯路由视图，和原有逻辑一致，无额外工作台内容 -->
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { ref, watch,onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AvatarUpload from '../components/AvatarUpload.vue';
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()
const user = useUserStore()

const activePath = ref(route.path)

watch(
  () => route.path,
  (newPath) => {
    activePath.value = newPath
  },
  { immediate: true }
)

const handleAvatarChange = (newAvatarUrl) => {
  user.avatar = newAvatarUrl
}

const logout = () => {
  user.logout()
  router.replace('/admin/login')
}
</script>

<style scoped>
.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 4px;
}

:deep(.el-button--text) {
  padding: 8px 12px;
  font-size: 14px;
}

.admin-home {
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  margin: 0;
}

.container {
  display: flex;
  flex: 1;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.aside {
  width: 200px;
  background: #fff;
  border-right: 1px solid #ebeef5;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.menu {
  border: none;
  height: 100%;
}
.el-menu-item.is-active {
  border-left: 3px solid #667eea;
}

.main {
  flex: 1;
  background: #fff;
  padding: 24px;
  border-top: 1px solid #ebeef5;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  margin: 5px;
}
.main::-webkit-scrollbar {
  display: none;
}
</style>