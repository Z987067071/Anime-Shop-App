<template>
  <div class="category-manage">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/admin/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品</el-breadcrumb-item>
      <el-breadcrumb-item>分类管理</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="operation-bar" style="margin-top: 20px">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索分类名称（一级/二级）"
        style="width: 300px; margin-right: 10px"
        @keyup.enter="getCategoryListData"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-button type="primary" @click="openAddDialog(0)">新增一级分类</el-button>
    </div>

    <el-table
      :data="categoryTreeList || []"
      border
      stripe
      style="width: 100%; margin-top: 20px"
      v-loading="loading"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      default-expand-all
      row-key="id"
    >
      <el-table-column prop="id" label="分类ID" width="80" />
      <el-table-column label="分类名称" width="220">
        <template #default="scope">
          <span v-if="scope.row" :style="{ marginLeft: `${((scope.row.categoryLevel || 1) - 1) * 20}px`, display: 'inline-block',opacity: scope.row.status == 0 ? 0.6 : 1 }">
            {{ scope.row.categoryName || '' }}
            <el-tag 
              v-if="(scope.row.categoryLevel || 1) === 1" 
              size="small" 
              type="primary" 
              style="margin-left: 8px"
            >
              一级
            </el-tag>
            <el-tag 
              v-if="(scope.row.categoryLevel || 1) === 2" 
              size="small" 
              type="success"
              style="margin-left: 8px"
            >
              二级
            </el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="上级分类" width="120">
        <template #default="scope">
          <span v-if="scope.row" >
            {{ scope.row.parentId === 0 ? '无' : scope.row.parentId }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="150">
        <template #default="scope">
          <el-input-number
            v-if="scope.row" 
            v-model="scope.row.sort"
            :min="1"
            :max="999"
            @change="handleSortChange(scope.row)"
            size="small"
            :disabled="scope.row.status === 0"
          />
        </template>
      </el-table-column>
      <el-table-column label="状态" width="160">
        <template #default="scope">
          <div :style="{ opacity: scope.row.status == 0 ? 0.6 : 1 }">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="禁用"
              @change="handleStatusChange(scope.row)"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作">
        <template #default="scope">
          <div v-if="scope.row">
            <el-button type="primary" size="small" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button
              type="success"
              size="small"
              v-if="(scope.row.categoryLevel || 1) === 1"
              @click="openAddDialog(scope.row.id)"
            >
              添加子分类
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row.id)"
              :disabled="(scope.row.children && scope.row.children.length > 0) || false"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑分类弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : (parentId === 0 ? '新增一级分类' : '新增子分类')"
      width="400px"
      @close="resetForm"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="categoryForm.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <!-- 新增一级分类时隐藏上级分类选择框 -->
        <el-form-item label="上级分类" prop="parentId" v-if="!isEdit && parentId !== 0">
          <el-select v-model="categoryForm.parentId" placeholder="请选择上级分类" disabled>
            <el-option 
              :label="getCategoryNameById(parentId)" 
              :value="parentId" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="categoryForm.sort"
            :min="1"
            :max="999"
            placeholder="排序值越大越靠前"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { 
  getCategoryTreeList,
  addCategory, 
  editCategory, 
  deleteCategory, 
  updateCategorySort,
  updateCategoryStatus
} from '@/api/category'

const loading = ref(false)
const searchKeyword = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const parentId = ref(0)
const categoryTreeList = ref([])
const categoryFormRef = ref(null)
const categoryForm = reactive({
  id: '',
  categoryName: '',
  parentId: 0,
  sort: 1
})

const categoryRules = reactive({
  categoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }]
})

// 根据ID获取分类名称（用于子分类弹窗显示父分类）
const getCategoryNameById = (id) => {
  const findName = (list) => {
    for (const item of list) {
      if (item.id === id) return item.categoryName
      if (item.children) {
        const res = findName(item.children)
        if (res) return res
      }
    }
    return ''
  }
  return findName(categoryTreeList.value) || '未知分类'
}

// 页面初始化
onMounted(() => {
  getCategoryListData()
})

const getCategoryListData = async () => {
  loading.value = true
  try {
    let res = await getCategoryTreeList()
    let list = res.data || []
    
    if (searchKeyword.value.trim()) {
      const keyword = searchKeyword.value.trim()
      const filterList = (tree) => {
        return tree.filter(item => {
          const hasMatch = item.categoryName.includes(keyword)
          if (item.children) {
            item.children = filterList(item.children)
            return hasMatch || item.children.length > 0
          }
          return hasMatch
        })
      }
      list = filterList(list)
    }
    categoryTreeList.value = list
  } catch (error) {
    console.error('获取分类列表失败：', error)
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

const openAddDialog = (pid = 0) => {
  isEdit.value = false
  parentId.value = pid
  dialogVisible.value = true
  resetForm()
  categoryForm.parentId = pid
}

// 编辑弹窗
const openEditDialog = (row) => {
  isEdit.value = true
  dialogVisible.value = true
  Object.assign(categoryForm, {
    id: row.id,
    categoryName: row.categoryName,
    parentId: row.parentId,
    sort: row.sort
  })
}

// 重置表单
const resetForm = () => {
  categoryFormRef.value?.resetFields()
  Object.assign(categoryForm, {
    id: '',
    categoryName: '',
    parentId: parentId.value,
    sort: 1
  })
}

// 提交表单：逻辑不变
const submitForm = async () => {
  categoryFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (isEdit.value) {
          const res = await editCategory({
            id: categoryForm.id,
            categoryName: categoryForm.categoryName,
            sort: categoryForm.sort,
            status: 1
          })
          if(res.code === 0){
            ElMessage.success('编辑分类成功')
          } else {
            ElMessage.error(res.msg)
          }
        } else {
          const res = await addCategory({
            parentId: categoryForm.parentId,
            categoryName: categoryForm.categoryName,
            sort: categoryForm.sort,
            status: 1
          })
          if(res.code === 0){
            ElMessage.success(parentId.value === 0 ? '新增一级分类成功' : '新增子分类成功')
          } else {
            ElMessage.error(res.msg)
          }
        }
        dialogVisible.value = false
        getCategoryListData()
      } catch (error) {
        ElMessage.error(isEdit.value ? '编辑分类失败' : '新增分类失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 状态修改
const handleStatusChange = async (row) => {
  loading.value = true
  try {
    // 确保status是数字类型（后端接收Integer）
    const status = Number(row.status);
    const res = await updateCategoryStatus({
      id: row.id,
      status: status // 1=启用，0=禁用
    })
    if(res.code === 0){
      ElMessage.success(`分类已${status === 1 ? '启用' : '禁用'}`)
    } else {
      ElMessage.error(res.msg)
    }
    getCategoryListData()
  } catch (error) {
    // 回滚开关状态（恢复原状态）
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('状态修改失败')
  } finally {
    loading.value = false
  }
}

// 排序
const handleSortChange = async (row) => {
  loading.value = true
  try {
    await updateCategorySort({
      id: row.id,
      categoryName: row.categoryName,
      sort: row.sort,
      status: 1
    })
    ElMessage.success('排序修改成功')
    getCategoryListData()
  } catch (error) {
    ElMessage.error('排序修改失败')
  } finally {
    loading.value = false
  }
}

// 删除分类
const handleDelete = async (id) => {
  ElMessageBox.confirm(
    '确定删除该分类吗？删除后无法恢复！',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    loading.value = true
    try {
      const res = await deleteCategory(id)
      if(res.code === 0){
        ElMessage.success('删除分类成功')
      } else {
        ElMessage.error(res.msg)
      }
      getCategoryListData()
    } catch (error) {
      ElMessage.error('删除分类失败（该分类下有子分类或关联商品）')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.category-manage {
  padding: 20px;
}
.operation-bar {
  display: flex;
  align-items: center;
}
</style>