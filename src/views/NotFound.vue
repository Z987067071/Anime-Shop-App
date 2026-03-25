<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="not-found-number">404</div>
      <div class="not-found-text">页面走丢啦 😵</div>
      <div class="not-found-desc">
        你访问的路径不存在，可能是输入错误或页面已被移除
      </div>
      <div class="not-found-buttons">
        <el-button 
          type="primary" 
          @click="goHome"
          size="medium"
        >
          回到首页
        </el-button>
        <el-button 
          type="default" 
          @click="goBack"
          size="medium"
          style="margin-left: 12px"
        >
          返回上一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const goHome = () => {
  if (window.location.pathname.startsWith('/admin')) {
    router.push('/admin')
  } else {
    router.push('/')
  }
}

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    ElMessage.warning('暂无上一页记录')
    goHome()
  }
}
</script>

<style scoped>
.not-found-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  padding: 20px;
  box-sizing: border-box;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.not-found-number {
  font-size: 120px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 20px;
  background: linear-gradient(120deg, #409eff, #67c23a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.not-found-text {
  font-size: 24px;
  color: #303133;
  margin-bottom: 16px;
  font-weight: 500;
}

.not-found-desc {
  font-size: 16px;
  color: #606266;
  margin-bottom: 32px;
  line-height: 1.6;
}

.not-found-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .not-found-number {
    font-size: 80px;
  }
  .not-found-text {
    font-size: 20px;
  }
  .not-found-desc {
    font-size: 14px;
  }
  .not-found-buttons {
    flex-direction: column;
    gap: 12px;
  }
  .not-found-buttons el-button {
    width: 100%;
    margin-left: 0 !important;
  }
}
</style>