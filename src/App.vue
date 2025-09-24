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

    <!-- 浮動按鈕組 -->
    <!-- 知識指南按鈕 -->
    <button
      @click="showKnowledge = true"
      class="fixed bottom-20 right-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-lg hover:scale-110 active:scale-95 z-40"
      title="飛輪訓練指南"
    >
      📚
    </button>

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

    <!-- 知識指南彈窗 -->
    <KnowledgeModal
      :isVisible="showKnowledge"
      @close="showKnowledge = false"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useTrainingStore } from './stores/training'
import TimerDisplay from './components/TimerDisplay.vue'
import StageIndicator from './components/StageIndicator.vue'
import IntensityMeter from './components/IntensityMeter.vue'
import ControlPanel from './components/ControlPanel.vue'
import FlashOverlay from './components/FlashOverlay.vue'
import DonationModal from './components/DonationModal.vue'
import KnowledgeModal from './components/KnowledgeModal.vue'

export default {
  name: 'CyclePulseApp',
  components: {
    TimerDisplay,
    StageIndicator,
    IntensityMeter,
    ControlPanel,
    FlashOverlay,
    DonationModal,
    KnowledgeModal
  },
  setup() {
    const showDonation = ref(false)
    const showKnowledge = ref(false)
    const trainingStore = useTrainingStore()
    let wakeLock = null

    // 防止螢幕休眠的函數
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen')
          console.log('螢幕保持喚醒已啟用')
        }
      } catch (err) {
        console.log('無法啟用螢幕保持喚醒:', err)
        // 降級方案：使用 NoSleep.js 或其他方法
        fallbackKeepAwake()
      }
    }

    // 釋放螢幕喚醒鎖
    const releaseWakeLock = () => {
      if (wakeLock) {
        wakeLock.release()
        wakeLock = null
        console.log('螢幕保持喚醒已關閉')
      }
    }

    // 降級方案：定期觸發小幅度的視覺變化
    let keepAwakeInterval = null
    const fallbackKeepAwake = () => {
      if (keepAwakeInterval) clearInterval(keepAwakeInterval)

      keepAwakeInterval = setInterval(() => {
        // 創建一個幾乎不可見的元素來防止休眠
        const wakup = document.createElement('div')
        wakup.style.position = 'fixed'
        wakup.style.top = '-1px'
        wakup.style.left = '-1px'
        wakup.style.width = '1px'
        wakup.style.height = '1px'
        wakup.style.opacity = '0.01'
        wakup.style.pointerEvents = 'none'
        document.body.appendChild(wakup)

        setTimeout(() => {
          if (wakup.parentNode) {
            wakup.parentNode.removeChild(wakup)
          }
        }, 100)
      }, 15000) // 每15秒觸發一次
    }

    const stopKeepAwake = () => {
      if (keepAwakeInterval) {
        clearInterval(keepAwakeInterval)
        keepAwakeInterval = null
      }
    }

    // 監聽訓練狀態變化
    const handleTrainingStateChange = () => {
      if (trainingStore.isTraining) {
        requestWakeLock()
      } else {
        releaseWakeLock()
        stopKeepAwake()
      }
    }

    // 監聽頁面可見性變化（當用戶切換tab時重新請求wakeLock）
    const handleVisibilityChange = () => {
      if (!document.hidden && trainingStore.isTraining) {
        requestWakeLock()
      }
    }

    onMounted(() => {
      // 監聽頁面可見性
      document.addEventListener('visibilitychange', handleVisibilityChange)
    })

    // 監聽訓練狀態變化
    watch(() => trainingStore.isTraining, () => {
      handleTrainingStateChange()
    })

    onUnmounted(() => {
      releaseWakeLock()
      stopKeepAwake()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    })

    return {
      showDonation,
      showKnowledge,
      trainingStore
    }
  }
}
</script>