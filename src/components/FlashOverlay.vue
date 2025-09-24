<template>
  <transition name="flash">
    <div
      v-if="shouldFlash"
      class="flash-overlay fixed inset-0 pointer-events-none z-50"
      :class="flashClasses"
    >
      <div class="flex items-center justify-center h-full">
        <div class="text-center">
          <div class="text-4xl font-bold mb-2">
            {{ flashMessage }}
          </div>
          <div v-if="flashSubMessage" class="text-xl opacity-75">
            {{ flashSubMessage }}
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useTrainingStore } from '../stores/training'

export default {
  name: 'FlashOverlay',
  setup() {
    const trainingStore = useTrainingStore()
    const shouldFlash = ref(false)
    const flashMessage = ref('')
    const flashSubMessage = ref('')
    const currentFlashType = ref('')

    const flashClasses = computed(() => ({
      'flash-stage-change': currentFlashType.value === 'stageChange',
      'flash-countdown': currentFlashType.value === 'countdown',
      'flash-high-intensity': currentFlashType.value === 'highIntensity',
      'flash-rest': currentFlashType.value === 'rest'
    }))

    const triggerFlash = (type, message, subMessage = '', duration = 1000) => {
      currentFlashType.value = type
      flashMessage.value = message
      flashSubMessage.value = subMessage
      shouldFlash.value = true

      setTimeout(() => {
        shouldFlash.value = false
      }, duration)
    }

    // 監聽階段變化
    watch(
      () => trainingStore.currentStageIndex,
      (newIndex, oldIndex) => {
        if (oldIndex !== undefined && newIndex !== oldIndex) {
          const stage = trainingStore.currentStage
          if (stage) {
            triggerFlash('stageChange', stage.name, `${stage.duration}秒`, 1500)
          }
        }
      }
    )

    // 監聽強度變化
    watch(
      () => trainingStore.currentIntensity,
      (newIntensity, oldIntensity) => {
        if (oldIntensity && newIntensity !== oldIntensity) {
          const intensityMessages = {
            low: { message: '輕鬆騎行', sub: '保持穩定節奏' },
            medium: { message: '加速前進', sub: '提升踩踏頻率' },
            high: { message: '全力衝刺', sub: '挑戰極限！' },
            rest: { message: '恢復時間', sub: '調整呼吸' }
          }

          const config = intensityMessages[newIntensity]
          if (config) {
            triggerFlash(
              newIntensity === 'high' ? 'highIntensity' :
              newIntensity === 'rest' ? 'rest' : 'stageChange',
              config.message,
              config.sub,
              1200
            )
          }
        }
      }
    )

    // 監聽倒數警告
    watch(
      () => trainingStore.currentTime,
      (time) => {
        if (time === 10 && trainingStore.isTraining && !trainingStore.isPaused) {
          triggerFlash('countdown', '10', '準備切換', 800)
        } else if (time === 5 && trainingStore.isTraining && !trainingStore.isPaused) {
          triggerFlash('countdown', '5', '', 600)
        } else if (time === 3 && trainingStore.isTraining && !trainingStore.isPaused) {
          triggerFlash('countdown', '3', '', 400)
        }
      }
    )

    // 監聽訓練狀態變化
    watch(
      () => trainingStore.isTraining,
      (isTraining) => {
        if (isTraining) {
          triggerFlash('stageChange', '開始訓練', '加油！', 1500)
        }
      }
    )

    return {
      shouldFlash,
      flashMessage,
      flashSubMessage,
      flashClasses,
      triggerFlash
    }
  }
}
</script>

<style scoped>
.flash-overlay {
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.flash-stage-change {
  @apply bg-blue-900 bg-opacity-90;
}

.flash-countdown {
  @apply bg-yellow-900 bg-opacity-90;
}

.flash-high-intensity {
  @apply bg-red-900 bg-opacity-90;
  animation: pulse-intense 0.3s ease-in-out infinite;
}

.flash-rest {
  @apply bg-green-900 bg-opacity-90;
}

.flash-enter-active {
  transition: all 0.3s ease-out;
}

.flash-leave-active {
  transition: all 0.5s ease-in;
}

.flash-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.flash-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

@keyframes pulse-intense {
  0%, 100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.02);
    opacity: 1;
  }
}
</style>