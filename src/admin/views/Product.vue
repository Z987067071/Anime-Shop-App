<template>
  <div class="product-manage">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/admin/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索商品名称/编号"
        style="width: 300px; margin-right: 10px"
        @keyup.enter="getProductList"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select
        v-model="categoryId"
        placeholder="筛选分类"
        style="width: 200px; margin-right: 10px"
        @change="getProductList"
      >
        <el-option label="全部分类" value="" />
        <el-option
          v-for="category in categoryList"
          :key="category.id"
          :label="category.categoryName"
          :value="category.id"
        />
      </el-select>
      <!-- 商品类型筛选 -->
      <el-select
        v-model="productType"
        placeholder="筛选商品类型"
        style="width: 180px; margin-right: 10px"
        @change="getProductList"
      >
        <el-option label="全部类型" value="" />
        <el-option label="普通商品" value="0" />
        <el-option label="漫展虚拟商品" value="1" />
      </el-select>
      <el-button type="primary" @click="openAddDialog">新增商品</el-button>
    </div>

    <!-- 商品列表 -->
    <el-table
      :data="productList"
      border
      stripe
      style="width: 100%; margin-top: 20px"
      v-loading="loading"
    >
      <el-table-column prop="id" label="商品ID" width="80" />
      <el-table-column prop="productName" label="商品名称" min-width="200" />
      <el-table-column prop="categoryName" label="所属分类" width="120" />
      <!-- 商品类型列 -->
      <el-table-column label="商品类型" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.productType === 0">普通商品</el-tag>
          <el-tag v-if="scope.row.productType === 1" type="primary">漫展虚拟商品</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格(¥)" width="100">
        <template #default="scope">¥{{ scope.row.price ? scope.row.price.toFixed(2) : '0.00' }}</template>
      </el-table-column>
      <el-table-column prop="originalPrice" label="原价(¥)" width="100">
        <template #default="scope">¥{{ scope.row.originalPrice ? scope.row.originalPrice.toFixed(2) : '0.00' }}</template>
      </el-table-column>
      <el-table-column prop="remainStock" label="剩余库存" width="100" />
      <el-table-column prop="totalStock" label="总库存" width="80" />
      <el-table-column prop="status" label="状态" width="150">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-text="上架"
            inactive-text="下架"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          />
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

    <!-- 新增/编辑商品弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '新增商品'"
      width="700px"
      @close="resetForm"
    >
      <el-form
        ref="productFormRef"
        :model="productForm"
        :rules="productRules"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="productName">
          <el-input v-model="productForm.productName" placeholder="请输入商品名称" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="所属分类" prop="categoryId">
          <el-select v-model="productForm.categoryId" placeholder="请选择分类">
            <el-option
              v-for="category in categoryList"
              :key="category.id"
              :label="category.categoryName"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <!-- 商品类型选择项 -->
        <el-form-item label="商品类型" prop="productType">
          <el-radio-group v-model="productForm.productType">
            <el-radio label="0">普通商品</el-radio>
            <el-radio label="1">漫展虚拟商品</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商品价格" prop="price">
          <el-input
            v-model.number="productForm.price"
            type="number"
            placeholder="请输入商品价格"
            suffix="¥"
            step="0.01"
            min="0"
            precision="2"
          />
        </el-form-item>
        <el-form-item label="商品原价" prop="originalPrice">
          <el-input
            v-model.number="productForm.originalPrice"
            type="number"
            placeholder="请输入商品原价"
            suffix="¥"
            step="0.01"
            min="0"
            precision="2"
          />
        </el-form-item>
        <el-form-item label="剩余库存" prop="remainStock">
          <el-input
            v-model.number="productForm.remainStock"
            type="number"
            placeholder="请输入剩余库存"
            min="0"
            step="1"
          />
        </el-form-item>
        <el-form-item label="总库存" prop="totalStock">
          <el-input
            v-model.number="productForm.totalStock"
            type="number"
            placeholder="请输入总库存"
            min="0"
            step="1"
          />
        </el-form-item>
        <el-form-item label="商品状态" prop="status">
          <el-radio-group v-model="productForm.status">
            <el-radio label="1">上架</el-radio>
            <el-radio label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商品标签" prop="tag">
          <el-input v-model="productForm.tag" placeholder="请输入商品标签，多个标签用逗号分隔" />
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input
            v-model="productForm.detailContent"
            type="textarea"
            placeholder="请输入商品描述"
            :rows="4"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="商品图片">
          <el-upload
            action="http://localhost:8080/api/admin/product/upload/file"
            list-type="picture-card"
            :on-success="handleImageSuccess"
            :on-remove="handleImageRemove"
            :file-list="formatUploadFileList(productForm.imageList)"
            :headers="uploadHeaders"
            :with-credentials="true" 
            name="file"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
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
import { ref, reactive, onMounted,computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user';
import { 
  getProductPage, 
  getProductDetail, 
  addProduct, 
  editProduct, 
  updateProductStatus, 
  deleteProduct,
  getCategoryList 
} from '@/api/product'

const loading = ref(false)
const submitLoading = ref(false)
const searchKeyword = ref('')
const categoryId = ref('')
const productType = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const user = useUserStore()

const categoryList = ref([])
const productList = ref([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const productFormRef = ref(null)
const productForm = reactive({
  id: '',
  productName: '',
  categoryId: '',
  productType: '0',
  price: '',
  originalPrice: '',
  remainStock: '',
  totalStock: '',
  status: '1',
  tag: '',
  detailContent: '',
  imageList: []
})
const realImageUrls = ref([]); 

const productRules = reactive({
  productName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择所属分类', trigger: 'change' }],
  productType: [{ required: true, message: '请选择商品类型', trigger: 'change' }],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能小于0', trigger: 'blur' }
  ],
  originalPrice: [
    { type: 'number', min: 0, message: '原价不能小于0', trigger: 'blur' }
  ],
  remainStock: [
    { required: true, message: '请输入商品剩余库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存不能小于0', trigger: 'blur' }
  ],
  totalStock: [
    { required: true, message: '请输入商品总库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存不能小于0', trigger: 'blur' }
  ]
})

const formatUploadFileList = (imageList) => {
  if (!imageList || imageList.length === 0) return []
  
  return imageList.map(item => {
    if (item.url && (item.url.startsWith('http://') || item.url.startsWith('https://'))) {
      return {
        name: item.name || '商品图片',
        url: item.url,
        status: 'success',
        response: { code: 0, data: item.url }
      }
    }
    return {
      name: item.name || '商品图片',
      url: item.url,
      status: 'success'
    }
  })
}

const uploadHeaders = computed(() => {
  return {
    'Authorization': `Bearer ${user.token}`
  }
})

// 图片上传成功回调
const handleImageSuccess = (res, file, fileList) => {
  if (res.code === 0) {
    productForm.imageList = fileList.map(item => ({
      name: item.name || '商品图片',
      url: item.response?.data || item.url 
    }))
    realImageUrls.value = fileList.map(item => ({
      name: item.name || '商品图片',
      url: item.response?.data || res.data 
    }));
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败：' + res.msg)
    realImageUrls.value = [];
  }
}

// 移除图片回调
const handleImageRemove = (file, fileList) => {
  productForm.imageList = fileList.map(item => ({
    name: item.name || '商品图片',
    url: item.response?.data || item.url
  }))
  realImageUrls.value = fileList.map(item => ({
    name: item.name || '商品图片',
    url: item.response?.data || item.url
  }))
}

const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
}

// 递归扁平化分类列表
const flattenCategory = (categories, parentName = '') => {
  let result = []
  categories.forEach(category => {
    if (category.status === 1) {
      const currentParentName = parentName ? `${parentName} > ${category.categoryName}` : category.categoryName
      if (category.categoryLevel === 2) {
        result.push({
          id: category.id,
          categoryName: currentParentName,
          originalName: category.categoryName,
          parentId: category.parentId
        })
      }
      if (category.categoryLevel === 1 && category.children && category.children.length > 0) {
        const childCategories = flattenCategory(category.children, category.categoryName)
        result = result.concat(childCategories)
      }
    }
  })
  return result
}

// 获取分类列表
const loadCategoryList = async () => {
  try {
    const res = await getCategoryList()
    if (res.code === 0 && res.data && res.data.length) {
      categoryList.value = flattenCategory(res.data)
    } else {
      categoryList.value = []
      ElMessage.warning('暂无分类数据')
    }
  } catch (error) {
    console.error('获取分类列表失败：', error)
    categoryList.value = []
    ElMessage.error('获取分类列表失败')
  }
}

// 获取商品列表
const getProductList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      productName: searchKeyword.value,
      categoryId: categoryId.value || undefined,
      productType: productType.value || undefined
    }
    const res = await getProductPage(params)
    if (res.code === 0) {
      productList.value = res.data.records || []
      total.value = Number(res.data.total) || 0
    } else {
      productList.value = []
      total.value = 0
      ElMessage.warning(res.msg || '暂无商品数据')
    }
  } catch (error) {
    console.error('获取商品列表失败：', error)
    productList.value = []
    total.value = 0
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  getProductList()
}
const handleCurrentChange = (val) => {
  pageNum.value = val
  getProductList()
}

// 新增商品弹窗
const openAddDialog = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

// 编辑商品弹窗
const openEditDialog = async (row) => {
  isEdit.value = true
  dialogVisible.value = true
  try {
    const res = await getProductDetail(row.id)
    if (res.code === 0) {
      const detail = res.data
      Object.assign(productForm, {
        id: detail.id,
        productName: detail.productName || '',
        categoryId: detail.categoryId || '',
        productType: detail.productType?.toString() || '0',
        price: detail.price || '',
        originalPrice: detail.originalPrice || '',
        remainStock: detail.remainStock || '',
        totalStock: detail.totalStock || '',
        status: detail.status?.toString() || '1',
        tag: detail.tag || '',
        detailContent : detail.detailContent || '',
        imageList: (detail.imageList || []).map(img => ({
          url: img.imageUrl || img.url,
          name: img.name || '商品图片'
        }))
      })
      realImageUrls.value = (detail.imageList || []).map(img => ({
        url: img.imageUrl || img.url,
        name: img.name || '商品图片'
      }))
      console.log(productForm);
      console.log(realImageUrls);
      
    } else {
      ElMessage.error(res.msg || '获取商品详情失败')
      dialogVisible.value = false
    }
  } catch (error) {
    console.error('获取商品详情失败：', error)
    ElMessage.error('获取商品详情失败')
    dialogVisible.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (productFormRef.value) {
    productFormRef.value.resetFields()
  }
  Object.assign(productForm, {
    id: '',
    productName: '',
    categoryId: '',
    productType: '0',
    price: '',
    originalPrice: '',
    remainStock: '',
    totalStock: '',
    status: '1',
    tag: '',
    detailContent: '',
    imageList: []  
  })
}

// 提交表单
const submitForm = async () => {
  if (!productFormRef.value) return
  
  productFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const uniqueImageUrls = realImageUrls.value.reduce((acc, cur) => {
          const isExist = acc.some(item => item.url === cur.url);
          if (!isExist) acc.push(cur);
          return acc;
        }, []);
        const submitData = {
          ...productForm,
          imageList: uniqueImageUrls
        };
        let res
        if (isEdit.value) {
          res = await editProduct(submitData)
        } else {
          delete submitData.id
          res = await addProduct(submitData)
        }
        if (res.code === 0) {
          ElMessage.success(isEdit.value ? '编辑商品成功' : '新增商品成功')
          dialogVisible.value = false
          getProductList()
        } else {
          ElMessage.error(res.msg || (isEdit.value ? '编辑商品失败' : '新增商品失败'))
        }
      } catch (error) {
        console.error('提交商品失败：', error)
        ElMessage.error('提交商品失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 状态切换
const handleStatusChange = async (row) => {
  loading.value = true
  try {
    const res = await updateProductStatus({
      id: row.id,
      status: row.status
    })
    if (res.code === 0) {
      ElMessage.success(`商品已${row.status === '1' ? '上架' : '下架'}`)
    } else {
      ElMessage.error(res.msg || '修改商品状态失败')
      row.status = row.status === '1' ? '0' : '1'
    }
  } catch (error) {
    console.error('修改商品状态失败：', error)
    ElMessage.error('修改商品状态失败')
    row.status = row.status === '1' ? '0' : '1'
  } finally {
    loading.value = false
  }
}

// 删除商品
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该商品吗？删除后不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    loading.value = true
    const res = await deleteProduct(id)
    if (res.code === 0) {
      ElMessage.success('删除商品成功')
      getProductList()
    } else {
      ElMessage.error(res.msg || '删除商品失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败：', error)
      ElMessage.error('删除商品失败')
    }
  } finally {
    loading.value = false
  }
}

// 页面初始化
onMounted(async () => {
  await loadCategoryList()
  await getProductList()
})
</script>

<style scoped>
.product-manage {
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