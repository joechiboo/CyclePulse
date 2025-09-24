<template>
  <div class="timer-container mb-8">
    <div
      v-if="trainingStore.isTraining"
      class="timer-display"
      :class="timerClasses"
    >
      {{ formattedTime }}
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useTrainingStore } from '../stores/training'

export default {
  name: 'TimerDisplay',
  setup() {
    const trainingStore = useTrainingStore()

    const formattedTime = computed(() => {
      const minutes = Math.floor(trainingStore.currentTime / 60)
      const seconds = trainingStore.currentTime % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    })

    const timerClasses = computed(() => ({
      'text-intensity-low': trainingStore.currentIntensity === 'low',
      'text-intensity-medium': trainingStore.currentIntensity === 'medium',
      'text-intensity-high': trainingStore.currentIntensity === 'high',
      'text-intensity-rest': trainingStore.currentIntensity === 'rest',
      'text-white': !trainingStore.currentIntensity,
      'animate-pulse-fast': trainingStore.currentIntensity === 'high',
      'animate-pulse-slow': trainingStore.currentIntensity === 'medium'
    }))

    return {
      formattedTime,
      timerClasses,
      trainingStore
    }
  }
}
</script>