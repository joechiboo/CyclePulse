<template>
  <div class="heart-rate-monitor">
    <!-- 心率顯示卡片 -->
    <div
      class="heart-rate-card rounded-xl p-4 shadow-lg transition-all duration-300"
      :class="cardClass"
    >
      <div class="flex items-center justify-between">
        <!-- 左側：心率顯示 -->
        <div class="flex items-center space-x-3">
          <div class="heart-icon" :class="{ 'beating': isConnected && currentHeartRate > 0 }">
            ❤️
          </div>
          <div>
            <div class="heart-rate-value text-3xl font-bold">
              {{ isConnected ? currentHeartRate : '--' }}
              <span class="text-sm font-normal opacity-75">BPM</span>
            </div>
            <div class="heart-rate-zone text-xs opacity-75 mt-1">
              {{ currentZoneName }}
            </div>
          </div>
        </div>

        <!-- 右側：狀態與連接按鈕 -->
        <div class="flex flex-col items-end space-y-2">
          <!-- 電池狀態 -->
          <div v-if="batteryLevel !== null" class="text-xs opacity-75">
            🔋 {{ batteryLevel }}%
          </div>

          <!-- 連接按鈕 -->
          <button
            @click="toggleConnection"
            class="connect-btn px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200"
            :class="isConnected ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'"
          >
            {{ isConnected ? '中斷' : '連接' }}
          </button>
        </div>
      </div>

      <!-- 警示訊息 -->
      <div
        v-if="isConnected && trainingStore.isTraining && statusMessage"
        class="status-message mt-3 p-2 rounded-lg text-sm font-medium text-center"
        :class="statusMessageClass"
      >
        {{ statusMessage }}
      </div>

      <!-- 心率進度條 -->
      <div v-if="isConnected && currentHeartRate > 0" class="mt-3">
        <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            class="h-full transition-all duration-300"
            :style="{
              width: `${Math.min(heartRatePercentage, 100)}%`,
              backgroundColor: zoneColor
            }"
          ></div>
        </div>
        <div class="flex justify-between text-xs opacity-50 mt-1">
          <span>0</span>
          <span>{{ maxHeartRate }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, watch } from 'vue'
import { useHeartRateStore } from '../stores/heartRate'
import { useTrainingStore } from '../stores/training'

export default {
  name: 'HeartRateMonitor',
  setup() {
    const heartRateStore = useHeartRateStore()
    const trainingStore = useTrainingStore()

    const isConnected = computed(() => heartRateStore.isConnected)
    const currentHeartRate = computed(() => heartRateStore.currentHeartRate)
    const batteryLevel = computed(() => heartRateStore.batteryLevel)
    const currentZoneName = computed(() => heartRateStore.currentZoneName)
    const maxHeartRate = computed(() => heartRateStore.maxHeartRate)
    const heartRatePercentage = computed(() => heartRateStore.heartRatePercentage)
    const currentZone = computed(() => heartRateStore.currentZone)

    // 獲取當前心率狀態
    const heartRateStatus = computed(() => {
      if (!isConnected.value || !trainingStore.isTraining) return null
      return heartRateStore.getHeartRateStatus(trainingStore.currentIntensity)
    })

    const statusMessage = computed(() => heartRateStatus.value?.message)

    // 卡片樣式
    const cardClass = computed(() => {
      if (!isConnected.value) {
        return 'bg-gray-800 text-gray-400'
      }

      const status = heartRateStatus.value?.status
      if (status === 'danger') {
        return 'bg-red-900 text-white border-2 border-red-500 animate-pulse'
      }
      if (status === 'high') {
        return 'bg-orange-900 text-white border border-orange-500'
      }
      if (status === 'low') {
        return 'bg-blue-900 text-white border border-blue-500'
      }

      return 'bg-green-900 text-white border border-green-500'
    })

    // 狀態訊息樣式
    const statusMessageClass = computed(() => {
      const status = heartRateStatus.value?.status
      if (status === 'danger') return 'bg-red-500 text-white'
      if (status === 'high') return 'bg-orange-500 text-white'
      if (status === 'low') return 'bg-blue-500 text-white'
      return 'bg-green-500 text-white'
    })

    // 區間顏色
    const zoneColor = computed(() => {
      if (!currentZone.value) return '#6b7280'
      return heartRateStore.heartRateZones[currentZone.value]?.color || '#6b7280'
    })

    // 切換連接
    const toggleConnection = async () => {
      if (isConnected.value) {
        heartRateStore.disconnect()
      } else {
        await heartRateStore.connect()
      }
    }

    // 監聽心率危險狀態，提供音效或震動提醒
    watch(() => heartRateStatus.value?.status, (newStatus) => {
      if (newStatus === 'danger') {
        // 可以加入音效或震動
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 200])
        }
      }
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
      cardClass,
      statusMessageClass,
      zoneColor,
      toggleConnection,
      trainingStore
    }
  }
}
</script>

<style scoped>
.heart-icon {
  font-size: 2rem;
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
    transform: scale(1.1);
  }
  20%, 40% {
    transform: scale(1);
  }
}

.connect-btn {
  min-width: 60px;
}

.status-message {
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
</style>
