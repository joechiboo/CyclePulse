<template>
  <div class="stage-container mb-6">
    <div class="stage-indicator" :class="stageClasses">
      {{ currentStageName }}
    </div>
    <div v-if="trainingStore.isTraining" class="text-center text-sm text-gray-400 mb-4">
      第 {{ currentStageIndex + 1 }} / {{ totalStages }} 階段
    </div>
    <div v-else-if="trainingStore.selectedMode" class="text-center text-sm text-gray-400 mb-4">
      共 {{ totalStages }} 個訓練階段
    </div>
    <div class="progress-container w-full max-w-md mx-auto">
      <div class="bg-gray-700 rounded-full h-2 mb-2">
        <div
          class="h-2 rounded-full transition-all duration-300"
          :class="progressBarClasses"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      <div class="text-center text-xs text-gray-400">
        訓練進度 {{ Math.round(overallProgress) }}%
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useTrainingStore } from '../stores/training'

export default {
  name: 'StageIndicator',
  setup() {
    const trainingStore = useTrainingStore()

    const currentStageName = computed(() => {
      if (!trainingStore.isTraining) {
        if (shouldShowError.value) {
          return '請先選擇訓練模式'
        }
        if (trainingStore.selectedMode) {
          return trainingStore.selectedMode.description
        }
        return '選擇模式開始訓練'
      }
      return trainingStore.currentStage?.name || '訓練中'
    })

    const shouldShowError = ref(false)

    // 監聽來自其他組件的驗證錯誤事件
    const handleValidationError = () => {
      shouldShowError.value = true
      setTimeout(() => {
        shouldShowError.value = false
      }, 3000)
    }

    // 暴露方法給其他組件使用
    window.showStageValidationError = handleValidationError

    const currentStageIndex = computed(() => {
      return trainingStore.currentStageIndex
    })

    const totalStages = computed(() => {
      return trainingStore.selectedMode?.stages?.length || 0
    })

    const progressPercentage = computed(() => {
      if (!trainingStore.currentStage) return 0
      const stageProgress = ((trainingStore.currentStage.duration - trainingStore.currentTime) / trainingStore.currentStage.duration) * 100
      return Math.max(0, Math.min(100, stageProgress))
    })

    const overallProgress = computed(() => {
      if (!trainingStore.currentMode) return 0
      const completedStages = trainingStore.currentStageIndex
      const currentStageProgress = progressPercentage.value / 100
      const totalProgress = (completedStages + currentStageProgress) / totalStages.value * 100
      return Math.max(0, Math.min(100, totalProgress))
    })

    const stageClasses = computed(() => ({
      'text-red-400': shouldShowError.value,
      'text-intensity-low': !shouldShowError.value && trainingStore.currentIntensity === 'low',
      'text-intensity-medium': !shouldShowError.value && trainingStore.currentIntensity === 'medium',
      'text-intensity-high': !shouldShowError.value && trainingStore.currentIntensity === 'high',
      'text-intensity-rest': !shouldShowError.value && trainingStore.currentIntensity === 'rest',
      'text-white': !shouldShowError.value && !trainingStore.currentIntensity
    }))

    const progressBarClasses = computed(() => ({
      'bg-intensity-low': trainingStore.currentIntensity === 'low',
      'bg-intensity-medium': trainingStore.currentIntensity === 'medium',
      'bg-intensity-high': trainingStore.currentIntensity === 'high',
      'bg-intensity-rest': trainingStore.currentIntensity === 'rest',
      'bg-white': !trainingStore.currentIntensity
    }))

    return {
      trainingStore,
      currentStageName,
      currentStageIndex,
      totalStages,
      progressPercentage,
      overallProgress,
      stageClasses,
      progressBarClasses,
      shouldShowError
    }
  }
}
</script>