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
          <div class="flex items-center space-x-3">
            <span class="text-base font-medium">音效提醒</span>
            <button
              v-if="soundEnabled"
              @click.stop="testSound"
              class="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
              title="測試音效"
            >
              🔊 測試
            </button>
          </div>
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

    const toggleSound = async () => {
      soundEnabled.value = !soundEnabled.value

      // 播放測試音效
      if (soundEnabled.value) {
        try {
          await playSound('switch')
          console.log('音效已啟用 🔊')
        } catch (error) {
          console.log('音效啟用失敗，可能需要用戶互動:', error)
          // 提示用戶再次點擊
          setTimeout(() => {
            if (soundEnabled.value) {
              playSound('switch')
            }
          }, 100)
        }
      } else {
        console.log('音效已關閉 🔇')
      }
    }

    // 音效播放功能
    const playSound = async (type) => {
      if (!soundEnabled.value) return

      try {
        // 使用 Web Audio API 產生音效
        let audioContext = window.cyclePulseAudioContext

        if (!audioContext) {
          audioContext = new (window.AudioContext || window.webkitAudioContext)()
          window.cyclePulseAudioContext = audioContext
        }

        // 如果 AudioContext 被暫停，嘗試恢復
        if (audioContext.state === 'suspended') {
          await audioContext.resume()
        }

        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // 設定音效波形為更柔和的 sine 波
        oscillator.type = 'sine'

        // 不同類型的音效
        switch (type) {
          case 'start':
            // 開始訓練：上升音調
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.5)
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.5)
            break

          case 'stage':
            // 階段切換：雙音調
            oscillator.frequency.setValueAtTime(660, audioContext.currentTime)
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.15)
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.3)
            break

          case 'complete':
            // 完成訓練：成功音調
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime) // C5
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.2) // E5
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.4) // G5
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)
            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.6)
            break

          case 'switch':
            // 切換音效：短促音調
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.1)
            break

          case 'countdown':
            // 倒數音效：低音調
            oscillator.frequency.setValueAtTime(220, audioContext.currentTime)
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.2)
            break
        }
      } catch (error) {
        console.log('音效播放失敗:', error)
      }
    }

    // 測試音效函數
    const testSound = async () => {
      try {
        await playSound('start')
        console.log('測試音效播放成功 🎵')
      } catch (error) {
        console.log('測試音效播放失敗:', error)
      }
    }

    // 暴露音效播放函數給其他組件使用
    window.playCyclePulseSound = playSound

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
      toggleSound,
      testSound
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

/* 直式螢幕優化 */
@media (orientation: portrait) and (max-height: 800px) {
  .control-panel {
    @apply space-y-2;
  }

  .mode-selection {
    @apply mb-3;
  }

  .mode-title {
    @apply mb-3 text-base;
  }

  .quick-settings {
    @apply space-y-2;
  }

  .quick-settings > * {
    @apply p-3;
  }

  .control-buttons {
    @apply space-y-3;
  }

  .btn-primary {
    @apply py-3 text-lg;
  }

  .btn-secondary {
    @apply py-2 text-base;
  }
}

/* 極小直式螢幕進一步優化 */
@media (orientation: portrait) and (max-height: 700px) {
  .mode-selection {
    @apply mb-2;
  }

  .mode-title {
    @apply text-sm mb-2;
  }

  .quick-settings > * {
    @apply p-2;
  }

  .quick-settings span {
    @apply text-sm;
  }

  .control-buttons {
    @apply space-y-2;
  }

  .btn-primary {
    @apply py-2 text-base;
  }

  .btn-secondary {
    @apply py-1 text-sm;
  }

  .toggle-switch {
    @apply h-6 w-12;
  }

  .toggle-circle {
    @apply h-4 w-4;
  }
}
</style>