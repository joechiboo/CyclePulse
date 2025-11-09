import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useHeartRateStore = defineStore('heartRate', () => {
  // State
  const device = ref(null)
  const server = ref(null)
  const isConnected = ref(false)
  const currentHeartRate = ref(0)
  const batteryLevel = ref(null)
  const isContactDetected = ref(false)
  const energyExpended = ref(0)
  const rrIntervals = ref([])
  const userAge = ref(38) // 預設年齡，可以讓用戶設定

  // Debug & Logging
  const debugLogs = ref([])
  const heartRateHistory = ref([]) // { timestamp, heartRate, zone }
  const showDebug = ref(false)

  // 計算最大心率 (220 - 年齡)
  const maxHeartRate = computed(() => 220 - userAge.value)

  // 心率區間計算
  const heartRateZones = computed(() => ({
    rest: { min: 0, max: maxHeartRate.value * 0.5, color: '#6b7280' }, // 休息
    warmup: { min: maxHeartRate.value * 0.5, max: maxHeartRate.value * 0.6, color: '#3b82f6' }, // 暖身
    fatBurn: { min: maxHeartRate.value * 0.6, max: maxHeartRate.value * 0.7, color: '#10b981' }, // 燃脂
    cardio: { min: maxHeartRate.value * 0.7, max: maxHeartRate.value * 0.8, color: '#f59e0b' }, // 有氧
    peak: { min: maxHeartRate.value * 0.8, max: maxHeartRate.value * 0.9, color: '#ef4444' }, // 高強度
    danger: { min: maxHeartRate.value * 0.9, max: maxHeartRate.value * 1.1, color: '#dc2626' } // 危險
  }))

  // 當前心率區間
  const currentZone = computed(() => {
    const hr = currentHeartRate.value
    if (hr === 0) return null

    if (hr >= heartRateZones.value.danger.min) return 'danger'
    if (hr >= heartRateZones.value.peak.min) return 'peak'
    if (hr >= heartRateZones.value.cardio.min) return 'cardio'
    if (hr >= heartRateZones.value.fatBurn.min) return 'fatBurn'
    if (hr >= heartRateZones.value.warmup.min) return 'warmup'
    return 'rest'
  })

  // 心率區間名稱
  const currentZoneName = computed(() => {
    const zoneNames = {
      danger: '危險區間',
      peak: '高強度',
      cardio: '有氧訓練',
      fatBurn: '燃脂區間',
      warmup: '暖身',
      rest: '休息'
    }
    return currentZone.value ? zoneNames[currentZone.value] : '--'
  })

  // 心率百分比 (相對於最大心率)
  const heartRatePercentage = computed(() => {
    if (currentHeartRate.value === 0) return 0
    return Math.round((currentHeartRate.value / maxHeartRate.value) * 100)
  })

  // 根據訓練強度判斷心率是否適當
  const getHeartRateStatus = (trainingIntensity) => {
    const hr = currentHeartRate.value
    if (hr === 0) return { status: 'disconnected', message: '未連接心率帶' }

    // 危險區間：180+ (接近最大心率 182)
    if (hr >= 180) {
      return { status: 'danger', message: '⚠️ 心率過高！請立即降低強度' }
    }

    // 高強度區間：165-180
    if (hr >= 165) {
      if (trainingIntensity === 'high') {
        return { status: 'warning', message: '⚡ 高強度區間，注意安全' }
      } else {
        return { status: 'high', message: '⚠️ 心率偏高，建議降低強度' }
      }
    }

    // 有氧訓練區間：150-165
    if (hr >= 150) {
      if (trainingIntensity === 'high' || trainingIntensity === 'medium') {
        return { status: 'normal', message: '✅ 有氧訓練區間，很好' }
      } else {
        return { status: 'high', message: '心率偏高' }
      }
    }

    // 燃脂區間：130-150
    if (hr >= 130) {
      if (trainingIntensity === 'high') {
        return { status: 'low', message: '💪 可以再加強一點' }
      }
      return { status: 'normal', message: '✅ 燃脂區間，保持' }
    }

    // 130以下：心率偏低
    if (trainingIntensity === 'rest' || trainingIntensity === 'low') {
      return { status: 'normal', message: '😌 輕鬆騎行' }
    }

    return { status: 'low', message: '💪 心率偏低，可以加強' }
  }

  // 解析心率數據
  const parseHeartRateData = (value) => {
    const flags = value.getUint8(0)
    const is16Bit = flags & 0x01
    let heartRate
    let index = 1

    if (is16Bit) {
      heartRate = value.getUint16(index, true)
      index += 2
    } else {
      heartRate = value.getUint8(index)
      index += 1
    }

    // Sensor Contact Status
    const contactSupported = flags & 0x04
    const contactDetected = flags & 0x02

    // Energy Expended
    const energyExpendedPresent = flags & 0x08
    let energyExpendedValue = null
    if (energyExpendedPresent) {
      energyExpendedValue = value.getUint16(index, true)
      index += 2
    }

    // RR Intervals
    const rrIntervalPresent = flags & 0x10
    const rrIntervalsArray = []
    if (rrIntervalPresent) {
      while (index < value.byteLength) {
        const rrValue = value.getUint16(index, true)
        rrIntervalsArray.push(rrValue / 1024 * 1000) // Convert to ms
        index += 2
      }
    }

    return {
      heartRate,
      contactSupported,
      contactDetected,
      energyExpended: energyExpendedValue,
      rrIntervals: rrIntervalsArray
    }
  }

  // Debug log 函數
  const addDebugLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString('zh-TW')
    debugLogs.value.unshift({
      timestamp,
      type, // 'info', 'success', 'error', 'warning'
      message
    })
    // 最多保留 50 條 log
    if (debugLogs.value.length > 50) {
      debugLogs.value.pop()
    }
    console.log(`[${type.toUpperCase()}] ${message}`)
  }

  // 記錄心率數據
  const logHeartRate = (heartRate) => {
    const now = new Date()
    const timestamp = now.getTime()

    // 計算當前區間
    let zone = 'rest'
    if (heartRate >= 180) zone = 'danger'
    else if (heartRate >= 165) zone = 'peak'
    else if (heartRate >= 150) zone = 'cardio'
    else if (heartRate >= 130) zone = 'fatBurn'
    else if (heartRate >= 50) zone = 'warmup'

    heartRateHistory.value.push({
      timestamp,
      heartRate,
      zone
    })

    // 只保留今天的數據
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    heartRateHistory.value = heartRateHistory.value.filter(
      item => item.timestamp >= todayStart.getTime()
    )
  }

  // 處理心率數據變化
  const handleHeartRateChange = (event) => {
    const value = event.target.value
    const data = parseHeartRateData(value)

    currentHeartRate.value = data.heartRate
    isContactDetected.value = data.contactDetected

    if (data.energyExpended !== null) {
      energyExpended.value = data.energyExpended
    }

    if (data.rrIntervals.length > 0) {
      rrIntervals.value = data.rrIntervals
    }

    // 記錄心率數據
    if (data.heartRate > 0) {
      logHeartRate(data.heartRate)
      addDebugLog('info', `心率更新: ${data.heartRate} BPM`)
    }
  }

  // 獲取電池電量
  const getBatteryLevel = async () => {
    try {
      const batteryService = await server.value.getPrimaryService('battery_service')
      const batteryCharacteristic = await batteryService.getCharacteristic('battery_level')
      const value = await batteryCharacteristic.readValue()
      batteryLevel.value = value.getUint8(0)
    } catch (error) {
      console.log('無法讀取電池資訊')
      batteryLevel.value = null
    }
  }

  // 連接心率帶
  const connect = async () => {
    try {
      addDebugLog('info', '開始搜尋藍牙設備...')

      device.value = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] }
        ],
        optionalServices: ['battery_service', 'device_information']
      })

      addDebugLog('success', `找到設備: ${device.value.name || '未命名設備'}`)

      device.value.addEventListener('gattserverdisconnected', () => {
        addDebugLog('warning', '設備已斷開連接')
        disconnect()
      })

      addDebugLog('info', '正在連接 GATT 伺服器...')
      server.value = await device.value.gatt.connect()
      addDebugLog('success', 'GATT 伺服器連接成功')

      // Get Heart Rate Service
      addDebugLog('info', '正在獲取心率服務...')
      const heartRateService = await server.value.getPrimaryService('heart_rate')
      const heartRateCharacteristic = await heartRateService.getCharacteristic('heart_rate_measurement')

      addDebugLog('info', '開始監聽心率數據...')
      await heartRateCharacteristic.startNotifications()
      heartRateCharacteristic.addEventListener('characteristicvaluechanged', handleHeartRateChange)
      addDebugLog('success', '心率通知已啟動')

      // Get Battery Level
      await getBatteryLevel()

      isConnected.value = true
      addDebugLog('success', '✅ 連接成功！')

      return true
    } catch (error) {
      addDebugLog('error', `連接失敗: ${error.message}`)
      console.error('連接失敗:', error)
      return false
    }
  }

  // 斷開連接
  const disconnect = () => {
    if (device.value && device.value.gatt.connected) {
      device.value.gatt.disconnect()
    }

    addDebugLog('info', '已斷開連接')

    device.value = null
    server.value = null
    isConnected.value = false
    currentHeartRate.value = 0
    batteryLevel.value = null
    isContactDetected.value = false
    energyExpended.value = 0
    rrIntervals.value = []
  }

  // 清除歷史數據
  const clearHistory = () => {
    heartRateHistory.value = []
    addDebugLog('info', '已清除歷史數據')
  }

  // 切換 debug 模式
  const toggleDebug = () => {
    showDebug.value = !showDebug.value
  }

  // 設定用戶年齡
  const setUserAge = (age) => {
    if (age >= 10 && age <= 100) {
      userAge.value = age
    }
  }

  return {
    // State
    device,
    isConnected,
    currentHeartRate,
    batteryLevel,
    isContactDetected,
    energyExpended,
    rrIntervals,
    userAge,

    // Debug & Logging
    debugLogs,
    heartRateHistory,
    showDebug,

    // Computed
    maxHeartRate,
    heartRateZones,
    currentZone,
    currentZoneName,
    heartRatePercentage,

    // Actions
    connect,
    disconnect,
    getHeartRateStatus,
    setUserAge,
    clearHistory,
    toggleDebug,
    addDebugLog
  }
})
