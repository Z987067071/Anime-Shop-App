<template>
  <div class="order-manage">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/admin/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="operation-bar" style="margin-top: 20px; display: flex; flex-wrap: wrap; gap: 10px">
      <el-input
        v-model="searchForm.orderNo"
        placeholder="搜索订单编号"
        style="width: 200px"
        @keyup.enter="getOrderList"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-input
        v-model="searchForm.consignee"
        placeholder="搜索收货人/购票人"
        style="width: 200px"
        @keyup.enter="getOrderList"
      >
        <template #prefix><el-icon><User /></el-icon></template>
      </el-input>
      <el-input
        v-model="searchForm.consigneePhone"
        placeholder="搜索收货人手机号"
        style="width: 200px"
        @keyup.enter="getOrderList"
      >
        <template #prefix><el-icon><Phone /></el-icon></template>
      </el-input>

      <el-select
        v-model="searchForm.orderType"
        placeholder="全部订单类型"
        style="width: 180px"
        @change="getOrderList"
      >
        <el-option label="全部订单" value="" />
        <el-option label="普通商品订单" :value="0" />
        <el-option label="漫展票务订单" :value="1" />
      </el-select>

      <el-select
        v-model="searchForm.verifyStatus"
        placeholder="核销状态"
        style="width: 180px"
        @change="getOrderList"
        v-if="searchForm.orderType === 1"
      >
        <el-option label="全部状态" value="" />
        <el-option label="未核销" :value="0" />
        <el-option label="已核销" :value="1" />
        <el-option label="已退票" :value="2" />
      </el-select>

      <el-select
        v-model="searchForm.orderStatus"
        placeholder="全部订单状态"
        style="width: 180px"
        @change="getOrderList"
      >
        <el-option label="全部状态" value="" />
        <el-option label="待付款" :value="0" />
        <el-option label="待发货" :value="1" />
        <el-option label="待收货" :value="2" />
        <el-option label="已完成" :value="3" />
        <el-option label="已取消" :value="4" />
        <el-option label="售后中" :value="5" />
      </el-select>

      <el-select
        v-model="searchForm.payStatus"
        placeholder="全部支付状态"
        style="width: 180px"
        @change="getOrderList"
      >
        <el-option label="全部状态" value="" />
        <el-option label="未支付" :value="0" />
        <el-option label="已支付" :value="1" />
        <el-option label="退款中" :value="2" />
        <el-option label="已退款" :value="3" />
      </el-select>

      <el-button type="primary" @click="getOrderList">查询</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-table
      :data="orderList"
      border
      stripe
      style="width: 100%; margin-top: 20px"
      v-loading="loading"
      :default-sort="{ prop: 'createTime', order: 'descending' }"
    >
      <el-table-column prop="orderNo" label="订单编号" min-width="180" />
      <el-table-column label="订单类型" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.productType === 1 ? 'success' : 'primary'">
            {{ scope.row.productType === 1 ? '漫展票务' : '普通商品' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="consignee" label="收货人/购票人" width="120" />
      <el-table-column prop="consigneePhone" label="联系电话" width="120">
        <template #default="scope">
          {{ scope.row.consigneePhone ? scope.row.consigneePhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '无' }}
        </template>
      </el-table-column>
      <el-table-column label="核销码" width="120" v-show="true">
        <template #default="scope">
          <span v-if="scope.row.orderType === 1">
            {{ scope.row.ticketRelations?.[0]?.verifyCode || '无' }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <<el-table-column label="核销状态" width="120" v-show="true">
        <template #default="scope">
          <span v-if="scope.row.orderType === 1">
            <el-tag :type="getVerifyStatusTagType(scope.row.ticketRelations?.[0]?.verifyStatus)">
              {{ getVerifyStatusText(scope.row.ticketRelations?.[0]?.verifyStatus) }}
            </el-tag>
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="订单总金额(元)" width="120">
        <template #default="scope">
          <span style="color: #e54847; font-weight: 500">¥{{ Number(scope.row.totalAmount).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="payAmount" label="实付金额(元)" width="120">
        <template #default="scope">
          ¥{{ Number(scope.row.payAmount).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="订单状态" width="140">
        <template #default="scope">
          <el-tag :type="getOrderStatusTagType(scope.row.orderStatus)">{{ getOrderStatusText(scope.row.orderStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="支付状态" width="120">
        <template #default="scope">
          <el-tag :type="getPayStatusTagType(scope.row.payStatus)">
            {{ getPayStatusText(scope.row.payStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="支付方式" width="120">
        <template #default="scope">
          {{ getPayTypeText(scope.row.payType) }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" width="180" />
      <el-table-column prop="payTime" label="支付时间" width="180">
        <template #default="scope">
          {{ scope.row.payTime || '未支付' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="260" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewOrderDetail(scope.row)">查看详情</el-button>
          
          <!-- 普通订单操作 -->
          <template v-if="scope.row.orderType === 0 || scope.row.orderType === undefined">
            <el-button
              type="success"
              size="small"
              v-if="scope.row.orderStatus === 1"
              @click="showDeliveryDialog(scope.row)"
            >
              确认发货
            </el-button>
            <el-button
              type="warning"
              size="small"
              v-if="[0, 1].includes(scope.row.orderStatus)"
              @click="cancelSingleOrder(scope.row.id)"
            >
              取消订单
            </el-button>
            <el-button
              type="danger"
              size="small"
              v-if="scope.row.orderStatus === 3"
              @click="deleteOrder(scope.row.id)"
            >
              删除订单
            </el-button>
          </template>
          
          <!-- 票务订单操作 -->
          <template v-else-if="scope.row.orderType === 1">
            <el-button
              type="success"
              size="small"
              v-if="scope.row.ticketRelations?.[0]?.verifyStatus === 0 && scope.row.orderStatus === 1"
              @click="showVerifyDialog(scope.row)"
            >
              票务核销
            </el-button>
            <el-button
              type="warning"
              size="small"
              v-if="[0, 1].includes(scope.row.orderStatus)"
              @click="cancelSingleOrder(scope.row.id)"
            >
              取消订单/退票
            </el-button>
            <el-button
              type="danger"
              size="small"
              v-if="scope.row.orderStatus === 3"
              @click="deleteOrder(scope.row.id)"
            >
              删除订单
            </el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination" style="margin-top: 20px; text-align: right">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getOrderList"
        @current-change="getOrderList"
      />
    </div>

    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="900px"
      destroy-on-close
    >
      <div v-if="currentOrder" class="order-detail">
        <!-- 订单主信息 -->
        <div class="detail-header" style="padding-bottom: 15px; border-bottom: 1px solid #ebeef5">
          <div class="detail-row" style="margin-bottom: 10px">
            <span class="label">订单编号：</span>
            <span class="value">{{ currentOrder.order.orderNo }}</span>
            <span class="label" style="margin-left: 20px">订单ID：</span>
            <span class="value">{{ currentOrder.order.id }}</span>
            <span class="label" style="margin-left: 20px">下单用户ID：</span>
            <span class="value">{{ currentOrder.order.userId }}</span>
            <span class="label" style="margin-left: 20px">订单类型：</span>
            <span class="value">
              <el-tag :type="currentOrder.order.orderType === 1 ? 'primary' : 'info'">
                {{ currentOrder.order.orderType === 1 ? '漫展票务订单' : '普通商品订单' }}
              </el-tag>
            </span>
          </div>
          <div class="detail-row" style="margin-bottom: 10px">
            <span class="label">收货人/购票人：</span>
            <span class="value">{{ currentOrder.order.consignee }}</span>
            <span class="label" style="margin-left: 20px">联系电话：</span>
            <span class="value">{{ currentOrder.order.consigneePhone ? currentOrder.order.consigneePhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '无' }}</span>
          </div>
          <div class="detail-row" style="margin-bottom: 10px">
            <span class="label">订单状态：</span>
            <span class="value"><el-tag :type="getOrderStatusTagType(Number(currentOrder.order.orderStatus))">{{ getOrderStatusText(Number(currentOrder.order.orderStatus)) }}</el-tag></span>
            <span class="label" style="margin-left: 20px">支付状态：</span>
            <span class="value"><el-tag :type="getPayStatusTagType(Number(currentOrder.order.payStatus))">{{ getPayStatusText(Number(currentOrder.order.payStatus)) }}</el-tag></span>
            <span class="label" style="margin-left: 20px">支付方式：</span>
            <span class="value">{{ getPayTypeText(Number(currentOrder.order.payType)) }}</span>
          </div>
          <div class="detail-row" style="margin-bottom: 10px" v-if="currentOrder.order.orderType === 1">
            <span class="label">核销状态：</span>
            <span class="value">
              <el-tag :type="getVerifyStatusTagType(currentOrder.ticketRelations?.[0]?.verifyStatus)">
                {{ getVerifyStatusText(currentOrder.ticketRelations?.[0]?.verifyStatus) }}
              </el-tag>
            </span>
            <span class="label" style="margin-left: 20px">核销码：</span>
            <span class="value">{{ currentOrder.ticketRelations?.[0]?.verifyCode || '无' }}</span>
            <span class="label" style="margin-left: 20px">核销员：</span>
            <span class="value">{{ currentOrder.ticketRelations?.[0]?.verifyStaff || '无' }}</span>
          </div>
          <div class="detail-row" style="margin-bottom: 10px">
            <span class="label">下单时间：</span>
            <span class="value">{{ currentOrder.order.createTime }}</span>
            <span class="label" style="margin-left: 20px">支付时间：</span>
            <span class="value">{{ currentOrder.order.payTime || '未支付' }}</span>
            <span class="label" style="margin-left: 20px">更新时间：</span>
            <span class="value">{{ currentOrder.order.updateTime }}</span>
            <span class="label" style="margin-left: 20px" v-if="currentOrder.order.orderType === 1">核销时间：</span>
            <span class="value" v-if="currentOrder.order.orderType === 1">{{ currentOrder.ticketRelations?.[0]?.verifyTime || '未核销' }}</span>
          </div>
          <div class="detail-row" style="margin-bottom: 10px">
            <span class="label" v-if="currentOrder.order.orderType === 0">收货地址：</span>
            <span class="label" v-if="currentOrder.order.orderType === 1">购票人地址：</span>
            <span class="value">{{ currentOrder.order.consigneeAddress || '未填写' }}</span>
          </div>
          <div class="detail-row" style="margin-bottom: 10px" v-if="currentOrder.order.orderType === 0">
            <span class="label">物流信息：</span>
            <span class="value">
              {{ currentOrder.order.deliveryCompany || '未发货' }} 
              {{ currentOrder.order.deliverySn ? '(' + currentOrder.order.deliverySn + ')' : '' }}
            </span>
            <span class="label" style="margin-left: 20px">订单备注：</span>
            <span class="value">{{ currentOrder.order.remark || '无' }}</span>
          </div>
          <div class="detail-row" style="margin-bottom: 10px" v-if="currentOrder.order.orderType === 1">
            <span class="label">购票人实名：</span>
            <span class="value">{{ currentOrder.ticketRelations?.[0]?.realName || '未填写' }}</span>
            <span class="label" style="margin-left: 20px">身份证号：</span>
            <span class="value">{{ currentOrder.ticketRelations?.[0]?.idCard ? currentOrder.ticketRelations[0].idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2') : '未填写' }}</span>
          </div>
          <div class="detail-row">
            <span class="label" v-if="currentOrder.order.orderType === 0">时间记录：</span>
            <span class="label" v-if="currentOrder.order.orderType === 1">票务记录：</span>
            <span class="value" v-if="currentOrder.order.orderType === 0">发货时间：{{ currentOrder.order.deliveryTime || '未发货' }}</span>
            <span class="value" v-if="currentOrder.order.orderType === 0" style="margin-left: 20px">收货时间：{{ currentOrder.order.receiveTime || '未收货' }}</span>
            <span class="value" style="margin-left: 20px">取消时间：{{ currentOrder.order.cancelTime || '未取消' }}</span>
          </div>
        </div>

        <!-- 金额信息 -->
        <div class="detail-price-summary" style="margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 4px">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px">
            <span>订单总金额：</span>
            <span>¥{{ Number(currentOrder.order.totalAmount).toFixed(2) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px">
            <span>运费：</span>
            <span>¥{{ Number(currentOrder.order.freightAmount).toFixed(2) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px">
            <span>优惠金额：</span>
            <span style="color: #f56c6c">-¥{{ Number(currentOrder.order.discountAmount).toFixed(2) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold">
            <span>实付金额：</span>
            <span style="color: #e54847">¥{{ Number(currentOrder.order.payAmount).toFixed(2) }}</span>
          </div>
        </div>

        <!-- 商品/票务明细 -->
        <div class="detail-goods" style="margin-top: 20px">
          <h4 style="margin-bottom: 10px" v-if="currentOrder.order.orderType === 0">商品明细</h4>
          <h4 style="margin-bottom: 10px" v-if="currentOrder.order.orderType === 1">票务明细</h4>
          <el-table :data="currentOrder.orderItems || []" border size="small">
            <el-table-column prop="id" label="订单项ID" width="100" />
            <el-table-column prop="productName" label="商品名称/票种名称" min-width="200" />
            <el-table-column label="商品/票务图片" width="100">
              <template #default="scope">
                <el-image 
                  :src="scope.row.productImg" 
                  fit="cover" 
                  style="width: 80px; height: 80px"
                  :preview-src-list="[scope.row.productImg]"
                  preview-teleported
                  :z-index="9999"
                />
              </template>
            </el-table-column>
            <el-table-column prop="productPrice" label="单价(元)" width="120">
              <template #default="scope">¥{{ Number(scope.row.productPrice).toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="100" />
            <el-table-column prop="totalPrice" label="小计金额(元)" width="120">
              <template #default="scope">¥{{ Number(scope.row.totalPrice).toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180" />
          </el-table>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="deliveryDialogVisible"
      title="确认发货"
      width="400px"
    >
      <el-form :model="deliveryForm" label-width="80px">
        <el-form-item label="快递公司">
          <el-input v-model="deliveryForm.deliveryCompany" placeholder="请输入快递公司（如：顺丰）" />
        </el-form-item>
        <el-form-item label="物流单号">
          <el-input v-model="deliveryForm.deliverySn" placeholder="请输入物流单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deliveryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDelivery">确认发货</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="verifyDialogVisible"
      title="漫展票务核销"
      width="400px"
    >
      <el-form :model="verifyForm" label-width="80px" :rules="verifyRules" ref="verifyFormRef">
        <el-form-item label="核销码" prop="verifyCode">
          <el-input v-model="verifyForm.verifyCode" disabled placeholder="自动填充核销码" />
        </el-form-item>
        <el-form-item label="核销员" prop="verifyStaff">
          <el-input v-model="verifyForm.verifyStaff" placeholder="请输入核销员姓名/账号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="verifyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmVerify">确认核销</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, User, Phone } from '@element-plus/icons-vue'
import { 
  getOrderList as getOrderListApi, 
  getOrderDetail, 
  updateOrderStatus, 
  deleteOrder as deleteOrderApi 
} from '@/api/order'
import { verifyTicket } from '@/api/ticket'

const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchForm = reactive({
  orderNo: '',
  consignee: '',
  consigneePhone: '',
  orderStatus: '',
  payStatus: '',
  orderType: '', // 订单类型 0=普通 1=票务
  verifyStatus: ''
})
// 弹窗相关
const detailDialogVisible = ref(false)
const deliveryDialogVisible = ref(false)
const verifyDialogVisible = ref(false)
const currentOrder = ref(null) 
const currentDeliveryOrderId = ref('')
const currentVerifyOrderId = ref('')
// 表单相关
const deliveryForm = reactive({
  deliveryCompany: '',
  deliverySn: ''
})
const verifyForm = reactive({
  verifyCode: '',
  verifyStaff: ''
})
const verifyFormRef = ref(null)
const verifyRules = {
  verifyStaff: [{ required: true, message: '请输入核销员姓名', trigger: 'blur' }],
  verifyCode: [{ required: true, message: '核销码不能为空', trigger: 'blur' }]
}
// 订单列表
const orderList = ref([])

// 初始化加载列表
onMounted(() => {
  getOrderList()
})

const getOrderList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      orderNo: searchForm.orderNo.trim(),
      consignee: searchForm.consignee.trim(),
      consigneePhone: searchForm.consigneePhone.trim(),
      orderStatus: searchForm.orderStatus ? Number(searchForm.orderStatus) : undefined,
      payStatus: searchForm.payStatus ? Number(searchForm.payStatus) : undefined,
      orderType: searchForm.orderType ? Number(searchForm.orderType) : undefined,
      verifyStatus: searchForm.verifyStatus ? Number(searchForm.verifyStatus) : undefined
    }

    const res = await getOrderListApi(params)
    if (res.code !== 0) {
      ElMessage.error(res.msg || '获取订单列表失败')
      return
    }

    total.value = Number(res.data.total) || 0
    orderList.value = (res.data.records || []).map(item => ({
      ...item,
      id: String(item.id),
      orderType: Number(item.orderType) || 0,
      orderStatus: Number(item.orderStatus),
      payStatus: Number(item.payStatus),
      payType: Number(item.payType) || 0,
      totalAmount: Number(item.totalAmount) || 0,
      payAmount: Number(item.payAmount) || 0,
      freightAmount: Number(item.freightAmount) || 0,
      discountAmount: Number(item.discountAmount) || 0,
      ticketRelations: item.ticketRelations || []
    }))
  } catch (error) {
    console.error('获取订单列表失败：', error)
    ElMessage.error('网络错误，获取订单列表失败')
  } finally {
    loading.value = false
  }
}

const getOrderStatusText = (status) => {
  const statusMap = {
    0: '待付款',
    1: '待发货/待核销',
    2: '待收货',
    3: '已完成',
    4: '已取消',
    5: '售后中'
  }
  return statusMap[status] || '未知状态'
}

const getOrderStatusTagType = (status) => {
  const typeMap = {
    0: 'warning',
    1: 'primary',
    2: 'info',
    3: 'success',
    4: 'danger',
    5: 'warning'
  }
  return typeMap[status] || 'default'
}

const getPayStatusText = (status) => {
  const statusMap = {
    0: '未支付',
    1: '已支付',
    2: '退款中',
    3: '已退款'
  }
  return statusMap[status] || '未知状态'
}

const getPayStatusTagType = (status) => {
  const typeMap = {
    0: 'warning',
    1: 'success',
    2: 'info',
    3: 'danger'
  }
  return typeMap[status] || 'default'
}

const getPayTypeText = (type) => {
  const typeMap = {
    0: '未支付',
    1: '微信',
    2: '支付宝',
    3: '银行卡'
  }
  return typeMap[type] || '未知方式'
}

const getVerifyStatusText = (status) => {
  const statusMap = {
    0: '未核销',
    1: '已核销',
    2: '已退票'
  }
  return statusMap[status] || '未知状态'
}

const getVerifyStatusTagType = (status) => {
  const typeMap = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return typeMap[status] || 'default'
}

const viewOrderDetail = async (row) => {
  loading.value = true
  try {
    const res = await getOrderDetail(row.id)
    if (res.code !== 0) {
      ElMessage.error(res.msg || '获取订单详情失败')
      return
    }
    currentOrder.value = {
      order: {
        ...res.data.order,
        id: String(res.data.order.id),
        userId: String(res.data.order.userId),
        orderType: Number(res.data.order.orderType) || 0,
        orderStatus: Number(res.data.order.orderStatus),
        payStatus: Number(res.data.order.payStatus),
        payType: Number(res.data.order.payType),
        totalAmount: Number(res.data.order.totalAmount),
        payAmount: Number(res.data.order.payAmount),
        freightAmount: Number(res.data.order.freightAmount),
        discountAmount: Number(res.data.order.discountAmount),
        isDelete: Number(res.data.order.isDelete)
      },
      orderItems: (res.data.orderItems || []).map(item => ({
        ...item,
        id: String(item.id),
        orderId: String(item.orderId),
        productId: String(item.productId),
        productPrice: Number(item.productPrice),
        quantity: Number(item.quantity),
        totalPrice: Number(item.totalPrice),
        isDelete: Number(item.isDelete)
      })),
      ticketRelations: (res.data.ticketRelations || []).map(item => ({
        ...item,
        id: String(item.id),
        orderId: String(item.orderId),
        userId: String(item.userId),
        verifyStatus: Number(item.verifyStatus) || 0
      }))
    }
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取订单详情失败：', error)
    ElMessage.error('网络错误，获取订单详情失败')
  } finally {
    loading.value = false
  }
}

const showDeliveryDialog = (row) => {
  currentDeliveryOrderId.value = row.id
  deliveryForm.deliveryCompany = row.deliveryCompany || ''
  deliveryForm.deliverySn = row.deliverySn || ''
  deliveryDialogVisible.value = true
}

const confirmDelivery = async () => {
  if (!deliveryForm.deliveryCompany.trim()) {
    ElMessage.warning('请输入快递公司')
    return
  }
  if (!deliveryForm.deliverySn.trim()) {
    ElMessage.warning('请输入物流单号')
    return
  }
  loading.value = true
  try {
    const res = await updateOrderStatus({
      id: currentDeliveryOrderId.value,
      orderStatus: 2,
      deliveryCompany: deliveryForm.deliveryCompany.trim(),
      deliverySn: deliveryForm.deliverySn.trim()
    })
    if (res.code !== 0) {
      ElMessage.error(res.msg || '确认发货失败')
      return
    }
    ElMessage.success('确认发货成功')
    deliveryDialogVisible.value = false
    getOrderList()
  } catch (error) {
    console.error('确认发货失败：', error)
    ElMessage.error('确认发货失败，请重试')
  } finally {
    loading.value = false
  }
}

const showVerifyDialog = (row) => {
  currentVerifyOrderId.value = row.id
  verifyForm.verifyCode = row.ticketRelations?.[0]?.verifyCode || ''
  verifyForm.verifyStaff = ''
  verifyDialogVisible.value = true
}

const confirmVerify = async () => {
  try {
    await verifyFormRef.value.validate()
    
    loading.value = true
    const res = await verifyTicket({
      verifyCode: verifyForm.verifyCode,
      verifyStaff: verifyForm.verifyStaff.trim(),
      verifyIp: '127.0.0.1'
    })
    
    if (res.code !== 0) {
      ElMessage.error(res.msg || '核销失败')
      return
    }
    
    ElMessage.success('票务核销成功')
    verifyDialogVisible.value = false
    await updateOrderStatus({
      id: currentVerifyOrderId.value,
      orderStatus: 3
    })
    getOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('核销失败：', error)
      ElMessage.error('核销失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

const cancelSingleOrder = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消该订单吗？',
      '提示',
      { type: 'warning' }
    )
    loading.value = true
    const res = await updateOrderStatus({
      id,
      orderStatus: 4
    })
    if (res.code !== 0) {
      ElMessage.error(res.msg || '取消订单失败')
      return
    }
    ElMessage.success('订单已取消')
    getOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败：', error)
      ElMessage.error('取消订单失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

const deleteOrder = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该订单吗？删除后数据将无法恢复',
      '提示',
      { type: 'danger' }
    )
    loading.value = true
    const res = await deleteOrderApi(id)
    if (res.code !== 0) {
      ElMessage.error(res.msg || '删除订单失败')
      return
    }
    ElMessage.success('订单删除成功')
    getOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除订单失败：', error)
      ElMessage.error('删除订单失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  Object.assign(searchForm, {
    orderNo: '',
    consignee: '',
    consigneePhone: '',
    orderStatus: '',
    payStatus: '',
    orderType: '',
    verifyStatus: ''
  })
  getOrderList()
}
</script>

<style scoped>
.order-manage {
  padding: 20px;
  background: #fff;
  height: 100%;
}

.operation-bar {
  display: flex;
  align-items: center;
}

.order-detail .label {
  color: #666;
  font-weight: 500;
  margin-right: 5px;
}

.order-detail .value {
  color: #333;
}

.order-detail .detail-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 5px;
}

.detail-price-summary {
  margin: 15px 0;
}
</style>