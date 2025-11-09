<template>
  <div class="app-container h-screen overflow-y-auto bg-cycle-darker">
    <div class="flex flex-col min-h-full">
      <!-- 主要顯示區域 -->
      <div class="main-display flex-1 flex flex-col justify-center items-center p-4 pb-20">
        <TimerDisplay />
        <StageIndicator />
        <div class="w-full max-w-md mb-4">
          <IntensityMeter />
        </div>
        <div class="w-full max-w-md mb-8">
          <HeartRateMonitor />
        </div>
      </div>

      <!-- 控制面板區域 -->
      <div class="side-controls p-4 pb-24">
        <ControlPanel />
      </div>
    </div>

    <!-- 浮動按鈕 -->
    <button
      @click="showKnowledge = true"
      class="fixed bottom-20 right-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-lg hover:scale-110 active:scale-95 z-40"
      title="訓練指南"
    >
      📚
    </button>

    <button
      @click="showDonation = true"
      class="donation-float-btn fixed bottom-4 right-4 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-lg hover:scale-110 active:scale-95 z-40"
      title="支持開發者"
    >
      💝
    </button>

    <FlashOverlay />

    <!-- 訓練指南彈窗 -->
    <KnowledgeModal
      :isVisible="showKnowledge"
      @close="showKnowledge = false"
    />

    <!-- 贊助彈窗 -->
    <DonationModal
      :isVisible="showDonation"
      @close="showDonation = false"
    />
  </div>
</template>

<script>
import { ref } from 'vue'
import { useTrainingStore } from '../stores/training'
import TimerDisplay from '../components/TimerDisplay.vue'
import StageIndicator from '../components/StageIndicator.vue'
import IntensityMeter from '../components/IntensityMeter.vue'
import ControlPanel from '../components/ControlPanel.vue'
import FlashOverlay from '../components/FlashOverlay.vue'
import DonationModal from '../components/DonationModal.vue'
import KnowledgeModal from '../components/KnowledgeModal.vue'
import HeartRateMonitor from '../components/HeartRateMonitor.vue'

export default {
  name: 'TrainingPage',
  components: {
    TimerDisplay,
    StageIndicator,
    IntensityMeter,
    ControlPanel,
    FlashOverlay,
    DonationModal,
    KnowledgeModal,
    HeartRateMonitor
  },
  setup() {
    const showDonation = ref(false)
    const showKnowledge = ref(false)
    const trainingStore = useTrainingStore()

    return {
      showDonation,
      showKnowledge,
      trainingStore
    }
  }
}
</script>
