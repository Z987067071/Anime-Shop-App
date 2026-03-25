<template>
  <div class="account-manage">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/admin/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>账户</el-breadcrumb-item>
      <el-breadcrumb-item>账户管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 筛选栏 -->
    <div class="operation-bar" style="margin-top: 20px">
      <el-input
        v-model="searchForm.username"
        placeholder="账号搜索"
        style="width: 200px; margin-right: 10px"
        @keyup.enter="getAccountList"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-input
        v-model="searchForm.tel"
        placeholder="手机号搜索"
        style="width: 200px; margin-right: 10px"
        @keyup.enter="getAccountList"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-input
        v-model="searchForm.idCard"
        placeholder="身份证号搜索"
        style="width: 200px; margin-right: 10px"
        @keyup.enter="getAccountList"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>

      <!-- 角色筛选 -->
      <el-select
        v-model="roleFilter"
        placeholder="全部角色"
        style="width: 150px; margin-right: 10px"
        @change="getAccountList"
      >
        <el-option label="全部角色" value="" />
        <el-option label="超级管理员" value="admin" />
        <el-option label="经理" value="manager" />
        <el-option label="组长" value="leader" />
        <el-option label="组员" value="member" />
        <el-option label="用户" value="consumer" />
      </el-select>

      <el-button type="primary" @click="openAddDialog">新增账户</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      :data="accountList"
      border
      stripe
      style="width: 100%; margin-top: 20px"
      v-loading="loading"
      :default-sort="{ prop: 'createTime', order: 'descending' }"
    >
      <!-- 按要求的字段列 -->
      <el-table-column prop="username" fixed="left" label="账号" min-width="120" />
      <el-table-column label="身份(Role)" fixed="left" min-width="120">
        <template #default="scope">
          <el-tag :type="getRoleTagType(scope.row.role)">{{ getRoleText(scope.row.role) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" width="200">
        <template #default="scope">
          {{ scope.row.email || '未绑定' }}
        </template>
      </el-table-column>
      <el-table-column prop="nickname" label="用户名" width="120" />
      <el-table-column prop="tel" label="手机号" width="120" />
      <el-table-column label="身份证号" width="180">
        <template #default="scope">
          {{ scope.row.idCard ? `${scope.row.idCard.slice(0,6)}********${scope.row.idCard.slice(-4)}` : '未绑定' }}
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column prop="updatedAt" label="修改时间" width="180">
        <template #default="scope">
          {{ scope.row.updatedAt || '未修改' }}
        </template>
      </el-table-column>
      <!-- 账户状态 -->
      <el-table-column label="账户状态" fixed="right" min-width="120">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @click.prevent="handleStatusChange(scope.row)"
            @change="() => {}"
            :disabled="scope.row.role === 'admin'"
          />
          <span style="margin-left: 8px">
            {{ getStatusText(scope.row.status) }}
          </span>
        </template>
      </el-table-column>
      <!-- 操作列 -->
      <el-table-column fixed="right" label="操作" min-width="250">
        <template #default="scope">
          <el-button type="primary" size="small" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button
            type="warning"
            size="small"
            @click="openResetPwdDialog(scope.row)"
            :disabled="scope.row.role === 'admin'"
          >
            重置密码
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="deleteAccount(scope.row)"
            :disabled="scope.row.role === 'admin'"
          >
            删除
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
        @size-change="getAccountList"
        @current-change="getAccountList"
      />
    </div>

    <!-- 引入抽离的弹窗组件 -->
    <AccountForm
      v-model:visible="formVisible"
      :is-edit="isEdit"
      :init-data="editData"
      :operator-role="user.role"
      @close="formVisible = false"
      @submit="handleFormSubmit"
    />

    <ResetPasswordDialog
      v-model="resetPwdVisible"
      :user-id="currentResetUserId"
      :operator-role="user.role"
      :reset-password-api="resetPasswordApi"
      @success="handleResetSuccess"
      @fail="handleResetFail"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import AccountForm from '@/admin/components/AccountForm.vue'
import ResetPasswordDialog from '@/admin/components/ResetPasswordDialog.vue'
import request from '@/utils/request'
import { useUserStore } from '@/stores/user'
import { 
  getUsers, 
  addUser, 
  editUser, 
  resetPassword, 
  deleteUser 
} from '@/api/account'

const user = useUserStore()
const loading = ref(false)

const searchForm = reactive({
  username: '',
  tel: '',
  idCard: ''
})
const roleFilter = ref('')

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const formVisible = ref(false)
const isEdit = ref(false)

const editData = ref({})
const accountList = ref([])

const resetPwdVisible = ref(false)
const currentResetUserId = ref('')

onMounted(() => {
  getAccountList()
})


const getAccountList = async () => {
  loading.value = true
  
  try{

    const params = {
      page: currentPage.value,
      size: pageSize.value,
      role: roleFilter.value,
      ...searchForm
    }
    

    Object.entries(searchForm).forEach(([key, value]) => {
      const trimmedValue = value.trim()
      if (trimmedValue) {
        params[key] = trimmedValue
      }
    })

    const res = await getUsers(params)

    const { code, msg, data } = res
    if (code !== 0) {
      ElMessage.error(msg || '获取账号列表失败')
      return
    }

    total.value = Number(data.total) || 0; 
    accountList.value = (data.list || []).map(item => ({
      ...item,
      id: String(item.id),
      status: Number(item.status)
    }))
  } catch(error) {
    console.error('获取账号列表出错：', error)
    ElMessage.error('网络错误，获取账号列表失败')
  } finally {
    loading.value = false
  }
}

// 角色文本映射
const getRoleText = (role) => {
  const roleMap = {
    admin: '超级管理员',
    manager: '经理',
    leader: '组长',
    member: '组员',
    consumer: '普通用户'
  }
  return roleMap[role] || '未知角色'
}

// 角色标签样式映射
const getRoleTagType = (role) => {
  const typeMap = {
    admin: 'danger',
    manager: 'warning', 
    leader: 'success', 
    member: 'primary', 
    consumer: 'info'
  }
  return typeMap[role] || 'default'
}

const getStatusText = (status) => {
  const statusNum = Number(status)
  if (statusNum !== 0 && statusNum !== 1) {
    return '禁用';
  }
  return statusNum === 1 ? '启用' : '禁用';
};

const handleStatusChange = async (row) => {
  const originalStatus = row.status
  const targetStatus = originalStatus === 1 ? 1 : 0
  const statusText = targetStatus === 1 ? '启用' : '禁用'

  try {
    await ElMessageBox.confirm(
      `确定要将【${row.username}】账户${statusText}吗？`,
      '提示',
      { type: 'warning' }
    )

    loading.value = true
    const res = await editUser({
      id: row.id,
      status: targetStatus,
      operatorRole: user.role
    })

    if (res.code !== 0) {
      ElMessage.error(res.msg || '状态修改失败')
      row.status = originalStatus
      return
    }

    row.status = targetStatus
    ElMessage.success(`账户已${statusText}`)
    getAccountList()
  } catch (error) {
    row.status = originalStatus
    getAccountList()
    if (error !== 'cancel') {
      console.error('修改状态失败：', error)
      ElMessage.error('状态修改失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

// 打开新增弹窗
const openAddDialog = () => {
  isEdit.value = false
  editData.value = {}
  formVisible.value = true
}

// 打开编辑弹窗
const openEditDialog = (row) => {
  const roleLevel = { admin:0, manager:1, leader:2, member:3, consumer:4 }

  const operatorLevel = roleLevel[user.role] || 4
  const targetLevel = roleLevel[row.role] || 4

  const isSelf = row.username === user.username
  const canEdit = user.role === 'admin' || isSelf || (operatorLevel < targetLevel)
  
  if (!canEdit) {
    ElMessage.warning('权限不足，无法编辑该账户')
    return
  }

  isEdit.value = true
  editData.value = { 
    ...row, 
    id: String(row.id)
  }
  formVisible.value = true
}

// 处理表单提交（新增/编辑）
const handleFormSubmit = async (submitData) => {
  loading.value = true
  try {
    if (!isEdit.value) {
      delete submitData.status;
    }
    if (isEdit.value){
      delete submitData.username
    }
    let res
    if (isEdit.value) {
      res = await editUser(submitData)
    } else {
      res = await addUser(submitData)
    }

    if (res.code !== 0) {
      ElMessage.error(res.msg || (isEdit.value ? '编辑账户失败' : '新增账户失败'))
      return
    }

    ElMessage.success(isEdit.value ? '编辑账户成功' : '新增账户成功')
    formVisible.value = false
    getAccountList()
  } catch (error) {
    console.error('表单提交失败：', error)
    ElMessage.error('操作失败，请重试')
  } finally {
    loading.value = false
  }
}

// 重置密码弹窗
const openResetPwdDialog = (row) => {
  currentResetUserId.value = row.id
  resetPwdVisible.value = true
}

// 重置密码
const resetPasswordApi = async (params) => {
  try {
    // 调用后端接口
    const res = await resetPassword(params)
    return res
  } catch (error) {
    return {
      code: 500,
      msg: error.msg || '接口请求失败'
    }
  }
}

const handleResetSuccess = () => {
  ElMessage.success('密码重置成功')
  getAccountList()
}

const handleResetFail = (error) => {
  ElMessage.success('密码重置失败'+ error)
}

// 删除账户（调用真实接口）
const deleteAccount = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该账户吗？删除后数据将无法恢复',
      '提示',
      { type: 'danger' }
    )

    loading.value = true
    const res = await deleteUser(row.id, user.role)

    if (res.code !== 0) {
      ElMessage.error(res.msg || '账户删除失败')
      return
    }

    ElMessage.success('账户删除成功')
    getAccountList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除账户失败：', error)
      ElMessage.error('账户删除失败，请重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.account-manage {
  padding: 20px;
  background: #fff;
  height: 100%;
}

.operation-bar {
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>