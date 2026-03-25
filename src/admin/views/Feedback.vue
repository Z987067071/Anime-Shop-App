<template>
  <div class="feedback-manage">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/admin/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>工单管理</el-breadcrumb-item>
      <el-breadcrumb-item>工单审核</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 筛选栏 -->
    <div class="operation-bar" style="margin-top: 20px">
      <el-input
        v-model="searchForm.keyword"
        placeholder="工单内容搜索"
        style="width: 300px; margin-right: 10px"
        @keyup.enter="getFeedbackList"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-input
        v-model="searchForm.userId"
        placeholder="用户ID搜索"
        style="width: 200px; margin-right: 10px"
        @keyup.enter="getFeedbackList"
      >
        <template #prefix><el-icon><User /></el-icon></template>
      </el-input>

      <!-- 状态筛选 -->
      <el-select
        v-model="searchForm.status"
        placeholder="全部状态"
        style="width: 150px; margin-right: 10px"
        @change="getFeedbackList"
      >
        <el-option label="全部状态" value="" />
        <el-option label="待审核" value="0" />
        <el-option label="审核中" value="1" />
        <el-option label="已解决" value="2" />
        <el-option label="已驳回" value="3" />
        <el-option label="已关闭" value="4" />
      </el-select>

      <!-- 时间筛选 -->
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 300px; margin-right: 10px"
        @change="getFeedbackList"
      />

      <el-button type="primary" @click="getFeedbackList">查询</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      :data="feedbackList"
      border
      stripe
      style="width: 100%; margin-top: 20px"
      v-loading="loading"
      :default-sort="{ prop: 'createTime', order: 'descending' }"
      @row-click="handleRowClick"
    >
      <!-- 工单核心字段列 -->
      <el-table-column prop="id" fixed="left" label="工单ID" min-width="180" />
      
      <!-- 用户信息列 -->
      <el-table-column label="用户信息" min-width="280">
        <template #default="scope">
          <div class="user-info">
            <div class="user-name">
              <el-icon><User /></el-icon>
              <span>{{ scope.row.creator || '匿名用户' }}</span>
            </div>
            <div class="user-id">ID: {{ scope.row.userId || '-' }}</div>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column label="工单内容" min-width="300">
        <template #default="scope">
          <el-tooltip :content="scope.row.feedbackContent" placement="top">
            <span>{{ scope.row.feedbackContent?.length > 50 ? `${scope.row.feedbackContent.slice(0, 50)}...` : scope.row.feedbackContent }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="工单状态" min-width="100">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="170" />
      <el-table-column prop="updateTime" label="更新时间" min-width="170">
        <template #default="scope">
          {{ scope.row.updateTime || '未更新' }}
        </template>
      </el-table-column>
      <!-- 操作列 -->
      <el-table-column fixed="right" label="操作" min-width="200">
        <template #default="scope">
          <el-button
            type="warning"
            size="small"
            @click.stop="() => openAuditDialog(scope.row)"
            :disabled="!scope.row.id || [2,3,4].includes(Number(scope.row.status))"
            style="margin-right: 8px"
          >
            审核工单
          </el-button>
          <el-button
            type="primary"
            size="small"
            @click.stop="() => openDetailDialog(scope.row)"
            :disabled="!scope.row.id"
          >
            工单详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页控件 -->
    <div class="pagination" style="margin-top: 20px; text-align: right">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getFeedbackList"
        @current-change="getFeedbackList"
      />
    </div>

    <!-- 工单审核弹窗 -->
    <el-dialog
      v-model="auditVisible"
      title="工单审核"
      width="500px"
      destroy-on-close
    >
      <div v-if="currentAuditFeedback">
        <el-form :model="auditForm" label-width="80px">
          <!-- 显示用户信息 -->
          <el-form-item label="用户信息">
            <div class="audit-user-info">
              <span class="user-name">{{ currentAuditFeedback.creator || '匿名用户' }}</span>
              <span class="user-id">(ID: {{ currentAuditFeedback.userId || '-' }})</span>
            </div>
          </el-form-item>
          
          <el-form-item label="工单ID">
            <span>{{ currentAuditFeedback.id }}</span>
          </el-form-item>
          <el-form-item label="工单内容">
            <div class="audit-content">{{ currentAuditFeedback.feedbackContent }}</div>
          </el-form-item>
          <el-form-item label="审核状态" required>
            <el-select v-model="auditForm.status" placeholder="请选择审核状态">
              <el-option label="已解决" value="2" />
              <el-option label="已驳回" value="3" />
              <el-option label="已关闭" value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="审核备注" :required="auditForm.status === '3'">
            <el-input
              v-model="auditForm.replyContent"
              type="textarea"
              placeholder="驳回时请填写原因，其他状态可选填"
              :rows="4"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="auditVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit">确认审核</el-button>
      </template>
    </el-dialog>

    <!-- 工单详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      :title="`工单详情 - ID：${currentDetailFeedback?.id || ''}`"
      width="800px"
      top="20px"
      destroy-on-close
    >
      <div v-if="currentDetailFeedback" class="feedback-detail">
        <!-- 基础信息 -->
        <div class="detail-base">
          <el-descriptions title="工单基础信息" border :column="2">
            <el-descriptions-item label="用户昵称">
              <span style="font-weight: 600; color: #409eff;">{{ currentDetailFeedback.creator || '匿名用户' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="用户ID">
              <span style="font-family: monospace; background: #f5f7fa; padding: 2px 6px; border-radius: 4px;">{{ currentDetailFeedback.userId || '-' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="工单状态">
              <el-tag :type="getStatusTagType(currentDetailFeedback.status)">{{ currentDetailFeedback.statusDesc || getStatusText(currentDetailFeedback.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentDetailFeedback.createTime }}</el-descriptions-item>
            <el-descriptions-item label="审核时间">{{ currentDetailFeedback.auditTime || '未审核' }}</el-descriptions-item>
            <el-descriptions-item label="审核人">{{ currentDetailFeedback.auditor || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 工单内容 -->
        <div class="detail-content" style="margin: 20px 0;">
          <h4 style="margin-bottom: 10px;">工单内容</h4>
          <div class="content-text" style="padding: 12px; background: #f5f7fa; border-radius: 4px; margin-bottom: 15px; line-height: 1.6;">
            {{ currentDetailFeedback.feedbackContent }}
          </div>
          <!-- 图片 -->
          <div v-if="currentDetailFeedback.imageUrls && currentDetailFeedback.imageUrls.length > 0" class="content-images">
            <h4 style="margin-bottom: 10px;">上传图片（{{ currentDetailFeedback.imageUrls.length }}张）</h4>
            <el-image
              v-for="(img, idx) in currentDetailFeedback.imageUrls"
              :key="idx"
              :src="img"
              :preview-src-list="currentDetailFeedback.imageUrls"
              style="width: 100px; height: 100px; object-fit: cover; margin-right: 10px; margin-bottom: 10px; cursor: zoom-in; border-radius: 4px;"
            />
          </div>
        </div>

        <!-- 聊天记录 -->
        <div class="chat-area" style="margin: 20px 0; max-height: 400px; overflow-y: auto; border: 1px solid #ebeef5; border-radius: 4px; padding: 15px; background: #fafafa;">
          <h4 style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #ebeef5;">对话记录</h4>
          
          <!-- 原始工单 -->
          <div class="chat-item user-chat" style="margin-bottom: 20px;">
            <div class="chat-avatar">
              <el-avatar :icon="User" style="background: #409eff;" />
            </div>
            <div class="chat-content">
              <div class="chat-name">{{ currentDetailFeedback.creator || '匿名用户' }}</div>
              <div class="chat-time">{{ currentDetailFeedback.createTime }}</div>
              <div class="chat-text">{{ currentDetailFeedback.feedbackContent }}</div>
              <div v-if="currentDetailFeedback.imageUrls && currentDetailFeedback.imageUrls.length > 0" class="chat-img">
                <el-image
                  v-for="(img, idx) in currentDetailFeedback.imageUrls"
                  :key="idx"
                  :src="img"
                  :preview-src-list="currentDetailFeedback.imageUrls"
                  style="width: 80px; height: 80px; object-fit: cover; margin-right: 8px; margin-top: 8px; cursor: zoom-in; border-radius: 4px;"
                />
              </div>
            </div>
          </div>

          <!-- 历史回复 -->
          <template v-if="chatRecords.length > 0">
            <div
              v-for="(record, idx) in chatRecords"
              :key="idx"
              :class="record.isAdmin === 1 ? 'chat-item admin-chat' : 'chat-item user-chat'"
              style="margin-bottom: 20px;"
            >
              <div class="chat-avatar">
                <el-avatar :icon="record.isAdmin === 1 ? UserFilled : User" :style="record.isAdmin === 1 ? 'background: #67c23a;' : 'background: #409eff;'" />
              </div>
              <div class="chat-content">
                <div class="chat-name">
                  {{ record.isAdmin === 1 ? `管理员-${record.replyer || '未知'}` : (currentDetailFeedback.creator || '用户') }}
                </div>
                <div class="chat-time">{{ record.createTime || '-' }}</div>
                <div class="chat-text">{{ record.content || '' }}</div>
              </div>
            </div>
          </template>
          
          <!-- 无回复记录提示 -->
          <div v-else style="text-align: center; color: #909399; padding: 20px; font-size: 14px;">
            暂无回复记录
          </div>
        </div>

        <!-- 回复输入 -->
        <div class="reply-area" style="margin-top: 20px;">
          <el-form :model="replyForm">
            <el-form-item label="回复工单" label-width="80px">
              <el-input
                v-model="replyForm.content"
                type="textarea"
                placeholder="请输入回复内容，回复后工单状态将改为审核中"
                :rows="3"
                style="width: 100%;"
              />
            </el-form-item>
            <el-form-item style="text-align: right; margin-bottom: 0;">
              <el-button @click="detailVisible = false">关闭</el-button>
              <el-button
                type="primary"
                @click="submitReply"
                :disabled="!replyForm.content.trim() || [2,3,4].includes(Number(currentDetailFeedback.status))"
              >
                发送回复
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <!-- 空数据 -->
      <div v-else class="empty-tip" style="text-align: center; padding: 50px 0;">
        暂无工单详情数据
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, User, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import {
  getAdminFeedbackPage,
  getFeedbackDetail,
  getFeedbackReplyList,
  addAdminFeedbackReply,
  auditFeedback
} from '@/api/feedback'

// 全局状态
const userStore = useUserStore()
const loading = ref(false)

// 搜索条件
const searchForm = reactive({
  keyword: '',
  userId: '',
  status: ''
})
const dateRange = ref([])

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 列表数据
const feedbackList = ref([])

// 审核弹窗
const auditVisible = ref(false)
const currentAuditFeedback = ref(null)
const auditForm = reactive({
  status: '',
  replyContent: ''
})

// 详情弹窗
const detailVisible = ref(false)
const currentDetailFeedback = ref(null)
const chatRecords = ref([])
const replyForm = reactive({
  content: ''
})

// 初始化
onMounted(() => {
  getFeedbackList()
})

// 获取工单列表
const getFeedbackList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      status: searchForm.status !== '' ? Number(searchForm.status) : undefined,
      userId: searchForm.userId.trim() || undefined,
      keyword: searchForm.keyword.trim() || undefined,
      startTime: dateRange.value?.[0] ? formatDate(dateRange.value[0]) + ' 00:00:00' : undefined,
      endTime: dateRange.value?.[1] ? formatDate(dateRange.value[1]) + ' 23:59:59' : undefined
    }

    // 清理 undefined 参数
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) delete params[key]
    })

    const res = await getAdminFeedbackPage(params)

    if (res.code !== 0) {
      ElMessage.error(res.msg || '获取工单列表失败')
      return
    }

    // 数据格式化 - 保留用户信息
    total.value = Number(res.data.total) || 0
    feedbackList.value = (res.data.records || []).map(item => ({
      ...item,
      id: String(item.id || ''),
      userId: String(item.userId || ''),      // 用户ID
      creator: item.creator || '',            // 用户昵称
      status: Number(item.status) || 0,
      feedbackContent: item.feedbackContent || '',
      createTime: item.createTime || '',
      updateTime: item.updateTime || ''
    }))
    
    // 更新分页信息
    currentPage.value = Number(res.data.current) || currentPage.value
    pageSize.value = Number(res.data.size) || pageSize.value
  } catch (error) {
    console.error('获取工单列表失败:', error)
    ElMessage.error('网络错误，获取工单列表失败')
  } finally {
    loading.value = false
  }
}

// 重置搜索
const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.userId = ''
  searchForm.status = ''
  dateRange.value = []
  currentPage.value = 1
  getFeedbackList()
}

// 状态文本映射
const getStatusText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '审核中',
    2: '已解决',
    3: '已驳回',
    4: '已关闭'
  }
  return statusMap[Number(status)] || '未知状态'
}

// 状态标签样式
const getStatusTagType = (status) => {
  const typeMap = {
    0: 'info',
    1: 'primary',
    2: 'success',
    3: 'danger',
    4: 'warning'
  }
  return typeMap[Number(status)] || 'default'
}

// 日期格式化
const formatDate = (date) => {
  if (!date || !(date instanceof Date)) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 行点击
const handleRowClick = (row) => {
  if (!row?.id) {
    ElMessage.warning('工单数据异常')
  }
}

// 打开审核弹窗 - 传入完整用户信息
const openAuditDialog = (row) => {
  if (!row?.id) {
    ElMessage.warning('工单数据异常，无法审核')
    return
  }
  // 保存完整的用户信息
  currentAuditFeedback.value = {
    id: row.id,
    userId: row.userId,
    creator: row.creator,
    feedbackContent: row.feedbackContent,
    status: row.status,
    createTime: row.createTime
  }
  auditForm.status = ''
  auditForm.replyContent = ''
  auditVisible.value = true
}

// 提交审核
const submitAudit = async () => {
  if (!auditForm.status) {
    ElMessage.warning('请选择审核状态')
    return
  }

  if (auditForm.status === '3' && !auditForm.replyContent.trim()) {
    ElMessage.warning('驳回工单请填写原因')
    return
  }

  if (!currentAuditFeedback.value?.id) {
    ElMessage.warning('工单数据异常')
    return
  }

  loading.value = true
  try {
    const data = {
      id: Number(currentAuditFeedback.value.id),
      status: Number(auditForm.status),
      replyContent: auditForm.replyContent.trim(),
      auditor: userStore.nickname || '管理员',
      auditorId: Number(userStore.id) || 0
    }

    const res = await auditFeedback(data)

    if (res.code !== 0) {
      ElMessage.error(res.msg || '工单审核失败')
      return
    }

    ElMessage.success('工单审核成功')
    auditVisible.value = false
    getFeedbackList()
  } catch (error) {
    console.error('审核工单失败:', error)
    ElMessage.error('网络错误，工单审核失败')
  } finally {
    loading.value = false
  }
}

// 打开详情弹窗 - 传入完整用户信息并合并详情数据
const openDetailDialog = async (row) => {
  if (!row?.id) {
    ElMessage.warning('工单数据异常，无法查看详情')
    console.error('无效row数据:', row)
    return
  }

  // 先保存列表中的用户信息，防止详情接口返回不完整
  const listUserInfo = {
    id: row.id,
    userId: row.userId,
    creator: row.creator,
    feedbackContent: row.feedbackContent,
    status: row.status,
    createTime: row.createTime,
    updateTime: row.updateTime
  }

  const feedbackId = row.id
  detailVisible.value = false
  loading.value = true
  
  try {
    // 获取详情
    const detailRes = await getFeedbackDetail(feedbackId)

    if (detailRes.code !== 0 || !detailRes.data) {
      ElMessage.error(detailRes.msg || '获取工单详情失败')
      return
    }

    // 合并数据：列表用户信息 + 详情数据（详情优先，但保留列表的用户信息作为兜底）
    const detailData = detailRes.data
    currentDetailFeedback.value = {
      // 列表中的用户信息作为兜底
      userId: detailData.userId || listUserInfo.userId,
      creator: detailData.creator || listUserInfo.creator,
      // 详情接口的数据
      id: String(detailData.id || feedbackId),
      feedbackContent: detailData.feedbackContent || listUserInfo.feedbackContent,
      status: Number(detailData.status) || listUserInfo.status,
      statusDesc: detailData.statusDesc || '',
      replyContent: detailData.replyContent || '',
      createTime: detailData.createTime || listUserInfo.createTime,
      auditTime: detailData.auditTime || null,
      auditor: detailData.auditor || '',
      imageUrls: detailData.imageUrls || []
    }

    // 获取回复列表
    const replyRes = await getFeedbackReplyList(feedbackId)

    // 设置聊天记录
    chatRecords.value = (replyRes.data || []).map(item => ({
      id: String(item.id || ''),
      isAdmin: Number(item.isAdmin) || 0,
      replyer: item.replyer || '管理员',
      content: item.content || '',
      createTime: item.createTime || ''
    }))

    detailVisible.value = true

    // 滚动到底部
    nextTick(() => {
      const chatArea = document.querySelector('.chat-area')
      if (chatArea) chatArea.scrollTop = chatArea.scrollHeight
    })
  } catch (error) {
    console.error('获取工单详情失败:', error)
    ElMessage.error('网络错误，获取工单详情失败')
    currentDetailFeedback.value = null
    chatRecords.value = []
  } finally {
    loading.value = false
  }
}

// 提交回复
const submitReply = async () => {
  if (!replyForm.content.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  if (!currentDetailFeedback.value?.id) {
    ElMessage.warning('工单数据异常')
    return
  }

  // 保存当前工单信息，用于刷新
  const currentFeedback = { ...currentDetailFeedback.value }
  
  loading.value = true
  try {
    const data = {
      feedbackId: currentDetailFeedback.value.id,
      userId: userStore.id || 0,
      content: replyForm.content.trim(),
      isAdmin: 1,
      replyer: userStore.nickname || '管理员'
    }

    const res = await addAdminFeedbackReply(data)

    if (res.code !== 0) {
      ElMessage.error(res.msg || '回复工单失败')
      return
    }

    ElMessage.success('回复工单成功')
    replyForm.content = ''
    
    // 刷新详情和列表
    await openDetailDialog(currentFeedback)
    getFeedbackList()
  } catch (error) {
    console.error('回复工单失败:', error)
    ElMessage.error('网络错误，回复工单失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.feedback-manage {
  padding: 20px;
  background: #fff;
  min-height: 100%;
}

.operation-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

/* 列表中的用户信息样式 */
.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-info .user-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #303133;
}

.user-info .user-name .el-icon {
  color: #409eff;
}

.user-info .user-id {
  font-size: 12px;
  color: #909399;
  font-family: monospace;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.feedback-detail {
  width: 100%;
}

/* 审核弹窗用户信息样式 */
.audit-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.audit-user-info .user-name {
  font-weight: 600;
  color: #409eff;
}

.audit-user-info .user-id {
  color: #909399;
  font-size: 13px;
  font-family: monospace;
}

.audit-content {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  line-height: 1.6;
  color: #606266;
  max-height: 100px;
  overflow-y: auto;
}

/* 聊天样式 */
.chat-item {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.chat-avatar {
  margin-right: 15px;
  margin-top: 5px;
  flex-shrink: 0;
}

.chat-content {
  flex: 1;
  min-width: 0;
}

.chat-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #303133;
}

.chat-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.chat-text {
  padding: 10px 14px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #ebeef5;
  max-width: 85%;
  line-height: 1.6;
  word-break: break-word;
}

.admin-chat .chat-text {
  background: #e6f7ff;
  border-color: #91d5ff;
}

.user-chat .chat-text {
  background: #f5f7fa;
  border-color: #ebeef5;
}

.chat-img {
  margin-top: 10px;
}

.empty-tip {
  color: #909399;
  font-size: 14px;
}

/* 图片预览样式优化 */
:deep(.el-image-viewer__wrapper) {
  z-index: 3000;
}
</style>