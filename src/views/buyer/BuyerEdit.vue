<template>
  <div class="buyer-edit-page">
    <header class="glass-header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <van-icon name="arrow-left" />
        </div>
        <h1 class="page-title">编辑购票人</h1>
        <div class="header-spacer"></div>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 购票人表单卡片 -->
      <div class="form-card" v-if="buyerDetail">
        <div class="card-header">
          <div class="header-icon">👤</div>
          <span>修改购票人信息</span>
        </div>

        <van-form @submit="onSubmit" class="buyer-form">
          <!-- 姓名 -->
          <div class="form-item">
            <div class="item-label">
              <van-icon name="user-o" />
              <span>姓名</span>
            </div>
            <van-field
              v-model="form.name"
              placeholder="请输入真实姓名（与身份证一致）"
              :rules="[{ required: true, message: '请输入姓名' }]"
              class="custom-field"
            />
          </div>

          <!-- 身份证号 -->
          <div class="form-item">
            <div class="item-label">
              <van-icon name="idcard-o" />
              <span>身份证号</span>
            </div>
            <van-field
              v-model="form.idCard"
              placeholder="请输入18位身份证号码"
              maxlength="18"
              :rules="[
                { required: true, message: '请输入身份证号' },
                { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入正确的18位身份证号' }
              ]"
              class="custom-field"
              :disabled="buyerDetail.auditStatus === 1"
            />
            <div class="field-tip">
              <van-icon name="info-o" />
              <span>购票人信息仅用于票务核验，严格保密</span>
              <span v-if="buyerDetail.auditStatus === 1" class="audit-tip">（已审核的身份证号不可修改）</span>
            </div>
          </div>

          <!-- 审核状态提示 -->
          <div class="status-tip" v-if="buyerDetail.auditStatus !== 0">
            <van-icon name="warning-o" />
            <span v-if="buyerDetail.auditStatus === 1">当前购票人已审核通过，仅姓名可修改</span>
            <span v-if="buyerDetail.auditStatus === 2">当前购票人审核驳回，可修改后重新提交审核</span>
          </div>
        </van-form>
      </div>

      <!-- 加载中/无数据 -->
      <div class="empty-state" v-else>
        <van-icon name="loading" class="loading-icon" />
        <span>加载中...</span>
      </div>

      <!-- 保存按钮 -->
      <div class="submit-section">
        <button class="submit-btn" @click="onSubmit" :disabled="!buyerDetail">
          <van-icon name="success" />
          <span>保存修改</span>
        </button>
      </div>
    </div>
    <div style="display: none"><TabBar /></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getBuyerDetail, editBuyer } from '@/api/mobile/buyer'
import TabBar from '@/components/TabBar.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 获取路由参数中的购票人ID
const buyerId = route.params.id
// 购票人详情
const buyerDetail = ref(null)
// 编辑表单
const form = ref({
  name: '',
  idCard: '',
  userId: userStore.id
})

// 返回购票人列表页
const goBack = () => {
  router.push({ name: 'BuyerList' })
}

// 加载购票人详情
const loadBuyerDetail = async () => {
  if (!buyerId) {
    ElMessage.error('购票人ID不能为空')
    goBack()
    return
  }
  
  if (!form.value.userId) {
    ElMessage.error('用户未登录，请先登录')
    router.push({ name: 'Login' })
    return
  }

  try {
    const res = await getBuyerDetail({id: buyerId,userId: userStore.id})
    if (res.code === 0 && res.data) {
      buyerDetail.value = res.data
      form.value.name = res.data.name
      form.value.idCard = res.data.idCard
    } else {
      ElMessage.error(res.msg || '获取购票人详情失败')
      goBack()
    }
  } catch (error) {
    ElMessage.error('网络异常，获取购票人详情失败')
    console.error('获取购票人详情失败：', error)
    goBack()
  }
}

// 提交编辑
const onSubmit = async () => {
  if (!buyerDetail.value) return

  // 基础校验
  if (!form.value.name.trim()) {
    ElMessage.warning('请输入购票人真实姓名')
    return
  }
  
  const idCard = form.value.idCard.trim()
  if (!idCard) {
    ElMessage.warning('请输入身份证号码')
    return
  }
  
  if (buyerDetail.value.auditStatus !== 1) {
    const idCardReg = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
    if (!idCardReg.test(idCard)) {
      ElMessage.warning('请输入正确的18位身份证号')
      return
    }
  }

  try {
    // 调用编辑接口
    const res = await editBuyer(buyerId, form.value)
    if (res.code === 0) {
      ElMessage.success('编辑购票人成功，需重新等待审核')
      router.push({ name: 'BuyerList' })
    } else {
      ElMessage.error(res.msg || '编辑失败，请稍后重试')
    }
  } catch (error) {
    ElMessage.error('网络异常，编辑失败')
    console.error('编辑购票人失败：', error)
  }
}

// 页面挂载时加载详情
onMounted(() => {
  loadBuyerDetail()
})
</script>

<style scoped>
.buyer-edit-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 40px;
}

.glass-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 16px;
  max-width: 600px;
  margin: 0 auto;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #333;
  font-size: 20px;
  transition: all 0.3s;
}

.back-btn:active {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(0.95);
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.header-spacer {
  width: 36px;
}

.main-content {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.form-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.header-icon {
  font-size: 24px;
}

.card-header span {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.form-item {
  margin-bottom: 24px;
}

.item-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #666;
  font-size: 14px;
}

.item-label .van-icon {
  font-size: 16px;
  color: #ff2442;
}

.field-tip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  padding-left: 4px;
  font-size: 12px;
  color: #999;
}

.field-tip .van-icon {
  font-size: 11px;
}

.audit-tip {
  color: #ff2442;
  margin-left: 4px;
}

.custom-field {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid transparent;
  transition: all 0.3s;
}

.custom-field:focus-within {
  background: #fff;
  border-color: #ff2442;
  box-shadow: 0 0 0 3px rgba(255, 36, 66, 0.1);
}

:deep(.custom-field .van-field__control) {
  font-size: 15px;
  color: #333;
}

:deep(.custom-field .van-field__control::placeholder) {
  color: #bbb;
}

/* ===== 编辑页面新增样式 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #999;
}

.loading-icon {
  font-size: 24px;
  margin-bottom: 8px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background: #fff8f8;
  border-radius: 8px;
  font-size: 12px;
  color: #ff2442;
  margin-top: 8px;
}

.status-tip .van-icon {
  font-size: 14px;
}

.submit-section {
  margin-top: 24px;
  padding: 0 20px;
}

.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  border: none;
  border-radius: 28px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(255, 36, 66, 0.3);
}

.submit-btn:disabled {
  background: #ccc;
  box-shadow: none;
  cursor: not-allowed;
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.2);
}

.submit-btn .van-icon {
  font-size: 20px;
}

/* ===== 深色模式适配 ===== */
@media (prefers-color-scheme: dark) {
  .buyer-edit-page {
    background: #1a1a2e;
  }
  
  .glass-header {
    background: rgba(26, 26, 46, 0.95);
  }
  
  .page-title {
    color: #fff;
  }
  
  .back-btn {
    color: #fff;
  }
  
  .form-card {
    background: #242442;
  }
  
  .card-header span {
    color: #e0e0e0;
  }
  
  .card-header {
    border-bottom-color: #2a2a4a;
  }
  
  .item-label {
    color: #aaa;
  }
  
  .custom-field {
    background: #1a1a2e;
  }
  
  .custom-field:focus-within {
    background: #242442;
  }
  
  :deep(.custom-field .van-field__control) {
    color: #e0e0e0;
  }
  
  .field-tip {
    color: #888;
  }
  
  .audit-tip {
    color: #ff6b6b;
  }
  
  .empty-state {
    color: #888;
  }
  
  .status-tip {
    background: #2d2424;
    color: #ff6b6b;
  }
}
</style>