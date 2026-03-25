<template>
  <!-- 移除 route 属性，手动控制跳转和选中状态 -->
  <van-tabbar v-model="active" active-color="#ff6f91">
    <van-tabbar-item icon="home-o" @click="switchTab('/')">首页</van-tabbar-item>
    <van-tabbar-item icon="apps-o" @click="switchTab('/category')">分类</van-tabbar-item>
    <van-tabbar-item icon="shopping-cart-o" @click="switchTab('/cart')">购物车</van-tabbar-item>
    <van-tabbar-item icon="user-o" @click="switchTab('/mine')">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const active = ref(0);

const switchTab = (path) => {
  router.push({ path, replace: true });
  updateActiveByPath(path);
};

const updateActiveByPath = (path) => {
  switch (path) {
    case '/category':
      active.value = 1;
      break;
    case '/cart':
      active.value = 2;
      break;
    case '/mine':
      active.value = 3;
      break;
    default:
      active.value = 0;
      break;
  }
};

watch(
  () => route.fullPath,
  (newPath) => {
    updateActiveByPath(newPath);
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  updateActiveByPath(route.fullPath);
});
</script>

<style scoped>
/* 确保TabBar组件自身高度正常 */
:deep(.van-tabbar) {
  height: 50px;
  line-height: 50px;
}
:deep(.van-tabbar-item) {
  height: 100%;
}
</style>