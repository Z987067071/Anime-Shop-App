<template>
  <!-- 仅保留基础布局容器，移除TabBar -->
  <div class="layout">
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 保留通用函数（按需使用）
const goBack = () => router.go(-1)
const goSearch = () => router.push('/search')
</script>

<style scoped>
/* 全屏flex布局 */
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden; /* 禁止整体滚动 */
}

/* 内容区：自动填充剩余高度，仅此处可滚动 */
.content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: #f5f5f5;
  -webkit-overflow-scrolling: touch; /* 移动端顺滑滚动 */
}

/* 移除无用样式 */
.top-bar, .tab-bar-wrap {
  display: none;
}
</style>