<template>
  <div class="app-container h-full flex flex-col bg-cycle-darker">
    <!-- 主要顯示區域 -->
    <div class="main-display flex-1 flex flex-col justify-center items-center p-4">
      <TimerDisplay />
      <StageIndicator />
      <div class="w-full max-w-md mb-8">
        <IntensityMeter />
      </div>
    </div>

    <!-- 控制面板區域 -->
    <div class="side-controls p-4">
      <ControlPanel />
    </div>

    <!-- 浮動贊助按鈕 -->
    <button
      @click="showDonation = true"
      class="donation-float-btn fixed bottom-4 right-4 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-lg hover:scale-110 active:scale-95 z-40"
      title="支持開發者"
    >
      💝
    </button>

    <FlashOverlay />

    <!-- 贊助彈窗 -->
    <DonationModal
      :isVisible="showDonation"
      @close="showDonation = false"
    />
  </div>
</template>

<script>
import { ref } from 'vue'
import { useTrainingStore } from './stores/training'
import TimerDisplay from './components/TimerDisplay.vue'
import StageIndicator from './components/StageIndicator.vue'
import IntensityMeter from './components/IntensityMeter.vue'
import ControlPanel from './components/ControlPanel.vue'
import FlashOverlay from './components/FlashOverlay.vue'
import DonationModal from './components/DonationModal.vue'

export default {
  name: 'CyclePulseApp',
  components: {
    TimerDisplay,
    StageIndicator,
    IntensityMeter,
    ControlPanel,
    FlashOverlay,
    DonationModal
  },
  setup() {
    const showDonation = ref(false)
    const trainingStore = useTrainingStore()

    return {
      showDonation,
      trainingStore
    }
  }
}
</script>