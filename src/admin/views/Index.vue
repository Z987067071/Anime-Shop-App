<template>
  <div class="admin-home-index">
    <el-breadcrumb 
      separator="/" 
      style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px"
    >
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>后台首页</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="content">
      <h2>后台首页</h2>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="card" border shadow="hover">
            <h3 class="card-title">今日订单</h3>
            <p class="num">100 个订单</p>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="card" border shadow="hover">
            <h3 class="card-title">今日销售额</h3>
            <p class="num">¥ 10000</p>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="card" border shadow="hover">
            <h3 class="card-title">商品总数</h3>
            <p class="num">200 件</p>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="card" border shadow="hover">
            <h3 class="card-title">用户总数</h3>
            <p class="num">500 人</p>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.admin-home-index {
  height: 100%;
}

.content {
  margin-top: 20px;
}

.card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: all 0.3s;
}
.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 16px;
  color: #606266;
  margin: 0 0 15px 0;
}

.num {
  font-size: 28px;
  font-weight: 700;
  color: #667eea;
  margin: 0;
}
</style>