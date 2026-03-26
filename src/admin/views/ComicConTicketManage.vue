<template>
  <div class="comic-ticket-manage">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/admin/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>漫展票务</el-breadcrumb-item>
      <el-breadcrumb-item>票种管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-select
        v-model="comicConId"
        placeholder="选择所属漫展"
        style="width: 200px; margin-right: 10px"
        @change="getTicketList"
      >
        <el-option label="全部漫展" value="" />
        <el-option
          v-for="con in comicConList"
          :key="con.id"
          :label="con.name"
          :value="con.id"
        />
      </el-select>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索票种名称"
        style="width: 300px; margin-right: 10px"
        @keyup.enter="getTicketList"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-button type="primary" @click="openAddDialog">新增票种</el-button>
    </div>

    <!-- 票种列表 -->
    <el-table
      :data="ticketList"
      border
      stripe
      style="width: 100%; margin-top: 20px"
      v-loading="loading"
    >
      <el-table-column prop="id" label="票种ID" width="80" />
      <el-table-column prop="ticketName" label="票种名称" min-width="150" />
      <el-table-column prop="price" label="售价" width="100">
        <template #default="scope">
          ¥{{ scope.row.price || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="库存" width="180">
        <template #default="scope">
          {{ scope.row.stock || 0 }} / {{ scope.row.totalStock || 0 }}
        </template>
      </el-table-column>
      <el-table-column prop="needRealName" label="是否实名" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.needRealName" type="success">是</el-tag>
          <el-tag v-else type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="maxBuy" label="单人限购" width="100">
        <template #default="scope">
          {{ scope.row.maxBuy || 5 }}张
        </template>
      </el-table-column>
      <el-table-column label="售卖时间" min-width="220">
        <template #default="scope">
          {{ scope.row.saleStart ? formatTime(scope.row.saleStart) : '-' }}
          <span v-if="scope.row.saleEnd">至 {{ formatTime(scope.row.saleEnd) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
          <el-tag v-if="scope.row.status === 0" type="danger">下架</el-tag>
          <el-tag v-if="scope.row.status === 2" type="warning">售罄</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template #default="scope">
          {{ scope.row.createTime ? formatTime(scope.row.createTime) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button
            type="warning"
            size="small"
            @click="changeStatus(scope.row, scope.row.status === 1 ? 0 : 1)"
            v-if="scope.row.status !== 2"
          >
            {{ scope.row.status === 1 ? '下架' : '上架' }}
          </el-button>
          <el-button
            type="info"
            size="small"
            @click="changeStatus(scope.row, 2)"
            v-if="scope.row.status !== 2"
          >
            标记售罄
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
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

    <!-- 新增/编辑票种弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑票种' : '新增票种'"
      width="800px"
      @close="resetForm"
    >
      <el-form
        ref="ticketFormRef"
        :model="ticketForm"
        :rules="ticketRules"
        label-width="120px"
      >
        <el-form-item label="所属漫展" prop="comicConId">
          <el-select v-model="ticketForm.comicConId" placeholder="请选择所属漫展">
            <el-option
              v-for="con in comicConList"
              :key="con.id"
              :label="con.name"
              :value="con.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="票种名称" prop="ticketName">
          <el-input v-model="ticketForm.ticketName" placeholder="请输入票种名称（如：周六VIP票）" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="票种售价" prop="price">
          <el-input-number
            v-model="ticketForm.price"
            placeholder="请输入售价"
            :min="0.01"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="总库存" prop="totalStock">
          <el-input-number
            v-model="ticketForm.totalStock"
            placeholder="请输入总库存"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="剩余库存" prop="stock">
          <el-input-number
            v-model="ticketForm.stock"
            placeholder="请输入剩余库存"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="是否需要实名" prop="needRealName">
          <el-radio-group v-model="ticketForm.needRealName">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="单人限购张数" prop="maxBuy">
          <el-input-number
            v-model="ticketForm.maxBuy"
            placeholder="请输入限购张数"
            :min="1"
            :max="10"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="开售时间" prop="saleStart">
          <el-date-picker
            v-model="ticketForm.saleStart"
            type="datetime"
            placeholder="请选择开售时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="停售时间" prop="saleEnd">
          <el-date-picker
            v-model="ticketForm.saleEnd"
            type="datetime"
            placeholder="请选择停售时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="票种状态" prop="status">
          <el-radio-group v-model="ticketForm.status">
            <el-radio label="1">正常销售</el-radio>
            <el-radio label="0">下架</el-radio>
            <el-radio label="2">售罄</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, ElIcon } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

import {
  getTicketList as getTicketListApi,
  getComicConList,
  getTicketDetail,
  addTicket,
  updateTicket,
  updateTicketStatus,
  deleteTicket
} from '@/api/comic-con-ticket'

const loading = ref(false)
const submitLoading = ref(false)
const comicConId = ref('')
const searchKeyword = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const comicConList = ref([])
const ticketList = ref([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const ticketFormRef = ref(null)
const ticketForm = reactive({
  id: '',
  comicConId: '',
  ticketName: '',
  price: undefined,
  totalStock: 0,
  stock: 0,
  needRealName: true,
  maxBuy: 5,
  saleStart: undefined,
  saleEnd: undefined,
  status: '1'
})

const ticketRules = reactive({
  comicConId: [{ required: true, message: '请选择所属漫展', trigger: 'change' }],
  ticketName: [{ required: true, message: '请输入票种名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入票种售价', trigger: 'change' }],
  totalStock: [{ required: true, message: '请输入总库存', trigger: 'change' }],
  stock: [
    { required: true, message: '请输入剩余库存', trigger: 'change' },
    { 
      validator: (rule, value, callback) => {
        if (value > ticketForm.totalStock) {
          callback(new Error('剩余库存不能大于总库存'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  saleStart: [{ required: true, message: '请选择开售时间', trigger: 'change' }],
  saleEnd: [{ required: true, message: '请选择停售时间', trigger: 'change' }],
  status: [{ required: true, message: '请选择票种状态', trigger: 'change' }]
})

const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  try {
    const date = new Date(timeStr.replace(/-/g, '/'))
    if (isNaN(date.getTime())) return '-'
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
  } catch (e) {
    return '-'
  }
}

const loadComicConList = async () => {
  try {
    const res = await getComicConList({ pageNum: 1, pageSize: 1000 })
    
    let records = []
    if (typeof res === 'object' && res.records) {
      records = res.records || []
    } else if (res?.code === 0 && res.data?.records) {
      records = res.data.records || []
    }

    comicConList.value = records.map(item => ({
      ...item,
      id: item.id ? item.id.toString() : '',
      name: item.name || '',
      status: item.status ? Number(item.status) : 1
    }))
  } catch (error) {
    console.error('加载漫展列表失败：', error)
    comicConList.value = []
    ElMessage.error('加载漫展列表失败')
  }
}

// 分页查询票种列表
const getTicketList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      comicConId: comicConId.value || undefined,
      ticketName: searchKeyword.value
    }
    const res = await getTicketListApi(params)
    if (res?.code === 0) {
      ticketList.value = res.data.records || []
      total.value = Number(res.data.total) || 0
    } else if (typeof res === 'object' && res.records) {
      ticketList.value = res.records || []
      total.value = Number(res.total) || 0
    } else {
      ticketList.value = []
      total.value = 0
      ElMessage.warning('暂无票种数据')
    }

    // 统一处理票种数据类型
    ticketList.value = ticketList.value.map(item => ({
      ...item,
      id: item.id ? item.id.toString() : '',
      comicConId: item.comicConId ? item.comicConId.toString() : '',
      price: item.price ? Number(item.price) : 0,
      stock: item.stock ? Number(item.stock) : 0,
      totalStock: item.totalStock ? Number(item.totalStock) : 0,
      needRealName: item.needRealName ? (typeof item.needRealName === 'boolean' ? item.needRealName : Number(item.needRealName) === 1) : true,
      maxBuy: item.maxBuy ? Number(item.maxBuy) : 5,
      status: item.status ? Number(item.status) : 1 // 列表用数字
    }))
  } catch (error) {
    console.error('获取票种列表失败：', error)
    ticketList.value = []
    total.value = 0
    ElMessage.error('获取票种列表失败')
  } finally {
    loading.value = false
  }
}

// 分页事件
const handleSizeChange = (val) => {
  pageSize.value = val
  getTicketList()
}
const handleCurrentChange = (val) => {
  pageNum.value = val
  getTicketList()
}

// 新增弹窗
const openAddDialog = () => {
  if (comicConList.value.length === 0) {
    ElMessage.warning('暂无漫展数据，请先创建漫展')
    return
  }
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

// 编辑弹窗
const openEditDialog = async (row) => {
  isEdit.value = true
  dialogVisible.value = true
  resetForm()
  
  try {
    const res = await getTicketDetail(row.id)
    const detail = res?.code === 0 ? res.data : res
    
    if (!detail) {
      ElMessage.error('获取票种详情失败')
      dialogVisible.value = false
      return
    }

    let statusStr = '1'
    if (detail.status !== undefined && detail.status !== null) {
      const statusNum = Number(detail.status)
      if ([0, 1, 2].includes(statusNum)) {
        statusStr = statusNum.toString()
      }
    }

    const formData = {
      id: detail.id ? detail.id.toString() : '',
      comicConId: detail.comicConId ? (typeof detail.comicConId === 'string' ? detail.comicConId : detail.comicConId.toString()) : '',
      ticketName: detail.ticketName || '',
      price: detail.price ? Number(detail.price) : undefined,
      totalStock: detail.totalStock ? Number(detail.totalStock) : 0,
      stock: detail.stock ? Number(detail.stock) : 0,
      needRealName: detail.needRealName !== undefined ? (typeof detail.needRealName === 'boolean' ? detail.needRealName : Number(detail.needRealName) === 1) : true,
      maxBuy: detail.maxBuy ? Number(detail.maxBuy) : 5,
      saleStart: detail.saleStart || undefined,
      saleEnd: detail.saleEnd || undefined,
      status: statusStr
    }

    await nextTick()
    Object.assign(ticketForm, formData)

    console.log('最终赋值status:', ticketForm.status)

  } catch (error) {
    console.error('获取票种详情失败：', error)
    ElMessage.error('获取票种详情失败')
    dialogVisible.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (ticketFormRef.value) {
    ticketFormRef.value.clearValidate()
    ticketFormRef.value.resetFields()
  }
  Object.assign(ticketForm, {
    id: '',
    comicConId: '',
    ticketName: '',
    price: undefined,
    totalStock: 0,
    stock: 0,
    needRealName: true,
    maxBuy: 5,
    saleStart: undefined,
    saleEnd: undefined,
    status: '1'
  })
}

// 提交表单
const submitForm = async () => {
  if (!ticketFormRef.value) return
  
  ticketFormRef.value.validate(async (valid) => {
    if (valid) {
      if (ticketForm.saleStart && ticketForm.saleEnd) {
        if (new Date(ticketForm.saleStart) >= new Date(ticketForm.saleEnd)) {
          ElMessage.error('停售时间必须晚于开售时间')
          return
        }
      }
      
      submitLoading.value = true
      try {
        const submitData = {
          ...ticketForm,
          productId: Number(ticketForm.productId),
          status: Number(ticketForm.status),
          price: ticketForm.price ? Number(ticketForm.price) : 0,
          totalStock: Number(ticketForm.totalStock),
          stock: Number(ticketForm.stock),
          maxBuy: Number(ticketForm.maxBuy)
        }

        let res
        if (isEdit.value) {
          res = await updateTicket(submitData.id, submitData)
        } else {
          const form = { ...submitData }
          delete form.id
          res = await addTicket(form)
        }
        
        if (res === '新增票种成功' || res === '修改票种成功' || res?.code === 0) {
          ElMessage.success(isEdit.value ? '编辑票种成功' : '新增票种成功')
          dialogVisible.value = false
          getTicketList()
        } else {
          ElMessage.error(isEdit.value ? '编辑票种失败' : '新增票种失败' + res.msg)
        }
      } catch (error) {
        console.error('提交票种失败：', error.msg || error)
        ElMessage.error('提交票种失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 修改状态（下架/上架/售罄）
const changeStatus = async (row, targetStatus) => {
  const statusText = {
    0: '下架',
    1: '上架',
    2: '标记为售罄'
  }[targetStatus]
  
  try {
    await ElMessageBox.confirm(`确定${statusText}该票种吗？`, '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    loading.value = true
    const res = await updateTicketStatus(row.id, targetStatus)
    if (res === '状态修改成功' || res?.code === 0) {
      ElMessage.success(`票种已${statusText}`)
      row.status = targetStatus
      getTicketList()
    } else {
      ElMessage.error(`修改票种状态失败：${res || '未知错误'}`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('修改票种状态失败：', error)
      ElMessage.error('修改票种状态失败')
    }
  } finally {
    loading.value = false
  }
}

// 删除票种
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该票种吗？删除后不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    loading.value = true
    const res = await deleteTicket(id)
    if (res === '删除票种成功' || res?.code === 0) {
      ElMessage.success('删除票种成功')
      getTicketList()
    } else {
      ElMessage.error('删除票种失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除票种失败：', error)
      ElMessage.error('删除票种失败')
    }
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(async () => {
  await loadComicConList()
  await getTicketList()
})
</script>

<style scoped>
.comic-ticket-manage {
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
  max-height: 60vh;
  overflow-y: auto;
}
</style>