<template>
  <div class="stage-container mb-6">
    <div class="stage-indicator" :class="stageClasses">
      {{ currentStageName }}
    </div>
    <div class="text-center text-sm text-gray-400 mb-4">
      第 {{ currentStageIndex + 1 }} / {{ totalStages }} 階段
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
import { computed } from 'vue'
import { useTrainingStore } from '../stores/training'

export default {
  name: 'StageIndicator',
  setup() {
    const trainingStore = useTrainingStore()

    const currentStageName = computed(() => {
      if (!trainingStore.currentStage) return '準備開始'
      return trainingStore.currentStage.name
    })

    const currentStageIndex = computed(() => {
      return trainingStore.currentStageIndex
    })

    const totalStages = computed(() => {
      return trainingStore.currentMode?.stages?.length || 0
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
      'text-intensity-low': trainingStore.currentIntensity === 'low',
      'text-intensity-medium': trainingStore.currentIntensity === 'medium',
      'text-intensity-high': trainingStore.currentIntensity === 'high',
      'text-intensity-rest': trainingStore.currentIntensity === 'rest',
      'text-white': !trainingStore.currentIntensity
    }))

    const progressBarClasses = computed(() => ({
      'bg-intensity-low': trainingStore.currentIntensity === 'low',
      'bg-intensity-medium': trainingStore.currentIntensity === 'medium',
      'bg-intensity-high': trainingStore.currentIntensity === 'high',
      'bg-intensity-rest': trainingStore.currentIntensity === 'rest',
      'bg-white': !trainingStore.currentIntensity
    }))

    return {
      currentStageName,
      currentStageIndex,
      totalStages,
      progressPercentage,
      overallProgress,
      stageClasses,
      progressBarClasses
    }
  }
}
</script>