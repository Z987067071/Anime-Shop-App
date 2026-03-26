<template>
  <div class="address-edit-page">
    <header class="glass-header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <van-icon name="arrow-left" />
        </div>
        <h1 class="page-title">编辑收货地址</h1>
        <div class="header-spacer"></div>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 地址表单卡片 -->
      <div class="form-card">
        <div class="card-header">
          <div class="header-icon">✏️</div>
          <span>修改收货信息</span>
        </div>

        <van-form @submit="onSubmit" class="address-form">
          <!-- 收货人 -->
          <div class="form-item">
            <div class="item-label">
              <van-icon name="user-o" />
              <span>收货人</span>
            </div>
            <van-field
              v-model="form.consignee"
              placeholder="请输入收货人姓名"
              :rules="[{ required: true, message: '请输入收货人姓名' }]"
              class="custom-field"
            />
          </div>

          <!-- 手机号 -->
          <div class="form-item">
            <div class="item-label">
              <van-icon name="phone-o" />
              <span>手机号</span>
            </div>
            <van-field
              v-model="form.phone"
              placeholder="请输入手机号"
              type="tel"
              maxlength="11"
              :rules="[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
              ]"
              class="custom-field"
            />
          </div>

          <!-- 地区选择-->
          <div class="form-item">
            <div class="item-label">
              <van-icon name="location-o" />
              <span>所在地区</span>
            </div>
            <div class="region-picker" @click="showRegionPicker = true">
              <span v-if="!regionText" class="placeholder">请选择省/市/区</span>
              <span v-else class="selected">{{ regionText }}</span>
              <van-icon name="arrow" class="picker-arrow" />
            </div>
          </div>

          <!-- 详细地址 -->
          <div class="form-item">
            <div class="item-label">
              <van-icon name="home-o" />
              <span>详细地址</span>
            </div>
            <van-field
              v-model="form.detailAddress"
              placeholder="请输入街道/门牌号/楼层"
              type="textarea"
              rows="2"
              :rules="[{ required: true, message: '请输入详细地址' }]"
              class="custom-field textarea-field"
            />
          </div>

          <!-- 默认地址开关 -->
          <div class="form-item switch-item">
            <div class="switch-label">
              <div class="label-main">
                <van-icon name="star-o" />
                <span>设为默认地址</span>
              </div>
              <span class="label-desc">每次下单时会推荐使用该地址</span>
            </div>
            <van-switch
              v-model="form.isDefault"
              :active-value="1"
              :inactive-value="0"
              size="22px"
              active-color="#ff2442"
            />
          </div>
        </van-form>
      </div>

      <!-- 保存按钮 -->
      <div class="submit-section">
        <button class="submit-btn" @click="onSubmit">
          <van-icon name="success" />
          <span>保存修改</span>
        </button>
      </div>
    </div>

    <!-- 地区选择弹窗 -->
    <van-popup
      v-model:show="showRegionPicker"
      position="bottom"
      round
      :style="{ height: '50%' }"
    >
      <van-cascader
        v-model="regionValue"
        title="选择所在地区"
        :options="regionOptions"
        @close="showRegionPicker = false"
        @finish="onRegionConfirm"
      />
    </van-popup>

    <div style="display: none"><TabBar /></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getAddressDetail, editAddress } from '@/api/mobile/mine'
import TabBar from '@/components/TabBar.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const addressId = route.params.id

// 地区选择
const showRegionPicker = ref(false)
const regionValue = ref('')

// 计算显示的地址文本
const regionText = computed(() => {
  if (!form.value.province) return ''
  return `${form.value.province}/${form.value.city}/${form.value.district}`
})

// 表单数据
const form = ref({
  id: addressId,
  consignee: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: 0,
  userId: userStore.id
})

const regionOptions = [
  {
    text: '北京市',
    value: '北京市',
    children: [
      {
        text: '北京市',
        value: '北京市',
        children: [
          { text: '朝阳区', value: '朝阳区' },
          { text: '海淀区', value: '海淀区' },
          { text: '东城区', value: '东城区' },
          { text: '西城区', value: '西城区' },
          { text: '丰台区', value: '丰台区' },
          { text: '石景山区', value: '石景山区' },
          { text: '通州区', value: '通州区' },
          { text: '昌平区', value: '昌平区' },
          { text: '大兴区', value: '大兴区' },
          { text: '顺义区', value: '顺义区' }
        ]
      }
    ]
  },
  {
    text: '上海市',
    value: '上海市',
    children: [
      {
        text: '上海市',
        value: '上海市',
        children: [
          { text: '浦东新区', value: '浦东新区' },
          { text: '黄浦区', value: '黄浦区' },
          { text: '静安区', value: '静安区' },
          { text: '徐汇区', value: '徐汇区' },
          { text: '长宁区', value: '长宁区' },
          { text: '普陀区', value: '普陀区' },
          { text: '虹口区', value: '虹口区' },
          { text: '杨浦区', value: '杨浦区' },
          { text: '闵行区', value: '闵行区' },
          { text: '宝山区', value: '宝山区' }
        ]
      }
    ]
  },
  {
    text: '天津市',
    value: '天津市',
    children: [
      {
        text: '天津市',
        value: '天津市',
        children: [
          { text: '和平区', value: '和平区' },
          { text: '河东区', value: '河东区' },
          { text: '河西区', value: '河西区' },
          { text: '南开区', value: '南开区' },
          { text: '河北区', value: '河北区' },
          { text: '红桥区', value: '红桥区' },
          { text: '滨海新区', value: '滨海新区' }
        ]
      }
    ]
  },
  {
    text: '重庆市',
    value: '重庆市',
    children: [
      {
        text: '重庆市',
        value: '重庆市',
        children: [
          { text: '渝中区', value: '渝中区' },
          { text: '大渡口区', value: '大渡口区' },
          { text: '江北区', value: '江北区' },
          { text: '沙坪坝区', value: '沙坪坝区' },
          { text: '九龙坡区', value: '九龙坡区' },
          { text: '南岸区', value: '南岸区' },
          { text: '渝北区', value: '渝北区' }
        ]
      }
    ]
  },
  
  // 广东省
  {
    text: '广东省',
    value: '广东省',
    children: [
      {
        text: '广州市',
        value: '广州市',
        children: [
          { text: '天河区', value: '天河区' },
          { text: '越秀区', value: '越秀区' },
          { text: '荔湾区', value: '荔湾区' },
          { text: '海珠区', value: '海珠区' },
          { text: '白云区', value: '白云区' },
          { text: '番禺区', value: '番禺区' },
          { text: '黄埔区', value: '黄埔区' },
          { text: '花都区', value: '花都区' }
        ]
      },
      {
        text: '深圳市',
        value: '深圳市',
        children: [
          { text: '福田区', value: '福田区' },
          { text: '罗湖区', value: '罗湖区' },
          { text: '南山区', value: '南山区' },
          { text: '宝安区', value: '宝安区' },
          { text: '龙岗区', value: '龙岗区' },
          { text: '龙华区', value: '龙华区' },
          { text: '盐田区', value: '盐田区' },
          { text: '坪山区', value: '坪山区' }
        ]
      },
      {
        text: '东莞市',
        value: '东莞市',
        children: [
          { text: '南城街道', value: '南城街道' },
          { text: '东城街道', value: '东城街道' },
          { text: '万江街道', value: '万江街道' },
          { text: '莞城街道', value: '莞城街道' }
        ]
      },
      {
        text: '佛山市',
        value: '佛山市',
        children: [
          { text: '禅城区', value: '禅城区' },
          { text: '南海区', value: '南海区' },
          { text: '顺德区', value: '顺德区' },
          { text: '三水区', value: '三水区' }
        ]
      }
    ]
  },
  
  // 浙江省
  {
    text: '浙江省',
    value: '浙江省',
    children: [
      {
        text: '杭州市',
        value: '杭州市',
        children: [
          { text: '西湖区', value: '西湖区' },
          { text: '上城区', value: '上城区' },
          { text: '拱墅区', value: '拱墅区' },
          { text: '滨江区', value: '滨江区' },
          { text: '萧山区', value: '萧山区' },
          { text: '余杭区', value: '余杭区' },
          { text: '临平区', value: '临平区' },
          { text: '钱塘区', value: '钱塘区' }
        ]
      },
      {
        text: '宁波市',
        value: '宁波市',
        children: [
          { text: '海曙区', value: '海曙区' },
          { text: '江北区', value: '江北区' },
          { text: '北仑区', value: '北仑区' },
          { text: '镇海区', value: '镇海区' },
          { text: '鄞州区', value: '鄞州区' }
        ]
      },
      {
        text: '温州市',
        value: '温州市',
        children: [
          { text: '鹿城区', value: '鹿城区' },
          { text: '龙湾区', value: '龙湾区' },
          { text: '瓯海区', value: '瓯海区' }
        ]
      }
    ]
  },
  
  // 江苏省
  {
    text: '江苏省',
    value: '江苏省',
    children: [
      {
        text: '南京市',
        value: '南京市',
        children: [
          { text: '玄武区', value: '玄武区' },
          { text: '秦淮区', value: '秦淮区' },
          { text: '建邺区', value: '建邺区' },
          { text: '鼓楼区', value: '鼓楼区' },
          { text: '浦口区', value: '浦口区' },
          { text: '栖霞区', value: '栖霞区' },
          { text: '雨花台区', value: '雨花台区' },
          { text: '江宁区', value: '江宁区' }
        ]
      },
      {
        text: '苏州市',
        value: '苏州市',
        children: [
          { text: '姑苏区', value: '姑苏区' },
          { text: '虎丘区', value: '虎丘区' },
          { text: '吴中区', value: '吴中区' },
          { text: '相城区', value: '相城区' },
          { text: '工业园区', value: '工业园区' },
          { text: '吴江区', value: '吴江区' }
        ]
      },
      {
        text: '无锡市',
        value: '无锡市',
        children: [
          { text: '锡山区', value: '锡山区' },
          { text: '惠山区', value: '惠山区' },
          { text: '滨湖区', value: '滨湖区' },
          { text: '梁溪区', value: '梁溪区' },
          { text: '新吴区', value: '新吴区' }
        ]
      }
    ]
  },
  
  // 四川省
  {
    text: '四川省',
    value: '四川省',
    children: [
      {
        text: '成都市',
        value: '成都市',
        children: [
          { text: '锦江区', value: '锦江区' },
          { text: '青羊区', value: '青羊区' },
          { text: '金牛区', value: '金牛区' },
          { text: '武侯区', value: '武侯区' },
          { text: '成华区', value: '成华区' },
          { text: '龙泉驿区', value: '龙泉驿区' },
          { text: '青白江区', value: '青白江区' },
          { text: '新都区', value: '新都区' },
          { text: '温江区', value: '温江区' },
          { text: '双流区', value: '双流区' }
        ]
      }
    ]
  },
  
  // 湖北省
  {
    text: '湖北省',
    value: '湖北省',
    children: [
      {
        text: '武汉市',
        value: '武汉市',
        children: [
          { text: '江岸区', value: '江岸区' },
          { text: '江汉区', value: '江汉区' },
          { text: '硚口区', value: '硚口区' },
          { text: '汉阳区', value: '汉阳区' },
          { text: '武昌区', value: '武昌区' },
          { text: '青山区', value: '青山区' },
          { text: '洪山区', value: '洪山区' },
          { text: '东西湖区', value: '东西湖区' }
        ]
      }
    ]
  },
  
  // 湖南省
  {
    text: '湖南省',
    value: '湖南省',
    children: [
      {
        text: '长沙市',
        value: '长沙市',
        children: [
          { text: '芙蓉区', value: '芙蓉区' },
          { text: '天心区', value: '天心区' },
          { text: '岳麓区', value: '岳麓区' },
          { text: '开福区', value: '开福区' },
          { text: '雨花区', value: '雨花区' },
          { text: '望城区', value: '望城区' }
        ]
      }
    ]
  },
  
  // 河南省
  {
    text: '河南省',
    value: '河南省',
    children: [
      {
        text: '郑州市',
        value: '郑州市',
        children: [
          { text: '中原区', value: '中原区' },
          { text: '二七区', value: '二七区' },
          { text: '管城回族区', value: '管城回族区' },
          { text: '金水区', value: '金水区' },
          { text: '上街区', value: '上街区' },
          { text: '惠济区', value: '惠济区' }
        ]
      }
    ]
  },
  
  // 山东省
  {
    text: '山东省',
    value: '山东省',
    children: [
      {
        text: '济南市',
        value: '济南市',
        children: [
          { text: '历下区', value: '历下区' },
          { text: '市中区', value: '市中区' },
          { text: '槐荫区', value: '槐荫区' },
          { text: '天桥区', value: '天桥区' },
          { text: '历城区', value: '历城区' }
        ]
      },
      {
        text: '青岛市',
        value: '青岛市',
        children: [
          { text: '市南区', value: '市南区' },
          { text: '市北区', value: '市北区' },
          { text: '黄岛区', value: '黄岛区' },
          { text: '崂山区', value: '崂山区' },
          { text: '李沧区', value: '李沧区' },
          { text: '城阳区', value: '城阳区' }
        ]
      }
    ]
  },
  
  // 福建省
  {
    text: '福建省',
    value: '福建省',
    children: [
      {
        text: '福州市',
        value: '福州市',
        children: [
          { text: '鼓楼区', value: '鼓楼区' },
          { text: '台江区', value: '台江区' },
          { text: '仓山区', value: '仓山区' },
          { text: '马尾区', value: '马尾区' },
          { text: '晋安区', value: '晋安区' },
          { text: '长乐区', value: '长乐区' }
        ]
      },
      {
        text: '厦门市',
        value: '厦门市',
        children: [
          { text: '思明区', value: '思明区' },
          { text: '海沧区', value: '海沧区' },
          { text: '湖里区', value: '湖里区' },
          { text: '集美区', value: '集美区' },
          { text: '同安区', value: '同安区' },
          { text: '翔安区', value: '翔安区' }
        ]
      }
    ]
  },
  
  // 陕西省
  {
    text: '陕西省',
    value: '陕西省',
    children: [
      {
        text: '西安市',
        value: '西安市',
        children: [
          { text: '新城区', value: '新城区' },
          { text: '碑林区', value: '碑林区' },
          { text: '莲湖区', value: '莲湖区' },
          { text: '雁塔区', value: '雁塔区' },
          { text: '灞桥区', value: '灞桥区' },
          { text: '未央区', value: '未央区' },
          { text: '阎良区', value: '阎良区' }
        ]
      }
    ]
  }
]

// 地区选择确认
const onRegionConfirm = ({ selectedOptions }) => {
  form.value.province = selectedOptions[0]?.text || ''
  form.value.city = selectedOptions[1]?.text || ''
  form.value.district = selectedOptions[2]?.text || ''
  showRegionPicker.value = false
}

// 加载地址详情
const loadAddressDetail = async () => {
  try {
    const res = await getAddressDetail(addressId, {
      userId: userStore.id
    })
    if (res.code === 0) {
      const data = res.data
      form.value = {
        id: data.id,
        consignee: data.consignee,
        phone: data.phone,
        province: data.province,
        city: data.city,
        district: data.district,
        detailAddress: data.detailAddress,
        isDefault: data.isDefault === 1 ? 1 : 0,
        userId: userStore.id
      }
    } else {
      ElMessage.error(res.msg || '获取地址详情失败')
      router.push({ name: 'AddressList' })
    }
  } catch (error) {
    ElMessage.error('网络异常，获取地址详情失败')
    router.push({ name: 'AddressList' })
  }
}

// 返回上一页
const goBack = () => {
  router.push({ name: 'AddressList' })
}

// 提交修改
const onSubmit = async () => {
  // 表单验证
  if (!form.value.consignee.trim()) {
    ElMessage.warning('请输入收货人姓名')
    return
  }
  if (!form.value.phone.trim()) {
    ElMessage.warning('请输入手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  if (!form.value.province) {
    ElMessage.warning('请选择所在地区')
    return
  }
  if (!form.value.detailAddress.trim()) {
    ElMessage.warning('请输入详细地址')
    return
  }

  try {
    const res = await editAddress(form.value)
    if (res.code === 0) {
      ElMessage.success('修改地址成功')
      router.push({ name: 'AddressList' })
    } else {
      ElMessage.error(res.msg || '修改地址失败')
    }
  } catch (error) {
    ElMessage.error('网络异常，修改地址失败')
    console.error('修改地址失败：', error)
  }
}

onMounted(() => {
  loadAddressDetail()
})
</script>

<style scoped>
.address-edit-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 40px;
}

.glass-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 16px;
  max-width: 600px;
  margin: 0 auto;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #333;
  font-size: 20px;
  transition: all 0.3s;
}

.back-btn:active {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(0.95);
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.header-spacer {
  width: 36px;
}

/* 主内容区 */
.main-content {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

/* 表单卡片 */
.form-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.header-icon {
  font-size: 24px;
}

.card-header span {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

/* 表单项 */
.form-item {
  margin-bottom: 20px;
}

.item-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #666;
  font-size: 14px;
}

.item-label .van-icon {
  font-size: 16px;
  color: #ff2442;
}

/* 自定义输入框 */
.custom-field {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid transparent;
  transition: all 0.3s;
}

.custom-field:focus-within {
  background: #fff;
  border-color: #ff2442;
  box-shadow: 0 0 0 3px rgba(255, 36, 66, 0.1);
}

:deep(.custom-field .van-field__control) {
  font-size: 15px;
  color: #333;
}

:deep(.custom-field .van-field__control::placeholder) {
  color: #bbb;
}

/* 文本域 */
.textarea-field {
  padding: 12px 16px;
}

:deep(.textarea-field .van-field__control) {
  line-height: 1.6;
}

/* 地区选择器 */
.region-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.region-picker:active {
  background: #f0f2f5;
}

.region-picker .placeholder {
  color: #bbb;
  font-size: 15px;
}

.region-picker .selected {
  color: #333;
  font-size: 15px;
}

.picker-arrow {
  color: #ccc;
  font-size: 14px;
  transition: transform 0.3s;
}

.region-picker:active .picker-arrow {
  transform: translateX(4px);
}

/* 开关项 */
.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-top: 24px;
}

.switch-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label-main {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.label-main .van-icon {
  color: #ff2442;
  font-size: 18px;
}

.label-desc {
  font-size: 12px;
  color: #999;
  padding-left: 26px;
}

/* 提交区域 */
.submit-section {
  margin-top: 24px;
  padding: 0 20px;
}

.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: white;
  border: none;
  border-radius: 28px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(255, 36, 66, 0.3);
}

.submit-btn:active {
  transform: scale(0.98);
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.2);
}

.submit-btn .van-icon {
  font-size: 20px;
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .address-edit-page {
    background: #1a1a2e;
  }
  
  .glass-header {
    background: rgba(26, 26, 46, 0.95);
  }
  
  .page-title {
    color: #fff;
  }
  
  .back-btn {
    color: #fff;
  }
  
  .form-card {
    background: #242442;
  }
  
  .card-header span {
    color: #e0e0e0;
  }
  
  .card-header {
    border-bottom-color: #2a2a4a;
  }
  
  .item-label {
    color: #aaa;
  }
  
  .custom-field {
    background: #1a1a2e;
  }
  
  .custom-field:focus-within {
    background: #242442;
  }
  
  :deep(.custom-field .van-field__control) {
    color: #e0e0e0;
  }
  
  .region-picker {
    background: #1a1a2e;
  }
  
  .region-picker .selected {
    color: #e0e0e0;
  }
  
  .switch-item {
    background: #1a1a2e;
  }
  
  .label-main {
    color: #e0e0e0;
  }
}
</style>