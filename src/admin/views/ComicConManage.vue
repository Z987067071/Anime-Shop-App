<template>
  <div class="comic-con-manage">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/admin/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>漫展票务</el-breadcrumb-item>
      <el-breadcrumb-item>漫展管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索漫展名称/商品ID"
        style="width: 300px; margin-right: 10px"
        @keyup.enter="getComicConList"
        >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select
        v-model="productId"
        placeholder="筛选关联商品"
        style="width: 200px; margin-right: 10px"
        @change="getComicConList"
      >
        <el-option label="全部商品" value="" />
        <el-option
          v-for="product in productList"
          :key="product.id"
          :label="product.productName"
          :value="product.id"
        />
      </el-select>
      <el-button type="primary" @click="openAddDialog">新增漫展</el-button>
    </div>

    <!-- 漫展列表 -->
    <el-table
      :data="comicConList"
      border
      stripe
      style="width: 100%; margin-top: 20px"
      v-loading="loading"
    >
      <el-table-column prop="id" label="漫展ID" width="80" />
      <el-table-column prop="productName" label="关联商品" min-width="200" />
      <el-table-column prop="name" label="漫展名称" min-width="200" />
      <el-table-column label="举办时间" width="220">
        <template #default="scope">
          {{ scope.row.startTime ? formatTime(scope.row.startTime) : '-' }}
          <span v-if="scope.row.endTime">至 {{ formatTime(scope.row.endTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="venue" label="举办地址" min-width="200" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 1" type="success">可售</el-tag>
          <el-tag v-if="scope.row.status === 0" type="danger">停售</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template #default="scope">
          {{ scope.row.createTime ? formatTime(scope.row.createTime) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button
            type="warning"
            size="small"
            @click="changeStatus(scope.row)"
            :disabled="scope.row.status === 2"
          >
            {{ scope.row.status === 1 ? '停售' : '开启销售' }}
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

    <!-- 新增/编辑漫展弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑漫展' : '新增漫展'"
      width="700px"
      @close="resetForm"
    >
      <el-form
        ref="comicConFormRef"
        :model="comicConForm"
        :rules="comicConRules"
        label-width="100px"
      >
        <el-form-item label="关联商品" prop="productId">
          <el-select v-model="comicConForm.productId" placeholder="请选择漫展关联商品">
            <el-option
              v-for="product in productList"
              :key="product.id"
              :label="product.productName"
              :value="product.id"
            />
          </el-select>
          <div class="tips">提示：请先在商品模块创建「漫展虚拟商品」后再关联</div>
        </el-form-item>
        <el-form-item label="漫展名称" prop="name">
          <el-input v-model="comicConForm.name" placeholder="请输入漫展名称" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="comicConForm.startTime"
            type="datetime"
            placeholder="请选择漫展开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="comicConForm.endTime"
            type="datetime"
            placeholder="请选择漫展结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="举办地址" prop="venue">
          <el-input v-model="comicConForm.venue" placeholder="请输入漫展举办地址" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="漫展简介">
          <el-input
            v-model="comicConForm.description"
            type="textarea"
            placeholder="请输入漫展简介"
            :rows="4"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="漫展状态" prop="status">
          <el-radio-group v-model="comicConForm.status">
            <el-radio label="1">可售</el-radio>
            <el-radio label="0">停售</el-radio>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElIcon } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user';
import { 
  getComicConList as getComicConListApiFromFile,
  getComicProductList,
  getComicConDetail, 
  addComicCon, 
  updateComicCon, 
  updateComicConStatus, 
  deleteComicCon 
} from '@/api/comic-con'

const loading = ref(false)
const submitLoading = ref(false)
const searchKeyword = ref('')
const productId = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const user = useUserStore()
const productList = ref([])
const comicConList = ref([])

const getComicConList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      name: searchKeyword.value,
      productId: productId.value || undefined
    }
    const res = await getComicConListApiFromFile(params)
    if (res?.code === 0) {
      comicConList.value = res.data.records || []
      total.value = Number(res.data.total) || 0
    } else if (typeof res === 'object') {
      comicConList.value = res.records || []
      total.value = Number(res.total) || 0
    } else {
      comicConList.value = []
      total.value = 0
      ElMessage.warning('暂无漫展数据')
    }
  } catch (error) {
    console.error('获取漫展列表失败：', error)
    comicConList.value = []
    total.value = 0
    ElMessage.error('获取漫展列表失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  getComicConList()
}
const handleCurrentChange = (val) => {
  pageNum.value = val
  getComicConList()
}

const loadProductList = async () => {
  try {
    const res = await getComicProductList()
    if (res.code === 0 && res.data) {
      productList.value = res.data.records || []
    } else {
      productList.value = []
      ElMessage.warning('暂无漫展类型商品，请先在商品模块创建')
    }
  } catch (error) {
    console.error('获取漫展商品列表失败：', error)
    productList.value = []
    ElMessage.error('获取漫展商品列表失败')
  }
}

const dialogVisible = ref(false)
const isEdit = ref(false)
const comicConFormRef = ref(null)
const comicConForm = reactive({
  id: '',
  productId: '',
  name: '',
  startTime: undefined,
  endTime: undefined,
  venue: '',
  description: '',
  status: '1'
})

const comicConRules = reactive({
  productId: [{ required: true, message: '请选择关联商品', trigger: 'change' }],
  name: [{ required: true, message: '请输入漫展名称', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  venue: [{ required: true, message: '请输入举办地址', trigger: 'blur' }],
  status: [{ required: true, message: '请选择漫展状态', trigger: 'change' }]
})

const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  try {
    const date = new Date(timeStr.replace(/-/g, '/'))
    if (isNaN(date.getTime())) {
      return '-'
    }
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
  } catch (e) {
    return '-'
  }
}

const openAddDialog = () => {
  if (productList.value.length === 0) {
    ElMessage.warning('暂无可关联的漫展商品，请先在商品模块创建')
    return
  }
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

const openEditDialog = async (row) => {
  isEdit.value = true
  dialogVisible.value = true
  try {
    const res = await getComicConDetail(row.id)
    const detail = res?.code === 0 ? res.data : res
    if (!detail) {
      ElMessage.error('获取漫展详情失败：数据为空')
      dialogVisible.value = false
      return
    }
    Object.assign(comicConForm, {
      id: detail.id || '',
      productId: detail.productId ? (typeof detail.productId === 'string' ? detail.productId : detail.productId.toString()) : '',
      name: detail.name || '',
      startTime: detail.startTime || undefined,
      endTime: detail.endTime || undefined,
      venue: detail.venue || '',
      description: detail.description || '',
      status: detail.status != null ? detail.status.toString() : '1'
    })
  } catch (error) {
    console.error('获取漫展详情失败：', error)
    ElMessage.error('获取漫展详情失败')
    dialogVisible.value = false
  }
}

const resetForm = () => {
  if (comicConFormRef.value) {
    comicConFormRef.value.resetFields()
  }
  Object.assign(comicConForm, {
    id: '',
    productId: '',
    name: '',
    startTime: undefined,
    endTime: undefined,
    venue: '',
    description: '',
    status: '1'
  })
}

const submitForm = async () => {
  if (!comicConFormRef.value) return
  
  comicConFormRef.value.validate(async (valid) => {
    if (valid) {
      if (comicConForm.startTime && comicConForm.endTime) {
        if (new Date(comicConForm.startTime) >= new Date(comicConForm.endTime)) {
          ElMessage.error('结束时间必须晚于开始时间')
          return
        }
      }
      
      submitLoading.value = true
      try {
        let res
        if (isEdit.value) {
          res = await updateComicCon(comicConForm.id, comicConForm)
        } else {
          const form = { ...comicConForm }
          delete form.id
          res = await addComicCon(form)
        }
        if (res === '新增成功' || res === '修改成功' || res?.code === 0) {
          ElMessage.success(isEdit.value ? '编辑漫展成功' : '新增漫展成功')
          dialogVisible.value = false
          getComicConList()
        } else {
          ElMessage.error(isEdit.value ? '编辑漫展失败' : '新增漫展失败')
        }
      } catch (error) {
        console.error('提交漫展失败：', error)
        ElMessage.error('提交漫展失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const changeStatus = async (row) => {
  const targetStatus = row.status === 1 ? 0 : 1
  const statusText = targetStatus === 1 ? '开启销售' : '停售'
  
  try {
    await ElMessageBox.confirm(`确定${statusText}该漫展吗？`, '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    loading.value = true
    const res = await updateComicConStatus(row.id, targetStatus)
    if (res === '状态修改成功' || res?.code === 0) {
      ElMessage.success(`漫展已${statusText}`)
      row.status = targetStatus
    } else {
      ElMessage.error(`修改漫展状态失败`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('修改漫展状态失败：', error)
      ElMessage.error('修改漫展状态失败')
    }
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该漫展吗？删除后关联票种也将失效！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    loading.value = true
    const res = await deleteComicCon(id)
    if (res === '删除成功' || res?.code === 0) {
      ElMessage.success('删除漫展成功')
      getComicConList()
    } else {
      ElMessage.error('删除漫展失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除漫展失败：', error)
      ElMessage.error('删除漫展失败')
    }
  } finally {
    loading.value = false
  }
}

// 页面初始化
onMounted(async () => {
  await loadProductList()
  await getComicConList()
})
</script>

<style scoped>
.comic-con-manage {
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

.tips {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

:deep(.el-table .el-table__fixed-right) {
  height: 100% !important;
}

:deep(.el-dialog__body) {
  max-height: 60vh;
  overflow-y: auto;
}
</style>