<template>
  <div class="address-page">
    <!-- 玻璃拟态头部 -->
    <header class="glass-header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <van-icon name="arrow-left" />
        </div>
        <h1 class="page-title">收货地址</h1>
        <div class="header-action" @click="goAddAddress">
          <van-icon name="plus" />
          <span>新增</span>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 空状态 -->
      <div class="empty-state" v-if="addressList.length === 0">
        <div class="empty-illustration">
          <div class="location-icon">📍</div>
          <div class="ripple"></div>
        </div>
        <h3>还没有收货地址</h3>
        <p>添加一个地址，让宝贝找到你~</p>
        <button class="add-btn" @click="goAddAddress">
          <van-icon name="plus" />
          新建收货地址
        </button>
      </div>

      <!-- 地址列表 -->
      <div class="address-list" v-else>
        <div class="list-header">
          <span class="list-count">共 {{ addressList.length }} 个地址</span>
        </div>

        <div class="address-cards">
          <div 
            v-for="item in addressList" 
            :key="item.id"
            class="address-card"
            :class="{ 'is-default': item.isDefault === 1 }"
            @click="selectAddress(item)"
          >
            <!-- 默认标签 -->
            <div class="default-badge" v-if="item.isDefault === 1">
              <van-icon name="star" />
              <span>默认</span>
            </div>

            <div class="card-content">
              <div class="user-info">
                <div class="name-phone">
                  <span class="name">{{ item.consignee }}</span>
                  <span class="phone">{{ maskPhone(item.phone) }}</span>
                </div>
                <div class="address-detail">{{ item.fullAddress }}</div>
              </div>

              <div class="card-actions">
                <div 
                  class="action-btn edit"
                  @click.stop="goEditAddress(item.id)"
                >
                  <van-icon name="edit" />
                  <span>编辑</span>
                </div>
                <div 
                  class="action-btn delete"
                  @click.stop="handleDeleteAddress(item.id)"
                >
                  <van-icon name="delete-o" />
                  <span>删除</span>
                </div>
              </div>
            </div>

            <!-- 选中指示器 -->
            <div class="select-indicator" v-if="isSelectable">
              <van-icon name="success" v-if="selectedId === item.id" />
            </div>
          </div>
        </div>

        <!-- 底部提示 -->
        <div class="list-footer">
          <p>最多可保存 20 个收货地址</p>
        </div>
      </div>
    </div>

    <!-- 浮动添加按钮（列表不为空时显示） -->
    <div class="fab-add" v-if="addressList.length > 0" @click="goAddAddress">
      <van-icon name="plus" />
    </div>

    <!-- 删除确认弹窗 -->
    <van-dialog
      v-model:show="showDeleteDialog"
      title="确认删除"
      show-cancel-button
      @confirm="confirmDelete"
    >
      <p class="delete-tip">确定要删除该收货地址吗？</p>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getAddressList, deleteAddress } from '@/api/mobile/mine'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const addressList = ref([])
const showDeleteDialog = ref(false)
const deleteId = ref(null)
const selectedId = ref(null)
const isSelectable = ref(false)

// 手机号脱敏
const maskPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 加载地址列表
const loadAddressList = async () => {
  try {
    const res = await getAddressList({ userId: userStore.id })
    if (res.code === 0) {
      addressList.value = res.data || []
      // 如果有默认地址，选中它
      const defaultAddr = addressList.value.find(item => item.isDefault === 1)
      if (defaultAddr) {
        selectedId.value = defaultAddr.id
      }
    } else {
      ElMessage.error(res.msg || '获取地址列表失败')
    }
  } catch (error) {
    ElMessage.error('网络异常，获取地址失败')
    console.error('获取地址列表失败：', error)
  }
}

// 返回上一页
const goBack = () => {
  router.push({ name: 'Mine' })
}

// 选择地址（如果是从下单页进入）
const selectAddress = (item) => {
  if (isSelectable.value) {
    selectedId.value = item.id
    // 可以在这里触发回调或存储选择
  }
}

// 跳转新增
const goAddAddress = () => {
  router.push({ name: 'AddressAdd' })
}

// 跳转编辑
const goEditAddress = (id) => {
  router.push({ name: 'AddressEdit', params: { id } })
}

// 删除地址
const handleDeleteAddress = (id) => {
  deleteId.value = id
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!deleteId.value) return
  
  try {
    const res = await deleteAddress(deleteId.value, { userId: userStore.id })
    if (res.code === 0) {
      ElMessage.success('删除成功')
      loadAddressList()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    ElMessage.error('删除失败')
    console.error('删除地址失败：', error)
  }
  
  deleteId.value = null
}

onMounted(() => {
  loadAddressList()
  // 判断是否从下单页进入（可选择地址）
  isSelectable.value = route.query.selectable === 'true'
})
</script>

<style scoped>
.address-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 20px;
}

/* ===== 玻璃拟态头部 ===== */
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

.header-action {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.3s;
}

.header-action:active {
  transform: scale(0.95);
}

.header-action .van-icon {
  font-size: 14px;
}

/* ===== 主内容区 ===== */
.main-content {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

/* ===== 空状态 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-illustration {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 24px;
}

.location-icon {
  font-size: 60px;
  position: relative;
  z-index: 2;
  animation: bounce 2s infinite;
}

.ripple {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 20px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  animation: ripple 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes ripple {
  0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.3; }
  50% { transform: translateX(-50%) scale(0.8); opacity: 0.1; }
}

.empty-state h3 {
  font-size: 18px;
  color: #333;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.empty-state p {
  font-size: 14px;
  color: #999;
  margin: 0 0 24px 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(255, 36, 66, 0.3);
}

.add-btn:active {
  transform: scale(0.95);
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.2);
}

/* ===== 地址列表 ===== */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

.list-count {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.list-tip {
  font-size: 12px;
  color: #999;
}

.address-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ===== 地址卡片 ===== */
.address-card {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  cursor: pointer;
  overflow: hidden;
}

.address-card:active {
  transform: scale(0.98);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.address-card.is-default {
  background: linear-gradient(135deg, #fff9f9 0%, #ffffff 100%);
  border: 1px solid rgba(255, 36, 66, 0.1);
}

/* 默认标签 */
.default-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 0 16px 0 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.default-badge .van-icon {
  font-size: 10px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.name-phone {
  display: flex;
  align-items: center;
  gap: 12px;
}

.name {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.phone {
  font-size: 14px;
  color: #666;
  font-family: monospace;
}

.address-detail {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  padding-right: 40px;
}

/* 卡片操作 */
.card-actions {
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn.edit {
  background: #f5f7fa;
  color: #666;
}

.action-btn.edit:active {
  background: #e8eaed;
}

.action-btn.delete {
  background: #ffebee;
  color: #ff2442;
}

.action-btn.delete:active {
  background: #ffcdd2;
}

.action-btn .van-icon {
  font-size: 14px;
}

/* 选中指示器 */
.select-indicator {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: #ff2442;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

/* ===== 列表底部 ===== */
.list-footer {
  text-align: center;
  padding: 24px;
  color: #bbb;
  font-size: 12px;
}

/* ===== 浮动添加按钮 ===== */
.fab-add {
  position: fixed;
  right: 20px;
  bottom: 30px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 8px 24px rgba(255, 36, 66, 0.4);
  cursor: pointer;
  transition: all 0.3s;
  z-index: 99;
}

.fab-add:active {
  transform: scale(0.95);
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.3);
}

/* ===== 删除确认弹窗 ===== */
.delete-tip {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* ===== 深色模式 ===== */
@media (prefers-color-scheme: dark) {
  .address-page {
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
  
  .empty-state h3 {
    color: #e0e0e0;
  }
  
  .address-card {
    background: #242442;
  }
  
  .address-card.is-default {
    background: linear-gradient(135deg, #2a1f3d 0%, #242442 100%);
  }
  
  .name {
    color: #e0e0e0;
  }
  
  .address-detail {
    color: #ccc;
  }
  
  .action-btn.edit {
    background: #2a2a4a;
    color: #aaa;
  }
}
</style>