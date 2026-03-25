<template>
  <div class="login-container">
    <h1 class="logo">Anime Shop</h1>

    <el-form :model="form" :rules="rules" @submit.prevent="onSubmit" class="login-form">
      <el-form-item prop="username">
        <el-input v-model="form.username" placeholder="用户名" />
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="form.password" type="password" placeholder="密码" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" class="submit-btn">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const user = useUserStore()

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const onSubmit = async () => {
  try {
    const { data,code,msg } = await request.post('/login', form)
    const adminRoles = ['admin', 'manager', 'leader','member'];
    if (code !== 0) return alert(msg)
    if (!adminRoles.includes(data.role)) {
      ElMessage.error('无后台管理权限，请使用管理员账号登录');
      return;
    }
    user.login(data.token, data.role,form.username,data.avatar,data.id);
    router.push('/admin');
  } catch (e) {
    ElMessage.error('登录失败：' + e);
    user.logout();
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #e6eaeb 0%, #7ecfe7 100%);
}

.logo {
  font-size: 48px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 40px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.login-form {
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.submit-btn {
  width: 100%;
  margin-top: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  box-shadow: 0 4px 15px 0 rgba(31, 38, 135, 0.4);
}

.submit-btn:hover {
  box-shadow: 0 6px 20px 0 rgba(31, 38, 135, 0.6);
}
</style>