<template>
  <div class="my-comic-con-order">
    <van-nav-bar title="我的票务订单" fixed left-arrow @click-left="router.back()" />
    <van-tabs v-model:active="activeTab" class="order-tabs" sticky @change="handleTabChange">
      <van-tab title="全部" name="all" />
      <van-tab title="待支付" name="unpaid" />
      <van-tab title="已支付" name="paid" />
      <van-tab title="已核销" name="verified" />
      <van-tab title="已退票" name="refunded" />
    </van-tabs>
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多订单了"
      @load="onLoad"
      class="order-list"
    >
      <van-empty
        v-if="orderList.length === 0 && !loading"
        description="暂无票务订单"
        class="empty-order"
      />
      <div v-for="order in filteredOrderList" :key="order.orderId" class="order-item">
        <div class="order-header">
          <span class="order-no">订单号：{{ order.orderNo }}</span>
          <van-tag :type="getStatusTagType(order.status)">{{ getStatusText(order.status) }}</van-tag>
        </div>
        <div class="order-detail">
          <img :src="order.comicConBanner" alt="漫展封面" class="order-img" />
          <div class="order-info">
            <h4 class="comic-con-name">{{ order.comicConName }}</h4>
            <p class="ticket-name">{{ order.ticketType }} × {{ order.ticketCount || 1 }}张</p>
            <p class="order-time">下单时间：{{ formatTime(order.createTime) }}</p>
          </div>
        </div>

        <div v-if="['paid', 'verified'].includes(order.status)">
          <div 
            class="ticket-item" 
            v-for="(ticket, index) in order.ticketVerifyList || [{verifyCode: order.verifyCode, verifyQrCodeUrl: order.verifyQrCodeUrl}]" 
            :key="index"
          >
            <div class="ticket-title">第{{ index + 1 }}张票</div>
            
            <div class="buyer-info" v-if="ticket.buyerName || ticket.buyerIdCard">
              <div class="buyer-item">
                <span class="label">购票人：</span>
                <span class="value">{{ ticket.buyerName || '未填写' }}</span>
              </div>
              <div class="buyer-item">
                <span class="label">身份证号：</span>
                <span class="value">{{ ticket.buyerIdCard || '未填写' }}</span>
              </div>
            </div>
            
            <div class="verify-code">
              <h5>核销码</h5>
              <div class="code-box">
                <span class="code-text">{{ ticket.verifyCode }}</span>
                <van-button size="small" type="primary" @click="copyCode(ticket.verifyCode)">
                  复制
                </van-button>
              </div>
            </div>
            <!-- 二维码 -->
            <div class="code-qr" v-if="order.status === 'paid'">
              <img :src="ticket.verifyQrCodeUrl || order.verifyQrCodeUrl" alt="核销二维码" />
              <p class="qr-tip">微信扫码核销第{{ index + 1 }}张票</p>
            </div>
          </div>
        </div>

        <!-- 订单操作按钮 -->
        <div class="order-actions">
          <van-button
            v-if="order.status === 'unpaid'"
            size="small"
            type="primary"
            @click="toPay(order.orderId)"
          >
            去支付
          </van-button>
          <van-button
            v-if="order.status === 'unpaid'"
            size="small"
            type="default"
            @click="cancelOrder(order.orderId)"
          >
            取消订单
          </van-button>
          <van-button
            v-if="order.status === 'paid'"
            size="small"
            type="warning"
            @click="showToast('未来开发敬请期待')"
            >
            <!-- @click="refundOrder(order.orderId)"  -->
            申请退票
          </van-button>
          <van-button
            v-if="['verified', 'refunded'].includes(order.status)"
            size="small"
            type="default"
            @click="viewDetail(order.orderId)"
          >
            查看详情
          </van-button>
        </div>
      </div>
    </van-list>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import { 
  getUserComicConTickets, 
  cancelComicConOrder,
  refundComicConOrder,
  payComicConOrder
} from '@/api/mobile/comic-con';

const router = useRouter();
const loading = ref(false);
const finished = ref(false);
const activeTab = ref('all');
const orderList = ref([]);

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  return timeStr.replace('T', ' ').substring(0, 19);
};

const convertStatus = (statusCode) => {
  const statusMap = {
    0: 'unpaid',    // 未支付
    1: 'paid',      // 已支付（待核销）
    3: 'verified',  // 已核销
    4: 'refunded'   // 已退票/已取消
  };
  return statusMap[statusCode] || 'unknown';
};

const filteredOrderList = computed(() => {
  return orderList.value.map(order => ({
    ...order,
    id: order.orderId,
    ticketName: order.ticketType,
    ticketCount: order.ticketCount || 1,
    status: convertStatus(order.orderStatus),
    comicConBanner: order.comicConBanner || 'https://www.helloimg.com/i/2026/01/27/69783066c0b56.png',
    ticketVerifyList: order.ticketVerifyList || []
  }));
});

// 加载订单数据
const loadOrderData = async () => {
  try {
    loading.value = true;
    showToast({ type: 'loading', message: '加载订单中...' });
    
    const response = await getUserComicConTickets();
    
    if (response.code === 0) {
      orderList.value = response.data || [];
      showToast('加载完成');
    } else {
      showToast(response.msg || '加载订单失败');
    }
  } catch (error) {
    console.error('加载订单失败：', error);
    if (error.response?.data?.msg) {
      showToast(error.response.data.msg);
      if (error.response.data.msg.includes('登录') || error.response.data.msg.includes('Token')) {
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      }
    } else {
      showToast('网络错误，加载失败');
    }
  } finally {
    loading.value = false;
    finished.value = true;
  }
};

const onLoad = () => {
  setTimeout(() => {
    loading.value = false;
    finished.value = true;
  }, 1000);
};

// 切换标签页重新筛选
const handleTabChange = () => {
  finished.value = false;
  setTimeout(() => {
    finished.value = true;
  }, 500);
};

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    unpaid: 'warning',
    paid: 'primary',
    verified: 'success',
    refunded: 'default',
    unknown: 'default'
  };
  return typeMap[status] || 'default';
};

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    unpaid: '待支付',
    paid: '已支付',
    verified: '已核销',
    refunded: '已退票',
    unknown: '未知状态'
  };
  return textMap[status] || '未知状态';
};

const copyCode = (code) => {
  if (!code) {
    showToast('核销码为空，无法复制');
    return;
  }
  navigator.clipboard.writeText(code).then(() => {
    showToast('核销码复制成功');
  }).catch(() => {
    showToast('复制失败，请手动记录核销码');
  });
};

const toPay = async (orderId) => {
  try {
    showToast({ type: 'loading', message: '跳转支付中...' });
    const payType = 1;
    const response = await payComicConOrder(orderId, payType);
    
    if (response.code === 0) {
      router.push({ path: '/pay', query: { orderId, ...response.data } });
    } else {
      showToast(response.msg || '获取支付参数失败');
    }
  } catch (error) {
    console.error('支付失败：', error);
    showToast('支付失败，请稍后重试');
  }
};

const cancelOrder = async (orderId) => {
  try {
    await showConfirmDialog({
      title: '确认取消',
      message: '取消订单后将无法恢复，是否确认？'
    });
    
    const response = await cancelComicConOrder(orderId);
    if (response.code === 0) {
      showToast('订单已取消');
      loadOrderData(); 
    } else {
      showToast(response.msg || '取消订单失败');
    }
  } catch (error) {
    console.error('取消订单失败：', error);
    showToast('取消失败，请稍后重试');
  }
};

const refundOrder = async (orderId) => {
  try {
    await showConfirmDialog({
      title: '申请退票',
      message: '退票将扣除10%手续费，是否确认申请？'
    });
    
    const response = await refundComicConOrder(orderId);
    if (response.code === 0) {
      showToast('退票申请已提交，预计1-3个工作日到账');
      loadOrderData();
    } else {
      showToast(response.msg || '退票申请失败');
    }
  } catch (error) {
    console.error('退票失败：', error);
    showToast('退票失败，请稍后重试');
  }
};


const viewDetail = (orderId) => {
  router.push({ path: `/order/detail/${orderId}` });
};

onMounted(() => {
  loadOrderData();
});
</script>

<style scoped>
.my-comic-con-order {
  padding-top: 46px;
  min-height: 100vh;
  box-sizing: border-box;
}

.order-tabs {
  background: #fff;
}

.order-list {
  padding: 10px;
}

.empty-order {
  padding: 50px 0;
}

.order-item {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-no {
  font-size: 12px;
  color: #666;
}

.order-detail {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.order-img {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.order-info {
  flex: 1;
  padding-left: 10px;
}

.comic-con-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.ticket-name, .order-time {
  font-size: 12px;
  color: #666;
  margin: 0 0 2px 0;
}

/* 新增：单张票样式 */
.ticket-item {
  margin-bottom: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.ticket-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px dashed #eee;
}

.buyer-info {
  margin-bottom: 12px;
  padding: 10px;
  border-radius: 4px;
}

.buyer-item {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 14px;
}

.buyer-item:last-child {
  margin-bottom: 0;
}

.buyer-item .label {
  color: #666;
  min-width: 60px;
}

.buyer-item .value {
  color: #333;
  font-weight: 500;
}

.verify-code {
  border-top: 1px dashed #eee;
  padding-top: 15px;
  margin-bottom: 10px;
}

.verify-code h5 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.code-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.code-text {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #ff4400;
}

.code-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.code-qr img {
  width: 100px;
  height: 100px;
}

.qr-tip {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.order-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>