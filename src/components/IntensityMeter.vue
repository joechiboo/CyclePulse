<template>
  <div class="intensity-meter">
    <div class="text-center text-sm text-gray-300 mb-2">
      強度等級
    </div>
    <div class="flex justify-between items-center mb-2">
      <span class="text-xs text-gray-400">輕鬆</span>
      <span class="text-xs text-gray-400">極限</span>
    </div>
    <div class="intensity-bar-container bg-gray-700 rounded-full h-6 relative overflow-hidden">
      <div
        class="intensity-bar h-full transition-all duration-500 ease-out"
        :class="intensityClasses"
        :style="{ width: intensityWidth + '%' }"
      >
        <div class="h-full w-full rounded-full" :class="intensityGradient"></div>
      </div>
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-xs font-bold text-white mix-blend-difference">
          {{ intensityLabel }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useTrainingStore } from '../stores/training'

export default {
  name: 'IntensityMeter',
  setup() {
    const trainingStore = useTrainingStore()

    const intensityConfig = {
      rest: { width: 10, label: '休息', classes: 'bg-intensity-rest' },
      low: { width: 30, label: '輕鬆', classes: 'bg-intensity-low' },
      medium: { width: 65, label: '中等', classes: 'bg-intensity-medium' },
      high: { width: 100, label: '高強度', classes: 'bg-intensity-high' }
    }

    const currentIntensity = computed(() => {
      return trainingStore.currentIntensity || 'rest'
    })

    const intensityWidth = computed(() => {
      return intensityConfig[currentIntensity.value]?.width || 0
    })

    const intensityLabel = computed(() => {
      return intensityConfig[currentIntensity.value]?.label || '準備'
    })

    const intensityClasses = computed(() => {
      const config = intensityConfig[currentIntensity.value]
      return config?.classes || 'bg-gray-500'
    })

    const intensityGradient = computed(() => {
      switch (currentIntensity.value) {
        case 'high':
          return 'animate-pulse-fast'
        case 'medium':
          return 'animate-pulse-slow'
        default:
          return ''
      }
    })

    return {
      intensityWidth,
      intensityLabel,
      intensityClasses,
      intensityGradient
    }
  }
}
</script>