<template>
  <div class="control-panel w-full max-w-md">
    <!-- Training Mode Selection -->
    <div v-if="!trainingStore.isTraining" class="mode-selection mb-6">
      <div class="mode-title text-center text-lg font-semibold mb-4">
        選擇訓練模式
        <span v-if="trainingStore.selectedMode" class="text-sm text-gray-400">
          ({{ trainingStore.selectedMode.duration }}分鐘)
        </span>
      </div>

      <!-- Validation Error Message -->
      <div
        v-if="showValidationError"
        class="validation-message mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 animate-shake"
      >
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="text-red-700 text-sm font-medium">
          請先選擇一個訓練模式再開始訓練
        </div>
      </div>

      <div
        class="grid grid-cols-4 gap-2 mb-6 transition-all duration-500"
        :class="{
          'ring-2 ring-red-400 ring-opacity-60 rounded-lg p-2 shadow-lg shadow-red-100': showValidationError,
          'animate-pulse': showValidationError
        }"
      >
        <button
          v-for="mode in availableModes"
          :key="mode.id"
          @click="selectMode(mode)"
          class="mode-button p-3 rounded-lg border-2 transition-all duration-200 active:scale-95 text-center"
          :class="selectedModeClasses(mode)"
        >
          <div class="font-semibold">{{ mode.name }}</div>
        </button>
      </div>
    </div>

    <!-- Control Buttons -->
    <div class="control-buttons space-y-4">
      <button
        v-if="!trainingStore.isTraining"
        @click="startTraining"
        :disabled="!trainingStore.selectedMode"
        class="btn-primary w-full text-xl py-4"
        :class="{ 'opacity-50 cursor-not-allowed': !trainingStore.selectedMode }"
      >
        🚴‍♀️ 開始訓練
      </button>

      <div v-else class="flex space-x-3">
        <button
          @click="togglePause"
          class="btn-secondary flex-1 text-lg py-3"
        >
          {{ trainingStore.isPaused ? '▶️ 繼續' : '⏸️ 暫停' }}
        </button>
        <button
          @click="stopTraining"
          class="btn-secondary flex-1 text-lg py-3 bg-red-600 border-red-600 hover:bg-red-700"
        >
          ⏹️ 結束
        </button>
      </div>

      <!-- Quick Settings -->
      <div v-if="!trainingStore.isTraining" class="quick-settings space-y-3">
        <div class="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer" @click="toggleSound">
          <span class="text-base font-medium">音效提醒</span>
          <button
            @click.stop="toggleSound"
            class="toggle-switch"
            :class="{ 'bg-green-500': soundEnabled, 'bg-gray-600': !soundEnabled }"
          >
            <div
              class="toggle-circle"
              :class="{ 'translate-x-8': soundEnabled, 'translate-x-1': !soundEnabled }"
            ></div>
          </button>
        </div>

        <!-- 防休眠提示 -->
        <div class="p-3 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-700">
          <div class="flex items-center space-x-2 mb-1">
            <span class="text-blue-400">📱</span>
            <span class="text-sm font-medium text-blue-300">防止螢幕休眠</span>
          </div>
          <p class="text-xs text-blue-200">
            訓練期間會自動防止手機螢幕關閉，確保計時器持續顯示
          </p>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useTrainingStore } from '../stores/training'

export default {
  name: 'ControlPanel',
  setup() {
    const trainingStore = useTrainingStore()
    const soundEnabled = ref(true)
    const showValidationError = ref(false)

    const availableModes = computed(() => trainingStore.availableModes)

    // 組件掛載時自動選擇經典模式
    onMounted(() => {
      if (!trainingStore.selectedMode) {
        const classicMode = trainingStore.availableModes.find(mode => mode.id === 'classic-interval')
        if (classicMode) {
          trainingStore.selectMode(classicMode)
        }
      }
    })

    const selectMode = (mode) => {
      trainingStore.selectMode(mode)
      showValidationError.value = false // 清除驗證錯誤
    }

    const selectedModeClasses = (mode) => {
      const isSelected = trainingStore.selectedMode?.id === mode.id
      return {
        'border-white bg-white text-cycle-dark': isSelected,
        'border-gray-600 text-white hover:border-white': !isSelected
      }
    }

    const startTraining = () => {
      if (trainingStore.selectedMode) {
        trainingStore.startTraining()
        showValidationError.value = false
      } else {
        // 顯示驗證錯誤
        showValidationError.value = true
        setTimeout(() => {
          showValidationError.value = false
        }, 3000) // 3秒後自動消失
      }
    }

    const togglePause = () => {
      trainingStore.togglePause()
    }

    const stopTraining = () => {
      trainingStore.stopTraining()
    }

    const toggleSound = () => {
      soundEnabled.value = !soundEnabled.value
      // TODO: Implement sound settings
    }

    return {
      trainingStore,
      soundEnabled,
      showValidationError,
      availableModes,
      selectMode,
      selectedModeClasses,
      startTraining,
      togglePause,
      stopTraining,
      toggleSound
    }
  }
}
</script>

<style scoped>
.toggle-switch {
  @apply relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-200;
}

.toggle-circle {
  @apply h-6 w-6 transform rounded-full bg-white transition-transform duration-200 shadow-sm;
}

/* 搖擺動畫 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

.animate-shake {
  animation: shake 0.6s ease-in-out;
}

/* 驗證錯誤的樣式增強 */
.validation-message {
  backdrop-filter: blur(8px);
  border-left: 4px solid #ef4444;
}
</style>