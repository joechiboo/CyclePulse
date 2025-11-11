# 蓝牙心率带整合库使用指南

> 一个基于 Web Bluetooth API 的即插即用心率监测解决方案

## 📖 简介

本库提供了完整的蓝牙心率带（BLE Heart Rate Monitor）整合功能，让你可以在任何 Web 应用中快速添加实时心率监测。基于标准的 BLE Heart Rate Profile，支持所有符合规范的心率设备。

### ✨ 特性

- ✅ **零依赖** - 纯原生 Web Bluetooth API，无需第三方库
- ✅ **即插即用** - 复制文件即可使用
- ✅ **完整功能** - 实时监测、历史记录、区间分析、电池电量
- ✅ **Vue 3 优化** - 基于 Pinia 状态管理
- ✅ **响应式设计** - 移动端友好的 UI 组件
- ✅ **智能提醒** - 危险心率自动警示（震动+动画）
- ✅ **数据可视化** - 内置 SVG 图表组件

### 🎯 适用场景

- 健身训练应用
- 运动数据追踪
- 健康监测平台
- 智能穿戴设备配套 Web 应用
- 教练指导系统

---

## 🔧 快速开始

### 前置要求

- **框架**: Vue 3 + Pinia
- **浏览器**: Chrome/Edge (桌面版或 Android)
- **协议**: HTTPS（必须）
- **设备**: 支持 BLE Heart Rate Profile 的心率带

> ⚠️ **iOS Safari 不支持** - Apple 未实现 Web Bluetooth API

### 步骤 1: 复制核心文件

将以下文件复制到你的项目中：

```bash
# 核心状态管理（必需）
src/stores/heartRate.js

# UI 组件（可选，根据需求选择）
src/components/HeartRateMonitor.vue     # 紧凑型心率卡片
src/components/HeartRateChart.vue       # 心率历史图表
src/views/HeartRatePage.vue             # 独立心率监测页面
```

### 步骤 2: 注册 Pinia Store

```javascript
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
```

### 步骤 3: 在组件中使用

```vue
<template>
  <div>
    <button @click="connectHeartRate">连接心率带</button>

    <div v-if="heartRateStore.isConnected">
      <p>当前心率: {{ heartRateStore.currentHeartRate }} BPM</p>
      <p>心率区间: {{ heartRateStore.currentZoneName }}</p>
      <p>电池电量: {{ heartRateStore.batteryLevel }}%</p>
    </div>
  </div>
</template>

<script setup>
import { useHeartRateStore } from '@/stores/heartRate'

const heartRateStore = useHeartRateStore()

const connectHeartRate = async () => {
  try {
    await heartRateStore.connect()
    console.log('心率带已连接')
  } catch (error) {
    console.error('连接失败:', error)
  }
}
</script>
```

---

## 📚 API 文档

### HeartRate Store

#### 状态 (State)

| 属性 | 类型 | 说明 |
|-----|------|------|
| `isConnected` | Boolean | 连接状态 |
| `currentHeartRate` | Number | 当前心率值 (BPM) |
| `batteryLevel` | Number | 电池电量 (0-100) |
| `isContactDetected` | Boolean | 传感器接触检测 |
| `energyExpended` | Number | 能量消耗 (kJ) |
| `rrIntervals` | Array | RR 间隔数据（心率变异性） |
| `heartRateHistory` | Array | 今日心率历史记录 |
| `userAge` | Number | 用户年龄（默认 30） |
| `debugLogs` | Array | Debug 日志 |

#### 计算属性 (Getters)

| 属性 | 类型 | 说明 |
|-----|------|------|
| `maxHeartRate` | Number | 最大心率 (220 - 年龄) |
| `currentZone` | String | 当前心率区间 (rest/warmup/fatBurn/cardio/peak/danger) |
| `currentZoneName` | String | 区间名称（中文） |
| `heartRatePercentage` | Number | 心率百分比（基于最大心率） |

#### 方法 (Actions)

##### `connect()`
连接蓝牙心率带

```javascript
await heartRateStore.connect()
```

**返回**: Promise
**错误**:
- 用户取消选择设备
- 设备不支持 Heart Rate Service
- 浏览器不支持 Web Bluetooth

---

##### `disconnect()`
断开心率带连接

```javascript
heartRateStore.disconnect()
```

---

##### `setUserAge(age)`
设置用户年龄（用于计算最大心率）

```javascript
heartRateStore.setUserAge(35)
```

**参数**:
- `age` (Number): 用户年龄 (10-100)

---

##### `getHeartRateStatus(trainingIntensity)`
根据训练强度获取心率状态

```javascript
const status = heartRateStore.getHeartRateStatus('medium')
// 返回: { status: 'good', message: '✅ 有氧训练区间，很好', color: '#10b981' }
```

**参数**:
- `trainingIntensity` (String): 训练强度
  - `'low'`: 低强度（目标心率 50-60%）
  - `'medium'`: 中强度（目标心率 60-70%）
  - `'high'`: 高强度（目标心率 70-80%）
  - `'extreme'`: 极限强度（目标心率 80-90%）

**返回**: Object
```javascript
{
  status: 'good' | 'warning' | 'danger',
  message: '状态提示文字',
  color: '#hex颜色码'
}
```

---

##### `clearHistory()`
清除心率历史记录

```javascript
heartRateStore.clearHistory()
```

---

### 心率区间定义

基于最大心率百分比（220 - 年龄）：

| 区间 | 范围 | 名称 | 颜色 | 说明 |
|-----|------|------|------|------|
| `rest` | 0-50% | 休息 | 灰色 | 静息心率 |
| `warmup` | 50-60% | 暖身 | 蓝色 | 热身阶段 |
| `fatBurn` | 60-70% | 燃脂 | 绿色 | 脂肪燃烧区间 |
| `cardio` | 70-80% | 有氧 | 橙色 | 心肺训练区间 |
| `peak` | 80-90% | 高强度 | 红色 | 高强度训练 |
| `danger` | 90%+ | 危险 | 深红 | 过度训练警告 |

---

## 🎨 UI 组件

### HeartRateMonitor.vue

紧凑型心率监测卡片组件

**功能**:
- 实时心率显示（大字体）
- 心跳动画效果
- 连接/断开按钮
- 电池电量指示
- 心率区间进度条
- 危险心率警示（红色边框+振动）

**使用方法**:

```vue
<template>
  <HeartRateMonitor />
</template>

<script setup>
import HeartRateMonitor from '@/components/HeartRateMonitor.vue'
</script>
```

**Props**: 无
**自动连接**: 需手动点击连接按钮

---

### HeartRateChart.vue

心率历史图表组件（SVG 折线图）

**功能**:
- 实时绘制心率曲线
- 心率区间背景色标注
- 数据点颜色编码
- 统计信息（平均/最高/最低）
- 响应式设计

**使用方法**:

```vue
<template>
  <HeartRateChart />
</template>

<script setup>
import HeartRateChart from '@/components/HeartRateChart.vue'
</script>
```

**数据来源**: 自动从 `heartRateStore.heartRateHistory` 读取

---

### HeartRatePage.vue

独立的全屏心率监测页面

**功能**:
- 全屏大字显示
- 浮动操作按钮
- 心率区间说明 Modal
- 历史图表 Modal
- Debug 日志面板
- 震动提醒（危险心率）

**路由配置**:

```javascript
// router/index.js
{
  path: '/heart-rate',
  name: 'HeartRate',
  component: () => import('@/views/HeartRatePage.vue')
}
```

---

## 🔌 支持的设备

### ✅ 已验证设备

#### Garmin HRM-Dual / HRM-200
- **价格**: NT$ 1,990-2,290
- **协议**: 标准 BLE Heart Rate Profile
- **特点**:
  - 即插即用，无需配对
  - 双模蓝牙（BLE + ANT+）
  - 可同时连接 2 个设备
  - 电池寿命：约 3.5 年
  - 可更换电池（CR2032）

**购买建议**: ⭐⭐⭐⭐⭐ 强烈推荐
**兼容性**: 完美支持，开箱即用

---

### ❌ 不支持的设备

#### 小米手环 9 Pro / Mi Band 系列
- **原因**: 使用加密配对协议，不使用标准 Heart Rate Service
- **服务 UUID**: 0xFEE0（专属协议，需要 Auth Key）
- **替代方案**:
  - 使用 Gadgetbridge App 作为桥接（复杂）
  - 开发原生 Android App
  - 选择支持标准协议的设备

**详细分析**: 参见 `docs/bad/bluetooth-todo.md`

---

### 🔍 如何判断设备是否兼容？

设备必须支持以下 BLE 服务：

```
Service UUID: 0x180D (Heart Rate Service)
Characteristic UUID: 0x2A37 (Heart Rate Measurement)
```

**检查方法**:
1. 查看设备官方规格表
2. 搜索 "设备名称 + BLE Heart Rate Profile"
3. 使用本库的测试页面尝试连接

---

## 🛠️ 进阶使用

### 自定义心率区间

修改 `heartRate.js` 中的区间定义：

```javascript
// src/stores/heartRate.js

heartRateZones() {
  const maxHR = this.maxHeartRate
  return {
    rest: {
      min: 0,
      max: maxHR * 0.5,
      color: '#6b7280',
      name: '休息'
    },
    // 自定义其他区间...
  }
}
```

### 监听心率变化事件

使用 Pinia 的 `$subscribe` 监听状态变化：

```javascript
import { useHeartRateStore } from '@/stores/heartRate'

const heartRateStore = useHeartRateStore()

heartRateStore.$subscribe((mutation, state) => {
  if (mutation.events.key === 'currentHeartRate') {
    console.log('心率更新:', state.currentHeartRate)

    // 执行自定义逻辑
    if (state.currentHeartRate > 180) {
      alert('心率过高！')
    }
  }
})
```

### 导出心率数据

```javascript
const exportData = () => {
  const data = heartRateStore.heartRateHistory.map(record => ({
    time: new Date(record.timestamp).toLocaleTimeString(),
    heartRate: record.heartRate,
    zone: record.zone
  }))

  // 导出为 JSON
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `heart-rate-${Date.now()}.json`
  a.click()
}
```

### 添加自定义 Debug 日志

```javascript
heartRateStore.addDebugLog('自定义消息', 'info')
// 类型: 'info' | 'success' | 'error' | 'warning'
```

---

## ⚙️ 配置选项

### 修改最大心率计算公式

默认使用 **220 - 年龄**，你可以改用其他公式：

```javascript
// src/stores/heartRate.js

maxHeartRate() {
  // Tanaka 公式（更适合老年人）
  return 208 - 0.7 * this.userAge

  // 或 Gulati 公式（女性专用）
  // return 206 - 0.88 * this.userAge
}
```

### 调整历史记录保存频率

```javascript
// src/stores/heartRate.js

handleHeartRateChange(event) {
  // ...解析心率数据

  // 修改保存频率（例如每 5 秒保存一次）
  const lastRecord = this.heartRateHistory[this.heartRateHistory.length - 1]
  const now = Date.now()

  if (!lastRecord || now - lastRecord.timestamp > 5000) {
    this.heartRateHistory.push({
      timestamp: now,
      heartRate: this.currentHeartRate,
      zone: this.currentZone
    })
  }
}
```

---

## 🐛 常见问题

### Q1: 点击连接按钮没有反应？

**原因**:
- 浏览器不支持 Web Bluetooth
- 不是 HTTPS 连接
- 用户未授予蓝牙权限

**解决方案**:
1. 使用 Chrome 或 Edge 浏览器
2. 确保网站使用 HTTPS
3. 检查浏览器蓝牙权限设置

---

### Q2: 找不到我的心率带设备？

**原因**:
- 设备未开启或电量耗尽
- 设备已连接到其他应用
- 设备不支持标准 Heart Rate Profile

**解决方案**:
1. 确认设备已开启并有电
2. 断开设备与其他应用的连接
3. 查看设备规格是否支持 BLE Heart Rate Profile

---

### Q3: 连接后立即断开？

**原因**:
- 设备超出蓝牙范围
- 设备电量不足
- 浏览器标签页进入后台

**解决方案**:
1. 保持设备在 10 米范围内
2. 更换设备电池
3. 保持浏览器标签页在前台激活状态

---

### Q4: iOS Safari 可以用吗？

**回答**: ❌ 不可以

Apple 尚未在 iOS Safari 中实现 Web Bluetooth API。

**替代方案**:
- 使用 Android 设备
- 开发原生 iOS App
- 使用支持蓝牙的 PWA 框架（如 Capacitor）

---

### Q5: 如何在后台保持连接？

Web Bluetooth 不支持后台运行。页面最小化后连接会断开。

**可能的解决方案**:
- 开发原生 App
- 使用 Service Worker (实验性功能)
- 保持浏览器标签页激活

---

## 📊 技术细节

### BLE Heart Rate Profile 数据格式

Heart Rate Measurement 特征值结构：

```
Byte 0: Flags
  - Bit 0: Heart Rate Value Format (0=UINT8, 1=UINT16)
  - Bit 1-2: Sensor Contact Status
  - Bit 3: Energy Expended Status
  - Bit 4: RR-Interval Present

Byte 1 (或 1-2): Heart Rate Value (BPM)
Byte N+: Energy Expended (可选，UINT16)
Byte N+: RR-Intervals (可选，多个 UINT16)
```

### 解析代码示例

```javascript
const parseHeartRateData = (dataView) => {
  const flags = dataView.getUint8(0)

  // 心率值格式
  const is16Bit = flags & 0x01
  const heartRate = is16Bit
    ? dataView.getUint16(1, true)  // Little Endian
    : dataView.getUint8(1)

  // 传感器接触状态
  const contactDetected = (flags & 0x06) !== 0

  // 能量消耗
  let energyExpended = null
  let offset = is16Bit ? 3 : 2

  if (flags & 0x08) {
    energyExpended = dataView.getUint16(offset, true)
    offset += 2
  }

  // RR 间隔（心率变异性）
  const rrIntervals = []
  if (flags & 0x10) {
    while (offset < dataView.byteLength) {
      const rr = dataView.getUint16(offset, true)
      rrIntervals.push(rr / 1024) // 转换为秒
      offset += 2
    }
  }

  return { heartRate, contactDetected, energyExpended, rrIntervals }
}
```

### 连接流程图

```
用户点击连接按钮
    ↓
navigator.bluetooth.requestDevice()  [弹出设备选择器]
    ↓
device.gatt.connect()  [建立 GATT 连接]
    ↓
getPrimaryService('heart_rate')  [获取心率服务]
    ↓
getCharacteristic('heart_rate_measurement')  [获取特征]
    ↓
startNotifications()  [启动通知]
    ↓
监听 'characteristicvaluechanged' 事件  [接收数据]
```

---

## 🔐 安全与隐私

### 数据存储

- ✅ **本地存储**: 心率数据仅存储在浏览器 LocalStorage
- ✅ **不上传**: 不发送到任何远程服务器
- ✅ **自动清理**: 每日零点自动清除历史数据

### 权限要求

- 📍 **蓝牙权限**: 需要用户明确授权
- 🔒 **HTTPS**: 必须在安全上下文中运行
- 👆 **用户手势**: 连接必须由用户操作触发

---

## 📈 性能优化建议

### 1. 减少历史记录频率

默认每次心率更新都保存，高频率训练时可能产生大量数据：

```javascript
// 改为每 10 秒保存一次
if (!lastRecord || now - lastRecord.timestamp > 10000) {
  this.heartRateHistory.push(...)
}
```

### 2. 限制历史记录数量

```javascript
// 最多保存 1000 条记录
if (this.heartRateHistory.length > 1000) {
  this.heartRateHistory.shift()
}
```

### 3. 使用 Web Worker 处理数据

对于复杂的心率分析算法，可以移到 Worker 中执行：

```javascript
// worker.js
self.addEventListener('message', (e) => {
  const { heartRateData } = e.data
  // 执行复杂计算
  const result = analyzeHeartRateVariability(heartRateData)
  self.postMessage(result)
})
```

---

## 🚀 部署建议

### GitHub Pages

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 部署到 GitHub Pages
npm run deploy
```

### Vercel / Netlify

1. 连接 Git 仓库
2. 设置构建命令: `npm run build`
3. 设置输出目录: `dist`
4. 自动部署

---

## 📦 完整项目结构

```
your-project/
├── src/
│   ├── stores/
│   │   └── heartRate.js          # 核心状态管理 (必需)
│   ├── components/
│   │   ├── HeartRateMonitor.vue  # 心率卡片组件
│   │   └── HeartRateChart.vue    # 图表组件
│   └── views/
│       └── HeartRatePage.vue     # 独立页面
├── package.json
└── vite.config.js
```

---

## 🔗 相关资源

### 官方文档
- [Web Bluetooth API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [Heart Rate Service Specification](https://www.bluetooth.com/specifications/specs/heart-rate-service-1-0/)
- [GATT Services](https://www.bluetooth.com/specifications/gatt/services/)

### 浏览器兼容性
- [Can I Use - Web Bluetooth](https://caniuse.com/web-bluetooth)

### 推荐硬件
- [Garmin HRM-Dual 官网](https://www.garmin.com/en-US/p/561205)
- [Polar H10](https://www.polar.com/en/sensors/h10-heart-rate-sensor)
- [Wahoo TICKR](https://www.wahoofitness.com/devices/heart-rate-monitors)

---

## 📝 授权协议

本库采用 MIT 授权协议，可自由用于商业和开源项目。

---

## 💬 支持与反馈

### 遇到问题？

1. 查看 [常见问题](#-常见问题) 章节
2. 检查浏览器控制台的错误信息
3. 查看 Debug 日志面板

### 功能建议

欢迎提交功能建议和改进意见！

---

## 📊 更新日志

### v1.0.0 (2025-01-11)
- ✅ 初始版本发布
- ✅ 支持标准 BLE Heart Rate Profile
- ✅ Garmin HRM-Dual 完整支持
- ✅ 心率区间分析
- ✅ 历史图表可视化
- ✅ 危险心率提醒

---

## 🎉 快速示例

### 最小可运行示例

创建一个最简单的心率监测应用：

```vue
<!-- App.vue -->
<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">心率监测</h1>

    <button
      @click="connect"
      class="px-4 py-2 bg-blue-500 text-white rounded"
    >
      {{ hr.isConnected ? '断开' : '连接心率带' }}
    </button>

    <div v-if="hr.isConnected" class="mt-4">
      <div class="text-6xl font-bold">
        {{ hr.currentHeartRate }}
        <span class="text-2xl">BPM</span>
      </div>
      <div class="text-xl mt-2">
        {{ hr.currentZoneName }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHeartRateStore } from './stores/heartRate'

const hr = useHeartRateStore()

const connect = async () => {
  if (hr.isConnected) {
    hr.disconnect()
  } else {
    try {
      await hr.connect()
    } catch (error) {
      alert('连接失败: ' + error.message)
    }
  }
}
</script>
```

只需 30 行代码，即可实现完整的心率监测功能！

---

**🎯 开始使用**: 复制 `src/stores/heartRate.js` 到你的项目，3 分钟即可完成整合！
