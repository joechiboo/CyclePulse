<template>
  <div class="heart-rate-page h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-y-auto">
    <div class="max-w-2xl mx-auto p-4 pb-32">
      <!-- 標題 -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2">❤️ 心率監測</h1>
        <p class="text-gray-400">Garmin HRM 200 即時監測</p>
      </div>

      <!-- 主要心率顯示卡片 -->
      <div
        class="heart-rate-card rounded-3xl p-10 mb-6 border-4 transition-all duration-300"
        :class="displayCardClass"
      >
        <div class="text-center">
          <!-- 心跳圖示 -->
          <div class="heart-icon text-7xl mb-6" :class="{ 'beating': isConnected && currentHeartRate > 0 }">
            ❤️
          </div>

          <!-- 心率數值 -->
          <div class="text-8xl font-bold mb-2">
            {{ isConnected ? currentHeartRate : '--' }}
          </div>
          <div class="text-2xl text-gray-400 mb-6">BPM</div>

          <!-- 狀態訊息 -->
          <div
            v-if="isConnected && currentHeartRate > 0"
            class="status-message px-6 py-3 rounded-2xl font-medium text-lg"
            :class="statusMessageClass"
          >
            {{ statusMessage }}
          </div>

          <!-- 電池狀態 -->
          <div v-if="batteryLevel !== null" class="mt-4 text-gray-400">
            🔋 {{ batteryLevel }}%
          </div>
        </div>
      </div>

      <!-- 心率資訊網格 -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="info-card bg-gray-800 bg-opacity-50 rounded-2xl p-6 text-center">
          <div class="text-sm text-gray-400 mb-2">當前區間</div>
          <div class="text-3xl font-bold">{{ currentZoneName }}</div>
        </div>
        <div class="info-card bg-gray-800 bg-opacity-50 rounded-2xl p-6 text-center">
          <div class="text-sm text-gray-400 mb-2">最大心率</div>
          <div class="text-3xl font-bold">{{ maxHeartRate }}</div>
        </div>
      </div>

      <!-- 心率進度條 -->
      <div class="mb-6">
        <div class="h-10 bg-gray-700 rounded-full overflow-hidden mb-2">
          <div
            class="h-full transition-all duration-300 flex items-center justify-end px-4 font-bold"
            :style="{
              width: `${getProgressBarWidth()}%`,
              backgroundColor: zoneColor
            }"
          >
            {{ currentHeartRate > 0 ? currentHeartRate : '' }}
          </div>
        </div>
        <div class="flex justify-between text-xs text-gray-500">
          <span>50</span>
          <span>130</span>
          <span>150</span>
          <span>165</span>
          <span>180</span>
          <span>200</span>
        </div>
      </div>

      <!-- 連接按鈕 -->
      <div class="text-center text-sm text-gray-400 mb-4">
        {{ infoText }}
      </div>
      <button
        @click="toggleConnection"
        class="w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300"
        :class="connectButtonClass"
      >
        {{ isConnected ? '🔌 中斷連接' : '📡 連接心率帶' }}
      </button>
    </div>

    <!-- 浮動按鈕 -->
    <button
      @click="showHistory = true"
      class="fixed bottom-36 right-4 w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-lg hover:scale-110 active:scale-95 z-40"
      title="心率歷程"
    >
      📈
    </button>

    <button
      @click="showZoneInfo = true"
      class="fixed bottom-20 right-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-lg hover:scale-110 active:scale-95 z-40"
      title="心率區間說明"
    >
      📊
    </button>

    <button
      @click="toggleDebug"
      class="fixed bottom-4 right-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-lg hover:scale-110 active:scale-95 z-40"
      title="Debug 面板"
    >
      🐛
    </button>

    <!-- 心率區間說明 Modal -->
    <div
      v-if="showZoneInfo"
      class="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
      @click.self="showZoneInfo = false"
    >
      <div class="bg-gray-800 rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">📊 心率區間說明</h3>
          <button
            @click="showZoneInfo = false"
            class="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between py-3 border-b border-gray-700">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg" style="background: #3b82f6;"></div>
              <span class="font-medium">輕鬆區間</span>
            </div>
            <span class="text-gray-400">&lt; 130</span>
          </div>
          <div class="flex items-center justify-between py-3 border-b border-gray-700">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg" style="background: #10b981;"></div>
              <span class="font-medium">燃脂區間</span>
            </div>
            <span class="text-gray-400">130-150</span>
          </div>
          <div class="flex items-center justify-between py-3 border-b border-gray-700">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg" style="background: #f59e0b;"></div>
              <span class="font-medium">有氧訓練</span>
            </div>
            <span class="text-gray-400">150-165</span>
          </div>
          <div class="flex items-center justify-between py-3 border-b border-gray-700">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg" style="background: #ef4444;"></div>
              <span class="font-medium">高強度</span>
            </div>
            <span class="text-gray-400">165-180</span>
          </div>
          <div class="flex items-center justify-between py-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg" style="background: #dc2626;"></div>
              <span class="font-medium">危險區間</span>
            </div>
            <span class="text-gray-400">&gt; 180</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 心率歷程 Modal -->
    <div
      v-if="showHistory"
      class="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
      @click.self="showHistory = false"
    >
      <div class="bg-gray-800 rounded-3xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-6 flex-1">
            <h3 class="text-xl font-bold">📈 今日心率歷程</h3>
            <div v-if="heartRateHistory.length > 0" class="hidden landscape:flex items-center gap-4 md:gap-6 text-sm">
              <div class="text-center">
                <div class="text-xs text-gray-400">平均</div>
                <div class="font-bold text-blue-400">{{ Math.round(heartRateHistory.reduce((acc, item) => acc + item.heartRate, 0) / heartRateHistory.length) }}</div>
              </div>
              <div class="text-center">
                <div class="text-xs text-gray-400">最高</div>
                <div class="font-bold text-red-400">{{ Math.max(...heartRateHistory.map(item => item.heartRate)) }}</div>
              </div>
              <div class="text-center">
                <div class="text-xs text-gray-400">最低</div>
                <div class="font-bold text-green-400">{{ Math.min(...heartRateHistory.map(item => item.heartRate)) }}</div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <button
              v-if="heartRateHistory.length > 0"
              @click="clearHistory"
              class="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              清除
            </button>
            <button
              @click="showHistory = false"
              class="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <HeartRateChart
          v-if="heartRateHistory.length > 0"
          :heartRateHistory="heartRateHistory"
        />

        <div v-else class="text-center text-gray-500 py-12">
          <div class="text-5xl mb-3">📊</div>
          <p class="text-lg">尚無心率數據</p>
          <p class="text-sm mt-2">連接心率帶後開始記錄</p>
        </div>
      </div>
    </div>

    <!-- Debug 面板 Modal -->
    <div
      v-if="showDebug"
      class="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
      @click.self="toggleDebug"
    >
      <div class="bg-gray-900 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">🐛 Debug 面板</h3>
          <button
            @click="toggleDebug"
            class="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div v-if="debugLogs.length === 0" class="text-center text-gray-500 py-8">
          尚無 log 記錄
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="(log, index) in debugLogs"
            :key="index"
            class="debug-log-entry p-3 rounded-lg text-sm font-mono border-l-4"
            :class="{
              'border-blue-500 bg-blue-900 bg-opacity-20': log.type === 'info',
              'border-green-500 bg-green-900 bg-opacity-20': log.type === 'success',
              'border-red-500 bg-red-900 bg-opacity-20': log.type === 'error',
              'border-yellow-500 bg-yellow-900 bg-opacity-20': log.type === 'warning'
            }"
          >
            <span class="text-gray-400 mr-3">{{ log.timestamp }}</span>
            <span :class="{
              'text-blue-400': log.type === 'info',
              'text-green-400': log.type === 'success',
              'text-red-400': log.type === 'error',
              'text-yellow-400': log.type === 'warning'
            }">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch, onUnmounted } from 'vue'
import { useHeartRateStore } from '../stores/heartRate'
import HeartRateChart from '../components/HeartRateChart.vue'

export default {
  name: 'HeartRatePage',
  components: {
    HeartRateChart
  },
  setup() {
    const heartRateStore = useHeartRateStore()
    const infoText = ref('點擊按鈕開始連接您的心率帶')
    const showZoneInfo = ref(false)
    const showHistory = ref(false)

    const isConnected = computed(() => heartRateStore.isConnected)
    const currentHeartRate = computed(() => heartRateStore.currentHeartRate)
    const batteryLevel = computed(() => heartRateStore.batteryLevel)
    const currentZoneName = computed(() => heartRateStore.currentZoneName)
    const maxHeartRate = computed(() => heartRateStore.maxHeartRate)
    const heartRatePercentage = computed(() => heartRateStore.heartRatePercentage)
    const currentZone = computed(() => heartRateStore.currentZone)

    // Debug & Logging
    const debugLogs = computed(() => heartRateStore.debugLogs)
    const heartRateHistory = computed(() => heartRateStore.heartRateHistory)
    const showDebug = computed(() => heartRateStore.showDebug)

    // 獲取心率狀態（不依賴訓練強度，使用中等強度作為預設）
    const heartRateStatus = computed(() => {
      if (!isConnected.value) return null
      return heartRateStore.getHeartRateStatus('medium')
    })

    const statusMessage = computed(() => heartRateStatus.value?.message || '')

    // 顯示卡片樣式
    const displayCardClass = computed(() => {
      if (!isConnected.value) {
        return 'bg-gray-800 bg-opacity-50 border-gray-600'
      }

      const status = heartRateStatus.value?.status
      if (status === 'danger') {
        return 'bg-red-900 bg-opacity-30 border-red-500 animate-pulse'
      }
      if (status === 'high') {
        return 'bg-orange-900 bg-opacity-30 border-orange-500'
      }
      if (status === 'low') {
        return 'bg-blue-900 bg-opacity-30 border-blue-500'
      }
      return 'bg-green-900 bg-opacity-30 border-green-500'
    })

    // 狀態訊息樣式
    const statusMessageClass = computed(() => {
      const status = heartRateStatus.value?.status
      if (status === 'danger') return 'bg-red-500 text-white animate-shake'
      if (status === 'high') return 'bg-orange-500 text-white'
      if (status === 'low') return 'bg-blue-500 text-white'
      return 'bg-green-500 text-white'
    })

    // 連接按鈕樣式
    const connectButtonClass = computed(() => {
      if (isConnected.value) {
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:-translate-y-1 active:translate-y-0'
      }
      return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:-translate-y-1 active:translate-y-0'
    })

    // 區間顏色
    const zoneColor = computed(() => {
      if (!currentZone.value) return '#6b7280'
      return heartRateStore.heartRateZones[currentZone.value]?.color || '#6b7280'
    })

    // 計算進度條寬度（基於0-200的範圍）
    const getProgressBarWidth = () => {
      if (currentHeartRate.value === 0) return 0
      const minRange = 50
      const maxRange = 200
      const clampedHR = Math.max(minRange, Math.min(maxRange, currentHeartRate.value))
      return ((clampedHR - minRange) / (maxRange - minRange)) * 100
    }

    // 切換連接
    const toggleConnection = async () => {
      if (isConnected.value) {
        heartRateStore.disconnect()
        infoText.value = '已中斷連接'
        setTimeout(() => {
          infoText.value = '點擊按鈕開始連接您的心率帶'
        }, 2000)
      } else {
        infoText.value = '正在連接...'
        const success = await heartRateStore.connect()
        if (success) {
          infoText.value = '✅ 已連接，開始監測心率'
        } else {
          infoText.value = '❌ 連接失敗，請重試'
          setTimeout(() => {
            infoText.value = '點擊按鈕開始連接您的心率帶'
          }, 3000)
        }
      }
    }

    // 切換 debug 模式
    const toggleDebug = () => {
      heartRateStore.toggleDebug()
    }

    // 清除歷史數據
    const clearHistory = () => {
      heartRateStore.clearHistory()
    }

    // 監聽心率危險狀態
    watch(() => heartRateStatus.value?.status, (newStatus) => {
      if (newStatus === 'danger') {
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 200])
        }
      }
    })

    // 組件卸載時斷開連接
    onUnmounted(() => {
      // 可選：是否在離開頁面時自動斷開連接
      // heartRateStore.disconnect()
    })

    return {
      isConnected,
      currentHeartRate,
      batteryLevel,
      currentZoneName,
      maxHeartRate,
      heartRatePercentage,
      currentZone,
      statusMessage,
      displayCardClass,
      statusMessageClass,
      connectButtonClass,
      zoneColor,
      infoText,
      showZoneInfo,
      showHistory,
      debugLogs,
      heartRateHistory,
      showDebug,
      getProgressBarWidth,
      toggleConnection,
      toggleDebug,
      clearHistory
    }
  }
}
</script>

<style scoped>
.heart-icon {
  display: inline-block;
  transition: transform 0.1s;
}

.heart-icon.beating {
  animation: heartbeat 1s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  10%, 30% {
    transform: scale(1.15);
  }
  20%, 40% {
    transform: scale(1);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.animate-shake {
  animation: shake 0.5s ease-in-out infinite;
}

.animate-slideDown {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>
