<template>
  <div class="comic-con-detail">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="漫展详情"
      fixed
      left-arrow
      @click-left="router.back()"
    />
    <!-- 漫展封面 -->
    <img :src="comicConInfo.bannerImg" alt="漫展封面" class="detail-banner" />
    <!-- 漫展基础信息 -->
    <div class="detail-info">
      <h2 class="detail-name">{{ comicConInfo.name }}</h2>
      <div class="detail-base">
        <van-tag type="primary" size="small">{{ comicConInfo.statusText }}</van-tag>
        <span class="detail-time">{{ comicConInfo.startTime }} - {{ comicConInfo.endTime }}</span>
      </div>
      <p class="detail-venue">{{ comicConInfo.venue }}</p>
      <div class="detail-desc" v-if="comicConInfo.description">
        <h4>漫展简介</h4>
        <p>{{ comicConInfo.description }}</p>
      </div>
    </div>
    <!-- 底部购票按钮 -->
    <div class="buy-footer">
      <van-button type="danger" size="large" @click="openTicketModal">
        立即购票
      </van-button>
    </div>

    <!-- 票种选择弹窗 -->
    <van-dialog
      v-model:show="ticketModalShow"
      title="选择票种"
      width="90%"
      @confirm="confirmTicket"
    >
      <!-- 票种列表 -->
      <van-cell-group>
        <van-radio-group v-model="selectedTicketId">
          <van-cell
            v-for="ticket in ticketList"
            :key="ticket.id"
            clickable
            @click="selectTicket(ticket.id)"
          >
            <template #title>
              <div class="ticket-name">{{ ticket.ticketName }}</div>
              <div class="ticket-stock" v-if="ticket.stock > 0">
                剩余：{{ ticket.stock }}张
              </div>
              <div class="ticket-stock out-stock" v-else>已售罄</div>
            </template>
            <template #right-icon>
              <div class="ticket-price">¥{{ ticket.price }}</div>
              <van-radio :name="ticket.id" :disabled="ticket.stock <= 0" />
            </template>
          </van-cell>
        </van-radio-group>
      </van-cell-group>
      <!-- 数量选择 -->
      <div class="num-select">
        <span class="num-text">购买数量：</span>
        <van-stepper
          v-model="buyNum"
          min="1"
          :max="selectedTicket.maxBuy || 5"
          disabled="selectedTicket.stock <= 0"
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';

const router = useRouter();
const route = useRoute();
const comicConId = route.params.id; // 获取漫展ID

// 弹窗状态
const ticketModalShow = ref(false);
// 选中的票种ID
const selectedTicketId = ref('');
// 购买数量
const buyNum = ref(1);
// 漫展详情（模拟数据）
const comicConInfo = ref({
  id: comicConId,
  name: '2026B站二次元漫展-上海站',
  bannerImg: 'https://placeholder.com/750x300',
  startTime: '2026-05-01 09:00',
  endTime: '2026-05-03 18:00',
  venue: '上海新国际博览中心',
  description: '2026B站二次元漫展重磅来袭！超多大咖嘉宾、限定周边、舞台表演，等你来嗨！',
  statusText: '售票中'
});
// 票种列表（模拟数据）
const ticketList = ref([
  {
    id: 1,
    ticketName: '周六VIP票',
    price: 199,
    stock: 500,
    maxBuy: 3
  },
  {
    id: 2,
    ticketName: '周六普通票',
    price: 99,
    stock: 1000,
    maxBuy: 5
  },
  {
    id: 3,
    ticketName: '周日夜场票',
    price: 69,
    stock: 0,
    maxBuy: 5
  }
]);
// 选中的票种详情
const selectedTicket = ref({});

// 打开票种选择弹窗
const openTicketModal = () => {
  if (ticketList.value.length === 0) {
    showToast('暂无可售票种');
    return;
  }
  // 默认选中第一个可售票种
  const firstValidTicket = ticketList.value.find(t => t.stock > 0);
  if (firstValidTicket) {
    selectedTicketId.value = firstValidTicket.id;
    selectedTicket.value = firstValidTicket;
    buyNum.value = 1;
  } else {
    showToast('暂无可售票种');
    return;
  }
  ticketModalShow.value = true;
};

// 选择票种
const selectTicket = (ticketId) => {
  const ticket = ticketList.value.find(t => t.id === ticketId);
  if (ticket) {
    selectedTicket.value = ticket;
    buyNum.value = 1; // 切换票种重置数量
  }
};

// 确认选择票种（后续跳转订单页）
const confirmTicket = () => {
  if (!selectedTicketId.value) {
    showToast('请选择票种');
    return;
  }
  if (selectedTicket.value.stock <= 0) {
    showToast('该票种已售罄');
    return;
  }
  // 模拟跳转订单页（后续替换为你的订单页面路由）
  showConfirmDialog({
    title: '确认购票',
    message: `你选择了【${selectedTicket.value.ticketName}】× ${buyNum.value}张，总价¥${selectedTicket.value.price * buyNum.value}，是否继续？`
  }).then(() => {
    // 跳转订单确认页（复用原有商品订单页，传票务参数）
    router.push({
      path: '/order/confirm', // 你的订单确认页路由
      query: {
        type: 'comicCon', // 标记为票务订单
        ticketId: selectedTicketId.value,
        num: buyNum.value,
        comicConId: comicConId
      }
    });
  });
};

// 初始化加载漫展和票种数据
onMounted(() => {
  showToast({ type: 'loading', message: '加载中...' });
  setTimeout(() => {
    showToast('加载完成');
  }, 800);
});
</script>

<style scoped>
.comic-con-detail {
  padding-top: 46px;
  min-height: 100vh;
  box-sizing: border-box;
}

.detail-banner {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.detail-info {
  padding: 15px;
}

.detail-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
}

.detail-base {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.detail-time {
  font-size: 14px;
  color: #666;
}

.detail-venue {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.detail-desc {
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.detail-desc h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.detail-desc p {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.buy-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

/* 票种弹窗样式 */
.ticket-name {
  font-size: 16px;
  color: #333;
}

.ticket-stock {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.out-stock {
  color: #999;
}

.ticket-price {
  font-size: 16px;
  font-weight: 600;
  color: #ff4400;
  margin-right: 10px;
}

.num-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-top: 1px solid #eee;
  margin-top: 10px;
}

.num-text {
  font-size: 14px;
  color: #333;
}
</style>