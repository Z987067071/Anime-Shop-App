<template>
  <div class="address-add-page">
    <header class="glass-header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <van-icon name="arrow-left" />
        </div>
        <h1 class="page-title">新增收货地址</h1>
        <div class="header-spacer"></div>
      </div>
    </header>

    <div class="main-content">
      <!-- 地址表单卡片 -->
      <div class="form-card">
        <div class="card-header">
          <div class="header-icon">📦</div>
          <span>填写收货信息</span>
        </div>

        <van-form @submit="onSubmit" class="address-form">
          <!-- 收货人 -->
          <div class="form-item">
            <div class="item-label">
              <van-icon name="user-o" />
              <span>收货人</span>
            </div>
            <van-field
              v-model="form.consignee"
              placeholder="请输入收货人姓名"
              :rules="[{ required: true, message: '请输入收货人姓名' }]"
              class="custom-field"
            />
          </div>

          <!-- 手机号 -->
          <div class="form-item">
            <div class="item-label">
              <van-icon name="phone-o" />
              <span>手机号</span>
            </div>
            <van-field
              v-model="form.phone"
              placeholder="请输入手机号"
              type="tel"
              maxlength="11"
              :rules="[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
              ]"
              class="custom-field"
            />
          </div>

          <!-- 地区选择 -->
          <div class="form-item">
            <div class="item-label">
              <van-icon name="location-o" />
              <span>所在地区</span>
            </div>
            <div class="region-picker" @click="showRegionPicker = true">
              <span v-if="!regionText" class="placeholder">请选择省/市/区</span>
              <span v-else class="selected">{{ regionText }}</span>
              <van-icon name="arrow" class="picker-arrow" />
            </div>
          </div>

          <!-- 详细地址 -->
          <div class="form-item">
            <div class="item-label">
              <van-icon name="home-o" />
              <span>详细地址</span>
            </div>
            <van-field
              v-model="form.detailAddress"
              placeholder="请输入街道/门牌号/楼层"
              type="textarea"
              rows="2"
              :rules="[{ required: true, message: '请输入详细地址' }]"
              class="custom-field textarea-field"
            />
          </div>

          <!-- 默认地址开关 -->
          <div class="form-item switch-item">
            <div class="switch-label">
              <div class="label-main">
                <van-icon name="star-o" />
                <span>设为默认地址</span>
              </div>
              <span class="label-desc">每次下单时会推荐使用该地址</span>
            </div>
            <van-switch
              v-model="form.isDefault"
              :active-value="1"
              :inactive-value="0"
              size="22px"
              active-color="#ff2442"
            />
          </div>
        </van-form>
      </div>

      <!-- 保存按钮 -->
      <div class="submit-section">
        <button class="submit-btn" @click="onSubmit">
          <van-icon name="success" />
          <span>保存地址</span>
        </button>
      </div>
    </div>

    <!-- 地区选择弹窗 -->
    <van-popup
      v-model:show="showRegionPicker"
      position="bottom"
      round
      class="region-popup"
    >
      <van-cascader
        v-model="regionValue"
        title="选择所在地区"
        :options="regionOptions"
        @close="showRegionPicker = false"
        @finish="onRegionConfirm"
      />
    </van-popup>

    <div style="display: none"><TabBar /></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { addAddress } from '@/api/mobile/mine'
import { regionOptions } from '@/utils/regionOptions'
import TabBar from '@/components/TabBar.vue'

const router = useRouter()
const userStore = useUserStore()

const redirectBack = () => {
  router.back()
}

// 地区选择
const showRegionPicker = ref(false)
const regionValue = ref('')
const regionText = computed(() => {
  if (!form.value.province) return ''
  return `${form.value.province} ${form.value.city} ${form.value.district}`
})

// 表单数据
const form = ref({
  consignee: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: 0,
  userId: userStore.id
})

// regionOptions 已从 @/utils/regionOptions 导入

// 地区选择确认
const onRegionConfirm = ({ selectedOptions }) => {
  form.value.province = selectedOptions[0]?.text || ''
  form.value.city = selectedOptions[1]?.text || ''
  form.value.district = selectedOptions[2]?.text || ''
  showRegionPicker.value = false
}

// 返回上一页
const goBack = () => {
  redirectBack()
}

// 提交表单
const onSubmit = async () => {
  // 表单验证
  if (!form.value.consignee.trim()) {
    ElMessage.warning('请输入收货人姓名')
    return
  }
  if (!form.value.phone.trim()) {
    ElMessage.warning('请输入手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  if (!form.value.province) {
    ElMessage.warning('请选择所在地区')
    return
  }
  if (!form.value.detailAddress.trim()) {
    ElMessage.warning('请输入详细地址')
    return
  }

  try {
    const res = await addAddress(form.value)
    if (res.code === 0) {
      ElMessage.success('新增地址成功')
      redirectBack()
    } else {
      ElMessage.error(res.msg || '新增地址失败')
    }
  } catch (error) {
    ElMessage.error('网络异常，新增地址失败')
    console.error('新增地址失败：', error)
  }
}
</script>

<style scoped>
.address-add-page {
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
  margin-bottom: 20px;
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

/* 文本域特殊样式 */
.textarea-field {
  padding: 12px 16px;
}

:deep(.textarea-field .van-field__control) {
  line-height: 1.6;
}

/* 地区选择器 */
.region-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.region-picker:active {
  background: #f0f2f5;
}

.region-picker .placeholder {
  color: #bbb;
  font-size: 15px;
}

.region-picker .selected {
  color: #333;
  font-size: 15px;
}

.picker-arrow {
  color: #ccc;
  font-size: 14px;
  transition: transform 0.3s;
}

.region-picker:active .picker-arrow {
  transform: translateX(4px);
}

/* 开关项 */
.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-top: 24px;
}

.switch-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label-main {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.label-main .van-icon {
  color: #ff2442;
  font-size: 18px;
}

.label-desc {
  font-size: 12px;
  color: #999;
  padding-left: 26px;
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

.submit-tip {
  text-align: center;
  margin-top: 16px;
  font-size: 12px;
  color: #bbb;
}

/* ===== 地区选择弹窗 ===== */
.region-popup {
  border-radius: 20px 20px 0 0;
}

:deep(.region-popup .van-popup__close-icon) {
  color: #666;
}

/* ===== 深色模式 ===== */
@media (prefers-color-scheme: dark) {
  .address-add-page {
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
  
  .region-picker {
    background: #1a1a2e;
  }
  
  .region-picker .selected {
    color: #e0e0e0;
  }
  
  .switch-item {
    background: #1a1a2e;
  }
  
  .label-main {
    color: #e0e0e0;
  }
}
</style>