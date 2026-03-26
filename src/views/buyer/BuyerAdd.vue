<template>
  <div class="buyer-add-page">
    <header class="glass-header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <van-icon name="arrow-left" />
        </div>
        <h1 class="page-title">新增购票人</h1>
        <div class="header-spacer"></div>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 购票人表单卡片 -->
      <div class="form-card">
        <div class="card-header">
          <div class="header-icon">👤</div>
          <span>填写购票人信息</span>
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
            />
            <div class="field-tip">
              <van-icon name="info-o" />
              <span>购票人信息仅用于票务核验，严格保密</span>
            </div>
          </div>
        </van-form>
      </div>

      <!-- 保存按钮 -->
      <div class="submit-section">
        <button class="submit-btn" @click="onSubmit">
          <van-icon name="success" />
          <span>保存购票人</span>
        </button>
      </div>
    </div>

    <div style="display: none"><TabBar /></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { addBuyer } from '@/api/mobile/buyer'
import TabBar from '@/components/TabBar.vue'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  name: '',
  idCard: '',
  userId: userStore.id
})

const goBack = () => {
  router.push({ name: 'BuyerList' })
}

// 提交表单
const onSubmit = async () => {
  if (!form.value.name.trim()) {
    ElMessage.warning('请输入购票人真实姓名')
    return
  }
  
  const idCard = form.value.idCard.trim()
  if (!idCard) {
    ElMessage.warning('请输入身份证号码')
    return
  }
  
  // 身份证格式校验
  const idCardReg = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  if (!idCardReg.test(idCard)) {
    ElMessage.warning('请输入正确的18位身份证号')
    return
  }

  if (!form.value.userId) {
    ElMessage.error('用户未登录，请先登录')
    router.push({ name: 'Login' })
    return
  }

  try {
    const res = await addBuyer(form.value)
    if (res.code === 0) {
      ElMessage.success('购票人信息添加成功')
      router.push({ name: 'BuyerList' })
    } else {
      ElMessage.error(res.msg || '添加失败，请稍后重试')
    }
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('网络异常，添加失败')
    }
    console.error('新增购票人失败：', error)
  }
}
</script>

<style scoped>
.buyer-add-page {
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

/* ===== 主内容区 ===== */
.main-content {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

/* ===== 表单卡片 ===== */
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

/* ===== 表单项 ===== */
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

/* 字段提示 */
.field-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding-left: 4px;
  font-size: 12px;
  color: #999;
}

.field-tip .van-icon {
  font-size: 11px;
}

/* 自定义输入框 */
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

/* ===== 提交区域 ===== */
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

.submit-btn:active {
  transform: scale(0.98);
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.2);
}

.submit-btn .van-icon {
  font-size: 20px;
}

/* ===== 深色模式适配 ===== */
@media (prefers-color-scheme: dark) {
  .buyer-add-page {
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
}
</style>