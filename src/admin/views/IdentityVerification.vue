<template>
  <div class="buyer-audit-manage">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/admin/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>票务管理</el-breadcrumb-item>
      <el-breadcrumb-item>身份审核</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索购票人姓名/身份证号"
        style="width: 300px; margin-right: 10px"
        @keyup.enter="getBuyerList"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select
        v-model="auditStatus"
        placeholder="筛选审核状态"
        style="width: 200px; margin-right: 10px"
        @change="getBuyerList"
      >
        <el-option label="全部状态" value="" />
        <el-option label="待审核" value="0" />
        <el-option label="审核通过" value="1" />
        <el-option label="审核驳回" value="2" />
      </el-select>
      <el-button type="primary" @click="refreshList">刷新列表</el-button>
    </div>

    <!-- 购票人审核列表 -->
    <el-table
      :data="buyerList"
      border
      stripe
      style="width: 100%; margin-top: 20px"
      v-loading="loading"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="购票人姓名" width="120" />
      <el-table-column prop="idCard" label="身份证号" width="180">
        <template #default="scope">
          {{ formatIdCard(scope.row.idCard) }}
        </template>
      </el-table-column>
      <el-table-column label="审核状态" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.auditStatus === 0" type="warning">待审核</el-tag>
          <el-tag v-if="scope.row.auditStatus === 1" type="success">审核通过</el-tag>
          <el-tag v-if="scope.row.auditStatus === 2" type="danger">审核驳回</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="auditRemark" label="驳回理由" min-width="200">
        <template #default="scope">
          {{ scope.row.auditRemark || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="提交时间" width="180">
        <template #default="scope">
          {{ scope.row.createTime ? formatTime(scope.row.createTime) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="scope">
          <el-button 
            v-if="scope.row.auditStatus === 0" 
            type="success" 
            size="small" 
            @click="openAuditDialog(scope.row, 1)"
          >
            通过
          </el-button>
          <el-button 
            v-if="scope.row.auditStatus === 0" 
            type="danger" 
            size="small" 
            @click="openAuditDialog(scope.row, 2)"
          >
            驳回
          </el-button>
          <!-- <el-button 
            v-if="scope.row.auditStatus !== 0" 
            type="primary" 
            size="small" 
            @click="openAuditDialog(scope.row, scope.row.auditStatus)"
          >
            重新审核
          </el-button> -->
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

    <!-- 审核弹窗 -->
    <el-dialog
      v-model="auditDialogVisible"
      :title="auditType === 1 ? '审核通过' : '审核驳回'"
      width="400px"
      @close="resetAuditForm"
    >
      <el-form
        ref="auditFormRef"
        :model="auditForm"
        :rules="auditRules"
        label-width="100px"
      >
        <el-form-item label="购票人姓名">
          <el-input v-model="auditForm.name" disabled />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="auditForm.idCard" disabled>
            <template #input>
              {{ formatIdCard(auditForm.idCard) }}
            </template>
          </el-input>
        </el-form-item>
        <el-form-item 
          label="驳回理由" 
          prop="auditRemark"
          v-if="auditType === 2"
        >
          <el-input
            v-model="auditForm.auditRemark"
            type="textarea"
            placeholder="请输入驳回理由（必填）"
            :rows="4"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit" :loading="submitLoading">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { 
  getBuyerAuditPage, 
  auditBuyer 
} from '@/api/buyer'

const loading = ref(false)
const submitLoading = ref(false)
const searchKeyword = ref('')
const auditStatus = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const buyerList = ref([])
const auditDialogVisible = ref(false)
const auditType = ref(1)
const auditFormRef = ref(null)
const auditForm = reactive({
  id: '',
  name: '',
  idCard: '',
  auditRemark: ''
})

const auditRules = reactive({
  auditRemark: [
    { required: true, message: '请输入驳回理由', trigger: 'blur' },
    { max: 200, message: '驳回理由不能超过200个字', trigger: 'blur' }
  ]
})

const formatIdCard = (idCard) => {
  if (!idCard || idCard.length !== 18) return idCard || '-'
  return idCard.substring(0, 6) + '********' + idCard.substring(14)
}

const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
}

// 获取购票人审核列表
const getBuyerList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      auditStatus: auditStatus.value || undefined
    }
    const res = await getBuyerAuditPage(params)
    if (res.code === 0) {
      buyerList.value = res.data || []
      total.value = Number(res.data.total) || 0
    } else {
      buyerList.value = []
      total.value = 0
      ElMessage.warning(res.msg || '暂无购票人审核数据')
    }
  } catch (error) {
    console.error('获取购票人审核列表失败：', error)
    buyerList.value = []
    total.value = 0
    ElMessage.error('获取购票人审核列表失败')
  } finally {
    loading.value = false
  }
}

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  getBuyerList()
}
const handleCurrentChange = (val) => {
  pageNum.value = val
  getBuyerList()
}

// 刷新列表
const refreshList = () => {
  pageNum.value = 1
  getBuyerList()
}

// 打开审核弹窗
const openAuditDialog = (row, type) => {
  auditType.value = type
  auditDialogVisible.value = true
  Object.assign(auditForm, {
    id: row.id,
    name: row.name,
    idCard: row.idCard,
    auditRemark: row.auditRemark || ''
  })
}

// 重置审核表单
const resetAuditForm = () => {
  if (auditFormRef.value) {
    auditFormRef.value.resetFields()
  }
  Object.assign(auditForm, {
    id: '',
    name: '',
    idCard: '',
    auditRemark: ''
  })
}

// 提交审核
const submitAudit = async () => {
  if (!auditFormRef.value) return
  if (auditType.value === 2) {
    auditFormRef.value.validate(async (valid) => {
      if (!valid) return
      await doAudit()
    })
  } else {
    await doAudit()
  }
}

const doAudit = async () => {
  submitLoading.value = true
  try {
    const submitData = {
      id: auditForm.id,
      auditStatus: auditType.value,
      auditRemark: auditType.value === 2 ? auditForm.auditRemark : ''
    }
    const res = await auditBuyer(submitData)
    if (res.code === 0) {
      ElMessage.success(auditType.value === 1 ? '审核通过成功' : '审核驳回成功')
      auditDialogVisible.value = false
      getBuyerList()
    } else {
      ElMessage.error(res.msg || (auditType.value === 1 ? '审核通过失败' : '审核驳回失败'))
    }
  } catch (error) {
    console.error('提交审核失败：', error)
    ElMessage.error('提交审核失败')
  } finally {
    submitLoading.value = false
  }
}

// 页面初始化
onMounted(async () => {
  await getBuyerList()
})
</script>

<style scoped>
.buyer-audit-manage {
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

:deep(.el-table .el-table__fixed-right) {
  height: 100% !important;
}

:deep(.el-dialog__body) {
  max-height: 50vh;
  overflow-y: auto;
}
</style>