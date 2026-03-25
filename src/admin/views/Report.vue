<template>
  <div class="report-manage">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/admin/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>内容管理</el-breadcrumb-item>
      <el-breadcrumb-item>举报管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-input
        v-model="searchReportId"
        placeholder="搜索ID"
        style="width: 200px; margin-right: 10px"
        type="number"
        @keyup.enter="getReportList"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select
        v-model="targetType"
        placeholder="筛选举报目标类型"
        style="width: 180px; margin-right: 10px"
        @change="getReportList"
      >
        <el-option label="全部类型" value="" />
        <el-option label="商品" value="1" />
        <el-option label="商品评论" value="2" />
        <el-option label="社区帖子" value="3" />
        <el-option label="社区帖子评论" value="4" />
      </el-select>
      <el-select
        v-model="handleStatus"
        placeholder="筛选处理状态"
        style="width: 180px; margin-right: 10px"
        @change="getReportList"
      >
        <el-option label="全部状态" value="" />
        <el-option label="待处理" value="0" />
        <el-option label="已受理" value="1" />
        <el-option label="已驳回" value="2" />
        <el-option label="已处理" value="3" />
      </el-select>
      <el-button type="primary" @click="refreshList">刷新列表</el-button>
    </div>

    <!-- 举报列表 -->
    <el-table
      :data="reportList"
      border
      stripe
      style="width: 100%; margin-top: 20px"
      v-loading="loading"
    >
      <el-table-column prop="id" label="举报ID" width="80" />
      <el-table-column label="举报目标类型" width="120">
        <template #default="scope">
          <el-tag type="info">{{ getTargetTypeName(scope.row.targetType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="targetId" label="目标ID" width="100" />
      <el-table-column prop="userId" label="举报用户ID" width="200" />
      
      <!-- 举报理由：其他只显示标签，点击弹窗查看完整内容 -->
      <el-table-column label="举报理由" min-width="100">
        <template #default="scope">
          <div style="display: flex; align-items: center; gap: 6px">
            <span>{{ getReportReasonName(scope.row.reportReason) }}</span>
            
            <!-- 只有理由=99才显示查看按钮 -->
            <el-button
              v-if="scope.row.reportReason === 99"
              type="text"
              size="small"
              style="color: #409eff; padding: 0"
              @click="showCustomReason(scope.row.customReason)"
            >
              查看内容
            </el-button>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="处理状态" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 0" type="warning">待处理</el-tag>
          <el-tag v-if="scope.row.status === 1" type="primary">已受理</el-tag>
          <el-tag v-if="scope.row.status === 2" type="danger">已驳回</el-tag>
          <el-tag v-if="scope.row.status === 3" type="success">已处理</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="handlerId" label="处理人ID" width="190">
        <template #default="scope">
          {{ scope.row.handlerId || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="handleTime" label="处理时间" width="180">
        <template #default="scope">
          {{ scope.row.handleTime ? formatTime(scope.row.handleTime) : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="举报时间" width="180">
        <template #default="scope">
          {{ scope.row.createTime ? formatTime(scope.row.createTime) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button 
            v-if="scope.row.status === 0" 
            type="primary" 
            size="small" 
            @click="openHandleDialog(scope.row, 1)"
          >
            受理
          </el-button>
          <el-button 
            v-if="scope.row.status === 0 || scope.row.status === 1" 
            type="danger" 
            size="small" 
            @click="openHandleDialog(scope.row, 2)"
          >
            驳回
          </el-button>
          <el-button 
            v-if="scope.row.status === 1" 
            type="success" 
            size="small" 
            @click="openHandleDialog(scope.row, 3)"
          >
            标记处理完成
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageNum"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      style="margin-top: 20px; text-align: right"
    >
    </el-pagination>

    <!-- 处理弹窗（简化版：无删除接口） -->
    <el-dialog
      v-model="handleDialogVisible"
      :title="getDialogTitle()"
      width="500px"
      @close="resetHandleForm"
    >
      <el-form
        ref="handleFormRef"
        :model="handleForm"
        :rules="handleRules"
        label-width="100px"
      >
        <el-form-item label="举报ID">
          <span class="form-static-text">{{ handleForm.id }}</span>
        </el-form-item>
        <el-form-item label="目标类型">
          <span class="form-static-text">{{ getTargetTypeName(handleForm.targetType) }}</span>
        </el-form-item>
        <el-form-item label="目标ID">
          <span class="form-static-text">{{ handleForm.targetId }}</span>
        </el-form-item>
        <el-form-item label="举报理由">
          <span class="form-static-text">
            {{ getReportReasonName(handleForm.reportReason) }}
            <span v-if="handleForm.reportReason === 99">
              （自定义：{{ handleForm.customReason || '-' }}）
            </span>
          </span>
        </el-form-item>
        <el-form-item label="处理状态">
          <span class="form-static-text">{{ getHandleStatusName(handleForm.handleStatus) }}</span>
        </el-form-item>
        
        <!-- 简化：处理方式改为文本说明，不关联删除接口 -->
        <el-form-item 
          label="处置建议" 
          prop="handleSuggestion"
          v-if="handleForm.handleStatus === 1 || handleForm.handleStatus === 3"
        >
          <el-select
            v-model="handleForm.handleSuggestion"
            placeholder="请选择处置建议（仅记录）"
            style="width: 100%"
          >
            <el-option label="建议删除违规内容" value="1" />
            <el-option label="建议警告发布者" value="2" />
            <el-option label="建议保留内容" value="3" />
            <el-option label="建议限制发布者权限" value="4" />
          </el-select>
          <div style="margin-top: 8px; color: #909399; font-size: 12px">
            注：此为处置建议，需手动处理相关内容
          </div>
        </el-form-item>

        <el-form-item 
          label="处理备注" 
          prop="handleNote"
          v-if="handleForm.handleStatus !== 0"
        >
          <el-input
            v-model="handleForm.handleNote"
            type="textarea"
            placeholder="请输入处理备注（必填）"
            :rows="4"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="handleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitHandle" :loading="submitLoading">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user';

import { 
  getReportPage,
  handleReport
} from '@/api/report'

// ========== 变量 ==========
const loading = ref(false)
const submitLoading = ref(false)
const searchReportId = ref('')
const targetType = ref('')
const handleStatus = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const userStore = useUserStore()

const reportList = ref([])

// 处理弹窗（简化：改为handleSuggestion，无删除逻辑）
const handleDialogVisible = ref(false)
const handleFormRef = ref(null)
const handleForm = reactive({
  id: '',
  targetType: '',
  targetId: '',
  reportReason: '',
  customReason: '',
  handleStatus: '',
  handleSuggestion: '', // 处置建议（仅记录，不执行）
  handleNote: ''
})

// 校验规则（简化）
const handleRules = reactive({
  handleSuggestion: [
    { required: true, message: '请选择处置建议', trigger: 'change' }
  ],
  handleNote: [
    { required: true, message: '请输入处理备注', trigger: 'blur' },
    { max: 500, message: '不能超过500字', trigger: 'blur' }
  ]
})

// ========== 枚举 ==========
const targetTypeMap = {1:'商品',2:'商品评论',3:'社区帖子',4:'社区帖子评论'}
const reportReasonMap = {
  1:'违反法律规定',2:'色情低俗',3:'赌博诈骗',4:'人身攻击',5:'侵犯隐私',
  6:'垃圾广告',7:'引战',8:'刷屏/抢楼',9:'青少年不良',10:'谣言造谣',99:'其他'
}
const handleStatusMap = {0:'待处理',1:'已受理',2:'已驳回',3:'已处理'}
// 处置建议枚举
const handleSuggestionMap = {
  1: '建议删除违规内容',
  2: '建议警告发布者',
  3: '建议保留内容',
  4: '建议限制发布者权限'
}

const getTargetTypeName = (type) => targetTypeMap[type] || '未知类型'
const getReportReasonName = (reason) => reportReasonMap[reason] || '未知理由'
const getHandleStatusName = (status) => handleStatusMap[status] || '未知状态'
const getDialogTitle = () => `${getHandleStatusName(handleForm.handleStatus)}举报`

// 时间格式化
const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`
}

// ========== 查看自定义举报理由（弹窗） ==========
const showCustomReason = (content) => {
  ElMessageBox.alert(content || '无内容', '自定义举报理由', {
    confirmButtonText: '确定',
    type: 'info',
    center: false
  })
}

// ========== 获取列表 ==========
const getReportList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      id: searchReportId.value ? Number(searchReportId.value) : undefined,
      targetType: targetType.value ? Number(targetType.value) : undefined,
      status: handleStatus.value ? Number(handleStatus.value) : undefined
    }
    const res = await getReportPage(params)
    if (res.code === 0) {
      reportList.value = res.data.records || []
      total.value = Number(res.data.total) || 0
    } else {
      reportList.value = []
      total.value = 0
      ElMessage.warning(res.msg || '暂无数据')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('获取失败')
  } finally {
    loading.value = false
  }
}

// 分页
const handleSizeChange = (val) => { pageSize.value = val; getReportList() }
const handleCurrentChange = (val) => { pageNum.value = val; getReportList() }

// 刷新
const refreshList = () => {
  pageNum.value = 1
  searchReportId.value = ''
  targetType.value = ''
  handleStatus.value = ''
  getReportList()
}

// 打开处理弹窗
const openHandleDialog = (row, status) => {
  Object.assign(handleForm, {
    id: row.id,
    targetType: row.targetType,
    targetId: row.targetId,
    reportReason: row.reportReason,
    customReason: row.customReason || '',
    handleStatus: status,
    handleSuggestion: '',
    handleNote: ''
  })
  handleDialogVisible.value = true
}

// 重置表单
const resetHandleForm = () => {
  if (handleFormRef.value) handleFormRef.value.resetFields()
  Object.assign(handleForm, {
    id:'',targetType:'',targetId:'',reportReason:'',customReason:'',
    handleStatus:'',handleSuggestion:'',handleNote:''
  })
}

// 提交处理
const submitHandle = async () => {
  if (!handleFormRef.value) return
  handleFormRef.value.validate(async valid => {
    if (!valid) return
    try {
      await ElMessageBox.confirm(
        `确定要${getHandleStatusName(handleForm.handleStatus)}该举报吗？
        ${handleForm.handleSuggestion ? `处置建议：${handleSuggestionMap[handleForm.handleSuggestion]}` : ''}`, 
        '操作确认',
        { type: 'warning' }
      )
      await doHandle()
    } catch (e) {}
  })
}

// 执行处理（无删除接口，仅提交状态+建议+备注）
const doHandle = async () => {
  submitLoading.value = true
  try {
    // 构造请求体（适配现有后端DTO，仅传status和handleNote）
    const handleDTO = {
      status: handleForm.handleStatus,
      // 如后端DTO无handleSuggestion字段，仅传备注（把建议写进备注）
      handleNote: `${handleForm.handleSuggestion ? `【处置建议：${handleSuggestionMap[handleForm.handleSuggestion]}】` : ''}${handleForm.handleNote}`
    }
    // 调用API：路径参数+请求体
    const res = await handleReport(handleForm.id, handleDTO)
    if (res.code === 0) {
      ElMessage.success('操作成功')
      handleDialogVisible.value = false
      getReportList()
      
      // 提示手动处理
      if (handleForm.handleSuggestion === '1') {
        ElMessage.info(`请手动处理目标ID为${handleForm.targetId}的违规内容`)
      }
    } else {
      ElMessage.error(res.msg || '失败')
    }
  } catch (e) {
    console.error('处理举报失败：', e)
    ElMessage.error('处理失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => getReportList())
</script>

<style scoped>
.report-manage {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 120px);
}
.operation-bar {
  margin-top: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.form-static-text {
  display: inline-block;
  width: 100%;
  padding: 8px 12px;
  background: #f5f7fa;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  color: #606266;
}
:deep(.el-table__fixed-right) {
  height: 100% !important;
}
:deep(.el-dialog__body) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>