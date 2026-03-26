<template>
  <van-popup 
    :show="show" 
    @update:show="handlePopupClose" 
    position="bottom" 
    round
  >
    <div class="report-popup">
      <h3 class="popup-title">举报该内容</h3>
      <div class="reason-list">
        <div 
          class="reason-item"
          v-for="item in reasonList"
          :key="item.code"
          :class="{ active: selectedReason === item.code }"
          @click="selectReason(item.code)"
        >
          {{ item.desc }}
        </div>
      </div>
      <textarea 
        v-if="selectedReason === 99"
        v-model="customReason"
        placeholder="请输入具体举报理由（最多150字）"
        maxlength="150"
        class="custom-reason"
        @input="limitTextLength"
      ></textarea>
      <button 
        class="submit-btn"
        :disabled="!selectedReason || (selectedReason === 99 && !customReason.trim()) || submitting"
        @click="handleSubmitReport"
      >
        {{ submitting ? '提交中...' : '提交举报' }}
      </button>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue'
import { showToast } from 'vant'
import { submitReport as submitReportApi } from '@/api/mobile/report'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
    default: false
  },
  targetType: {
    type: Number,
    required: true,
    default: 2
  },
  targetId: {
    type: [Number, String , null],
    required: true
  }
})

const emit = defineEmits(['update:show', 'close', 'success'])

const reasonList = ref([
  { code: 1, desc: '违反法律规定' },
  { code: 2, desc: '色情低俗' },
  { code: 3, desc: '赌博诈骗' },
  { code: 4, desc: '人身攻击' },
  { code: 5, desc: '侵犯隐私' },
  { code: 6, desc: '垃圾广告' },
  { code: 7, desc: '引战' },
  { code: 8, desc: '刷屏/抢楼' },
  { code: 9, desc: '青少年不良' },
  { code: 10, desc: '谣言造谣' },
  { code: 99, desc: '其他' }
])

const selectedReason = ref(null)
const customReason = ref('')
const submitting = ref(false)

const targetIdNum = computed(() => {
  const id = props.targetId
  if (!id || isNaN(Number(id))) {
    showToast('举报目标ID格式错误')
    return 0
  }
  return Number(id)
})

const selectReason = (code) => {
  selectedReason.value = code
  if (code !== 99) {
    customReason.value = ''
  }
}

const limitTextLength = () => {
  if (customReason.value.length > 150) {
    customReason.value = customReason.value.substring(0, 150)
    showToast('自定义理由长度不能超过150字')
  }
}

const handlePopupClose = (newVal) => {
  resetForm()
  emit('update:show', newVal)
  emit('close')
}

const resetForm = () => {
  selectedReason.value = null
  customReason.value = ''
  submitting.value = false
}

const handleSubmitReport = async () => {
  if (targetIdNum.value === 0) {
    return
  }

  if (typeof submitReportApi !== 'function') {
    showToast('举报接口初始化失败，请刷新页面重试')
    console.error('submitReportApi is not a function:', submitReportApi)
    return
  }

  submitting.value = true
  try {
    const params = {
      targetType: props.targetType,
      targetId: targetIdNum.value,
      reportReason: selectedReason.value,
      customReason: customReason.value.trim()
    }

    const res = await submitReportApi(params)

    if (res.code === 0) {
      showToast(res.msg || '举报提交成功')
      emit('success')
      resetForm()
      emit('update:show', false)
      emit('close')
    } else {
      showToast(res.msg || '举报提交失败')
    }
  } catch (error) {
    console.error('举报提交失败：', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.report-popup {
  padding: 20px;
  background-color: #fff;
  border-radius: 16px 16px 0 0;
}

.popup-title {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.reason-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.reason-item {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border-radius: 20px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reason-item.active {
  background-color: #409eff;
  color: #fff;
}

.custom-reason {
  width: 100%;
  height: 100px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  resize: none;
  font-size: 14px;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
  background-color: #337ecc;
}
</style>