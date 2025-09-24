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
    <!-- 防螢幕休眠按鈕 -->
    <button
      @click="showSleepInfo = true"
      class="fixed bottom-36 right-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-lg hover:scale-110 active:scale-95 z-40"
      title="點擊查看防螢幕休眠說明"
    >
      📱
    </button>

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

    <!-- 防螢幕休眠說明彈窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showSleepInfo" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" @click="showSleepInfo = false">
          <div class="bg-cycle-dark rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-700" @click.stop>
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-white flex items-center">
                <span class="text-2xl mr-2">📱</span>
                防螢幕休眠
              </h2>
              <button
                @click="showSleepInfo = false"
                class="text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <!-- Content -->
            <div class="space-y-4">
              <div class="bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700">
                <h3 class="text-lg font-semibold text-blue-300 mb-2">🛡️ 自動防護功能</h3>
                <p class="text-blue-200 text-sm leading-relaxed">
                  當你開始訓練時，系統會自動啟用防螢幕休眠功能，確保計時器持續顯示，不會被手機省電模式中斷。
                </p>
              </div>

              <div class="space-y-3">
                <div class="flex items-start space-x-3">
                  <span class="text-green-400 text-lg">✅</span>
                  <div>
                    <p class="text-white font-medium">自動啟用</p>
                    <p class="text-gray-400 text-sm">開始訓練時自動開啟</p>
                  </div>
                </div>

                <div class="flex items-start space-x-3">
                  <span class="text-green-400 text-lg">✅</span>
                  <div>
                    <p class="text-white font-medium">智慧管理</p>
                    <p class="text-gray-400 text-sm">訓練結束後自動關閉</p>
                  </div>
                </div>

                <div class="flex items-start space-x-3">
                  <span class="text-green-400 text-lg">✅</span>
                  <div>
                    <p class="text-white font-medium">跨瀏覽器支援</p>
                    <p class="text-gray-400 text-sm">支援所有現代手機瀏覽器</p>
                  </div>
                </div>
              </div>

              <div class="bg-gray-800 rounded-lg p-4">
                <h4 class="text-white font-medium mb-2">💡 使用說明</h4>
                <p class="text-gray-300 text-sm">
                  無需手動操作，只要開始任何訓練模式，防螢幕休眠就會自動生效。
                  你可以安心進行 17-20 分鐘的完整訓練，不用擔心螢幕突然變黑。
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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
    const showSleepInfo = ref(false)
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
      showSleepInfo,
      trainingStore
    }
  }
}
</script>