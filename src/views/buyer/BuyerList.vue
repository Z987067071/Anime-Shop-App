<template>
  <div class="buyer-page">
    <!-- 玻璃拟态头部 -->
    <header class="glass-header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <van-icon name="arrow-left" />
        </div>
        <h1 class="page-title">购票人信息</h1>
        <div class="header-action" @click="goAddBuyer">
          <van-icon name="plus" />
          <span>新增</span>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 空状态 -->
      <div class="empty-state" v-if="buyerList.length === 0">
        <div class="empty-illustration">
          <div class="user-icon">👤</div>
          <div class="ripple"></div>
        </div>
        <h3>还没有购票人信息</h3>
        <p>添加购票人信息，方便快速购票~</p>
        <button class="add-btn" @click="goAddBuyer">
          <van-icon name="plus" />
          新建购票人信息
        </button>
      </div>

      <!-- 购票人列表 -->
      <div class="buyer-list" v-else>
        <div class="list-header">
          <span class="list-count">共 {{ buyerList.length }} 个购票人</span>
        </div>

        <div class="buyer-cards">
          <div 
            v-for="item in buyerList" 
            :key="item.id"
            class="buyer-card"
            :class="{ 'is-default': item.isDefault === 1 }"
            @click="selectBuyer(item)"
          >
            <!-- 默认标签 -->
            <div class="default-badge" v-if="item.isDefault === 1">
              <van-icon name="star" />
              <span>默认</span>
            </div>

            <div class="card-content">
              <div class="user-info">
                <div class="name-idcard">
                  <span class="name">{{ item.name }}</span>
                  <span class="idcard">{{ maskIdCard(item.idCard) }}</span>
                </div>
                <div class="phone-info" v-if="item.phone">
                  <van-icon name="phone" class="phone-icon" />
                  {{ maskPhone(item.phone) }}
                </div>
                <div class="audit-status" :class="getAuditClass(item.auditStatus)">
                  <van-icon :name="getAuditIcon(item.auditStatus)" />
                  {{ getAuditText(item.auditStatus) }} <span v-if="item.auditStatus === 2"> 理由:{{ item.auditRemark}}</span>
                </div>
              </div>

              <div class="card-actions">
                <div 
                  class="action-btn edit"
                  @click.stop="goEditBuyer(item.id)"
                >
                  <van-icon name="edit" />
                  <span>编辑</span>
                </div>
                <div 
                  class="action-btn delete"
                  @click.stop="handleDeleteBuyer(item.id)"
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
          <p>最多可保存 10 个购票人信息</p>
        </div>
      </div>
    </div>

    <!-- 浮动添加按钮（列表不为空时显示） -->
    <div class="fab-add" v-if="buyerList.length > 0" @click="goAddBuyer">
      <van-icon name="plus" />
    </div>

    <!-- 删除确认弹窗 -->
    <van-dialog
      v-model:show="showDeleteDialog"
      title="确认删除"
      show-cancel-button
      @confirm="confirmDelete"
    >
      <p class="delete-tip">确定要删除该购票人信息吗？</p>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
// 导入正确的购票人API
import { getBuyerList, deleteBuyer } from '@/api/mobile/buyer'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const buyerList = ref([])
const showDeleteDialog = ref(false)
const deleteId = ref(null)
const selectedId = ref(null)
const isSelectable = ref(false)

// 身份证号脱敏
const maskIdCard = (idCard) => {
  if (!idCard) return ''
  // 18位身份证：前6位 + **** + 后4位
  if (idCard.length === 18) {
    return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
  }
  // 15位身份证：前6位 + **** + 后3位
  return idCard.replace(/(\d{6})\d{6}(\d{3})/, '$1******$2')
}

// 手机号脱敏
const maskPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 获取审核状态文本
const getAuditText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '审核通过',
    2: '审核驳回'
  }
  return statusMap[status] || '未知状态'
}

// 获取审核状态图标
const getAuditIcon = (status) => {
  const iconMap = {
    0: 'clock-o',     // 待审核
    1: 'success',     // 审核通过
    2: 'warning-o'    // 审核驳回
  }
  return iconMap[status] || 'info-o'
}

// 获取审核状态样式类
const getAuditClass = (status) => {
  const classMap = {
    0: 'pending',     // 待审核
    1: 'passed',      // 审核通过
    2: 'rejected'     // 审核驳回
  }
  return classMap[status] || 'default'
}

// 加载购票人列表
const loadBuyerList = async () => {
  try {
    // 调用正确的接口（无需传参，接口内部已处理用户信息）
    const res = await getBuyerList({userId: userStore.id})
    if (res.code === 0) {
      buyerList.value = res.data || []
      // 如果有默认购票人，选中它
      const defaultBuyer = buyerList.value.find(item => item.isDefault === 1)
      if (defaultBuyer) {
        selectedId.value = defaultBuyer.id
      }
    } else {
      ElMessage.error(res.msg || '获取购票人列表失败')
    }
  } catch (error) {
    // 捕获接口内部的验证错误
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('网络异常，获取购票人信息失败')
    }
    console.error('获取购票人列表失败：', error)
  }
}

// 返回上一页
const goBack = () => {
  router.push({ name: 'Mine' })
}

// 选择购票人（如果是从下单页进入）
const selectBuyer = (item) => {
  if (isSelectable.value) {
    selectedId.value = item.id
    // 可以在这里触发回调或存储选择
    // 如果是从订单确认页跳转过来，可通过路由返回选择结果
    if (route.query.from === 'order') {
      // 存储选中的购票人信息到本地或pinia
      userStore.setSelectedBuyer(item)
      router.go(-1)
    }
  }
}

// 跳转新增
const goAddBuyer = () => {
  router.push({ name: 'BuyerAdd' })
}

// 跳转编辑
const goEditBuyer = (id) => {
  router.push({ name: 'BuyerEdit', params: { id } })
}

// 删除购票人
const handleDeleteBuyer = (id) => {
  deleteId.value = id
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!deleteId.value) return
  
  try {
    // 调用正确的删除接口（仅传ID）
    const res = await deleteBuyer({id: deleteId.value,userId: userStore.id})
    if (res.code === 0) {
      ElMessage.success('删除成功')
      loadBuyerList()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    // 捕获接口内部的验证错误
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('删除失败')
    }
    console.error('删除购票人失败：', error)
  }
  
  deleteId.value = null
  showDeleteDialog.value = false
}

onMounted(() => {
  loadBuyerList()
  // 判断是否从下单页进入（可选择购票人）
  isSelectable.value = route.query.selectable === 'true'
})
</script>

<style scoped>
.buyer-page {
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

.user-icon {
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

/* ===== 购票人列表 ===== */
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

.buyer-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ===== 购票人卡片 ===== */
.buyer-card {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  cursor: pointer;
  overflow: hidden;
}

.buyer-card:active {
  transform: scale(0.98);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.buyer-card.is-default {
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

.name-idcard {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.idcard {
  font-size: 14px;
  color: #666;
  font-family: monospace;
}

.phone-info {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}

.phone-icon {
  font-size: 12px;
  color: #999;
}

/* 审核状态样式 */
.audit-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 12px;
  width: fit-content;
}

.audit-status.pending {
  background: #fff8e1;
  color: #ff9800;
}

.audit-status.passed {
  background: #e8f5e9;
  color: #4caf50;
}

.audit-status.rejected {
  background: #ffebee;
  color: #f44336;
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
  .buyer-page {
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
  
  .buyer-card {
    background: #242442;
  }
  
  .buyer-card.is-default {
    background: linear-gradient(135deg, #2a1f3d 0%, #242442 100%);
  }
  
  .name {
    color: #e0e0e0;
  }
  
  .idcard, .phone-info {
    color: #ccc;
  }
  
  .action-btn.edit {
    background: #2a2a4a;
    color: #aaa;
  }
}
</style>