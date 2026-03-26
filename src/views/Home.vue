<template>
  <div class="layout">
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => router.go(-1)
const goSearch = () => router.push('/search')
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: #f5f5f5;
  -webkit-overflow-scrolling: touch;
}

.top-bar, .tab-bar-wrap {
  display: none;
}
</style>