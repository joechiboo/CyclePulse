import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTrainingStore = defineStore('training', () => {
  // State
  const isTraining = ref(false)
  const isPaused = ref(false)
  const currentTime = ref(0)
  const currentStageIndex = ref(0)
  const selectedMode = ref(null)
  const timerInterval = ref(null)

  // 預設訓練模式
  const availableModes = ref([
    {
      id: 'classic-interval',
      name: '經典',
      duration: 18,
      description: '暖身 + 10輪間歇 + 收操',
      stages: [
        { name: '暖身準備', duration: 300, intensity: 'low' }, // 5分鐘
        { name: '高強度衝刺', duration: 30, intensity: 'high' },
        { name: '恢復騎行', duration: 30, intensity: 'low' },
        { name: '高強度衝刺', duration: 30, intensity: 'high' },
        { name: '恢復騎行', duration: 30, intensity: 'low' },
        { name: '高強度衝刺', duration: 30, intensity: 'high' },
        { name: '恢復騎行', duration: 30, intensity: 'low' },
        { name: '高強度衝刺', duration: 30, intensity: 'high' },
        { name: '恢復騎行', duration: 30, intensity: 'low' },
        { name: '高強度衝刺', duration: 30, intensity: 'high' },
        { name: '恢復騎行', duration: 30, intensity: 'low' },
        { name: '高強度衝刺', duration: 30, intensity: 'high' },
        { name: '恢復騎行', duration: 30, intensity: 'low' },
        { name: '高強度衝刺', duration: 30, intensity: 'high' },
        { name: '恢復騎行', duration: 30, intensity: 'low' },
        { name: '高強度衝刺', duration: 30, intensity: 'high' },
        { name: '恢復騎行', duration: 30, intensity: 'low' },
        { name: '高強度衝刺', duration: 30, intensity: 'high' },
        { name: '恢復騎行', duration: 30, intensity: 'low' },
        { name: '緩和收操', duration: 180, intensity: 'rest' } // 3分鐘
      ]
    },
    {
      id: 'hill-climb',
      name: '爬坡',
      duration: 18,
      description: '暖身 + 3輪爬坡 + 收操',
      stages: [
        { name: '暖身準備', duration: 300, intensity: 'low' }, // 5分鐘
        { name: '爬坡準備', duration: 120, intensity: 'medium' }, // 2分鐘
        { name: '陡坡衝刺', duration: 60, intensity: 'high' }, // 1分鐘
        { name: '爬坡準備', duration: 120, intensity: 'medium' },
        { name: '陡坡衝刺', duration: 60, intensity: 'high' },
        { name: '爬坡準備', duration: 120, intensity: 'medium' },
        { name: '陡坡衝刺', duration: 60, intensity: 'high' },
        { name: '下坡恢復', duration: 120, intensity: 'low' },
        { name: '緩和收操', duration: 180, intensity: 'rest' } // 3分鐘
      ]
    },
    {
      id: 'endurance',
      name: '長距離',
      duration: 18,
      description: '暖身 + 持續中強度 + 收操',
      stages: [
        { name: '暖身準備', duration: 300, intensity: 'low' }, // 5分鐘
        { name: '持續騎行', duration: 600, intensity: 'medium' }, // 10分鐘
        { name: '緩和收操', duration: 180, intensity: 'rest' } // 3分鐘
      ]
    },
    {
      id: 'fat-burn',
      name: '快速燃脂',
      duration: 17,
      description: '短暖身 + 高變化間歇 + 短收操',
      stages: [
        { name: '快速暖身', duration: 180, intensity: 'low' }, // 3分鐘
        { name: '中強度', duration: 90, intensity: 'medium' }, // 1.5分鐘
        { name: '衝刺', duration: 30, intensity: 'high' },
        { name: '恢復', duration: 60, intensity: 'low' },
        { name: '中強度', duration: 90, intensity: 'medium' },
        { name: '衝刺', duration: 30, intensity: 'high' },
        { name: '恢復', duration: 60, intensity: 'low' },
        { name: '中強度', duration: 90, intensity: 'medium' },
        { name: '衝刺', duration: 30, intensity: 'high' },
        { name: '恢復', duration: 60, intensity: 'low' },
        { name: '中強度', duration: 90, intensity: 'medium' },
        { name: '衝刺', duration: 30, intensity: 'high' },
        { name: '恢復', duration: 60, intensity: 'low' },
        { name: '中強度', duration: 90, intensity: 'medium' },
        { name: '衝刺', duration: 30, intensity: 'high' },
        { name: '恢復', duration: 60, intensity: 'low' },
        { name: '快速收操', duration: 120, intensity: 'rest' } // 2分鐘
      ]
    }
  ])

  // Computed
  const currentStage = computed(() => {
    if (!selectedMode.value?.stages || currentStageIndex.value >= selectedMode.value.stages.length) {
      return null
    }
    return selectedMode.value.stages[currentStageIndex.value]
  })

  const currentIntensity = computed(() => {
    return currentStage.value?.intensity || null
  })

  const totalTrainingTime = computed(() => {
    if (!selectedMode.value?.stages) return 0
    return selectedMode.value.stages.reduce((total, stage) => total + stage.duration, 0)
  })

  // Actions
  const selectMode = (mode) => {
    if (!isTraining.value) {
      selectedMode.value = mode
    }
  }

  const startTraining = () => {
    if (!selectedMode.value || isTraining.value) return

    isTraining.value = true
    isPaused.value = false
    currentStageIndex.value = 0
    currentTime.value = selectedMode.value.stages[0]?.duration || 0

    startTimer()
  }

  const startTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }

    timerInterval.value = setInterval(() => {
      if (!isPaused.value && isTraining.value) {
        currentTime.value--

        if (currentTime.value <= 0) {
          nextStage()
        }
      }
    }, 1000)
  }

  const nextStage = () => {
    const nextIndex = currentStageIndex.value + 1

    if (nextIndex >= selectedMode.value.stages.length) {
      // 訓練完成
      completeTraining()
    } else {
      // 切換到下一階段
      currentStageIndex.value = nextIndex
      currentTime.value = selectedMode.value.stages[nextIndex].duration
    }
  }

  const completeTraining = () => {
    isTraining.value = false
    isPaused.value = false
    currentStageIndex.value = 0
    currentTime.value = 0

    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }

    // 這裡可以添加訓練完成的邏輯，如記錄數據、顯示成果等
    console.log('訓練完成！')
  }

  const togglePause = () => {
    if (!isTraining.value) return

    isPaused.value = !isPaused.value
  }

  const stopTraining = () => {
    isTraining.value = false
    isPaused.value = false
    currentStageIndex.value = 0
    currentTime.value = 0

    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  const resetTraining = () => {
    stopTraining()
    selectedMode.value = null
  }

  // 初始化時設定經典模式為預設
  const initializeDefaultMode = () => {
    if (!selectedMode.value) {
      selectedMode.value = availableModes.value.find(mode => mode.id === 'classic-interval')
    }
  }

  // 自動初始化預設模式
  initializeDefaultMode()

  return {
    // State
    isTraining,
    isPaused,
    currentTime,
    currentStageIndex,
    selectedMode,
    availableModes,

    // Computed
    currentStage,
    currentIntensity,
    totalTrainingTime,

    // Actions
    selectMode,
    startTraining,
    togglePause,
    stopTraining,
    resetTraining
  }
})