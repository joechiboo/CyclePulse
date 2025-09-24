<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isVisible" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">
              <span class="text-2xl mr-2">📚</span>
              飛輪訓練指南
            </h2>
            <button
              @click="handleClose"
              class="close-btn"
            >
              ✕
            </button>
          </div>

          <div class="modal-body">
            <!-- 分類標籤 -->
            <div class="tab-buttons">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                class="tab-btn"
                :class="{ 'active': activeTab === tab.id }"
              >
                {{ tab.icon }} {{ tab.name }}
              </button>
            </div>

            <!-- 內容區域 -->
            <div class="content-area">
              <!-- 設備調整 -->
              <div v-if="activeTab === 'equipment'" class="content-section">
                <h3 class="section-title">🚴 飛輪設備調整指南</h3>

                <div class="guide-card">
                  <h4 class="guide-subtitle">座椅高度調整</h4>
                  <ul class="guide-list">
                    <li>站在飛輪旁邊，座椅應該與你的髖骨同高</li>
                    <li>坐上座椅後，腳踏板在最低點時，膝蓋應保持微彎（約 25-35 度）</li>
                    <li>踩踏時膝蓋不應完全伸直或過度彎曲</li>
                  </ul>
                </div>

                <div class="guide-card">
                  <h4 class="guide-subtitle">座椅前後位置</h4>
                  <ul class="guide-list">
                    <li>腳踏板在水平位置時，前腳膝蓋應該在腳踏板軸心正上方</li>
                    <li>可用鉛垂線從膝蓋垂下檢查是否對準腳踏板中心</li>
                  </ul>
                </div>

                <div class="guide-card">
                  <h4 class="guide-subtitle">把手高度調整</h4>
                  <ul class="guide-list">
                    <li>初學者：把手與座椅同高或略高，減少背部壓力</li>
                    <li>進階者：把手可略低於座椅，增加核心參與</li>
                    <li>握把時手肘應自然微彎，肩膀放鬆不聳起</li>
                  </ul>
                </div>

                <div class="guide-card">
                  <h4 class="guide-subtitle">把手握法</h4>
                  <ul class="guide-list">
                    <li><strong>握把位置 1（內側）：</strong>適合恢復騎行和輕鬆騎乘</li>
                    <li><strong>握把位置 2（中間）：</strong>標準騎行位置，適合大部分訓練</li>
                    <li><strong>握把位置 3（外側）：</strong>站姿爬坡或高強度衝刺時使用</li>
                  </ul>
                </div>
              </div>

              <!-- 暖身指南 -->
              <div v-if="activeTab === 'warmup'" class="content-section">
                <h3 class="section-title">🔥 暖身動作建議</h3>

                <div class="guide-card">
                  <h4 class="guide-subtitle">騎乘前動態暖身（5-10分鐘）</h4>

                  <div class="exercise-item">
                    <div class="exercise-header">
                      <strong>1. 腿部擺動</strong>
                      <span class="exercise-count">單腳前後擺動各 10 次</span>
                    </div>
                    <div class="exercise-visual">
                      <div class="ascii-art">
                        <pre>
    站立姿勢           前擺             後擺
       🧍              🧍              🧍
       ||              |╱              |╲
       /\              /               /
                      ↑               ↓
                    腿部前後擺動
                        </pre>
                      </div>
                    </div>
                    <p class="exercise-tip">💡 手扶牆保持平衡，腿部放鬆自然擺動</p>
                  </div>

                  <div class="exercise-item">
                    <div class="exercise-header">
                      <strong>2. 髖關節繞環</strong>
                      <span class="exercise-count">髖部順逆時針各轉 10 圈</span>
                    </div>
                    <div class="exercise-visual">
                      <div class="ascii-art">
                        <pre>
     雙手叉腰
        🧍
       ╱ ╲        ↻ 順時針
      ╱   ╲       ↺ 逆時針
        ○         髖部畫圓
       / \
                        </pre>
                      </div>
                    </div>
                    <p class="exercise-tip">💡 保持上身挺直，只動髖部</p>
                  </div>

                  <div class="exercise-item">
                    <div class="exercise-header">
                      <strong>3. 弓箭步</strong>
                      <span class="exercise-count">左右腳各做 10 次</span>
                    </div>
                    <div class="exercise-visual">
                      <div class="ascii-art">
                        <pre>
    起始位置          弓箭步
       🧍              🤸
       ||             ╱│
       /\           ╱  │
                  前腿90° 後腿伸直
                        </pre>
                      </div>
                    </div>
                    <p class="exercise-tip">💡 前膝不超過腳尖，後腿保持伸直</p>
                  </div>

                  <div class="exercise-item">
                    <div class="exercise-header">
                      <strong>4. 腳踝轉動</strong>
                      <span class="exercise-count">順逆時針各轉 10 圈</span>
                    </div>
                    <div class="exercise-visual">
                      <div class="ascii-art">
                        <pre>
    腳尖點地
       🧍
       ||
       /│         ↻ ↺
        ●         腳踝畫圓
                        </pre>
                      </div>
                    </div>
                    <p class="exercise-tip">💡 腳尖輕點地面，腳踝放鬆轉動</p>
                  </div>
                </div>

                <div class="guide-card">
                  <h4 class="guide-subtitle">上車暖身強度指南（5分鐘）</h4>

                  <div class="warmup-timeline">
                    <div class="timeline-item">
                      <div class="timeline-marker">⏱️ 0-2分</div>
                      <div class="timeline-content">
                        <div class="intensity-level low">輕鬆騎行</div>
                        <div class="timeline-details">
                          <span>🚴 RPM: 60-70</span>
                          <span>💪 阻力: 3-4</span>
                          <span>❤️ 心率: 50-60%</span>
                        </div>
                      </div>
                    </div>

                    <div class="timeline-item">
                      <div class="timeline-marker">⏱️ 2-4分</div>
                      <div class="timeline-content">
                        <div class="intensity-level medium">逐漸加速</div>
                        <div class="timeline-details">
                          <span>🚴 RPM: 70-80</span>
                          <span>💪 阻力: 4-5</span>
                          <span>❤️ 心率: 60-70%</span>
                        </div>
                      </div>
                    </div>

                    <div class="timeline-item">
                      <div class="timeline-marker">⏱️ 4-5分</div>
                      <div class="timeline-content">
                        <div class="intensity-level ready">準備完成</div>
                        <div class="timeline-details">
                          <span>🚴 RPM: 80-90</span>
                          <span>💪 阻力: 5-6</span>
                          <span>❤️ 心率: 70-75%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="warmup-tips">
                    <p>🌡️ <strong>暖身完成指標：</strong></p>
                    <ul>
                      <li>身體微微發熱</li>
                      <li>呼吸略微加快但不喘</li>
                      <li>肌肉感覺放鬆有彈性</li>
                      <li>心理準備好進入訓練</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- 訓練技巧 -->
              <div v-if="activeTab === 'technique'" class="content-section">
                <h3 class="section-title">💡 訓練技巧</h3>

                <div class="guide-card">
                  <h4 class="guide-subtitle">踩踏技巧</h4>
                  <ul class="guide-list">
                    <li>保持「畫圓」的踩踏動作，不只是向下踩</li>
                    <li>利用拉帶或卡鞋，在上拉階段也要出力</li>
                    <li>維持穩定的踩踏節奏（Cadence）</li>
                    <li>核心收緊，避免身體過度晃動</li>
                  </ul>
                </div>

                <div class="guide-card">
                  <h4 class="guide-subtitle">呼吸技巧</h4>
                  <ul class="guide-list">
                    <li>低強度：自然呼吸，鼻吸鼻吐</li>
                    <li>中強度：鼻吸口吐，保持節奏</li>
                    <li>高強度：口吸口吐，快速換氣</li>
                    <li>避免憋氣，保持氧氣供應</li>
                  </ul>
                </div>

                <div class="guide-card">
                  <h4 class="guide-subtitle">阻力調整建議</h4>
                  <ul class="guide-list">
                    <li><strong>恢復期：</strong>阻力 3-4，RPM 80-90</li>
                    <li><strong>有氧耐力：</strong>阻力 5-6，RPM 80-100</li>
                    <li><strong>爬坡訓練：</strong>阻力 7-8，RPM 60-70</li>
                    <li><strong>衝刺訓練：</strong>阻力 6-7，RPM 100+</li>
                  </ul>
                </div>
              </div>

              <!-- 安全須知 -->
              <div v-if="activeTab === 'safety'" class="content-section">
                <h3 class="section-title">⚠️ 安全注意事項</h3>

                <div class="guide-card">
                  <h4 class="guide-subtitle">訓練前檢查</h4>
                  <ul class="guide-list">
                    <li>確認飛輪各部位螺絲鎖緊</li>
                    <li>檢查緊急煞車功能是否正常</li>
                    <li>準備毛巾和充足的水分</li>
                    <li>穿著合適的運動服裝和硬底運動鞋</li>
                  </ul>
                </div>

                <div class="guide-card">
                  <h4 class="guide-subtitle">訓練中注意</h4>
                  <ul class="guide-list">
                    <li>感到頭暈或不適時立即停止</li>
                    <li>保持水分補充，每 15-20 分鐘喝水</li>
                    <li>避免突然停止踩踏，應逐漸減速</li>
                    <li>維持正確姿勢，避免過度前傾或後仰</li>
                  </ul>
                </div>

                <div class="guide-card">
                  <h4 class="guide-subtitle">訓練後恢復</h4>
                  <ul class="guide-list">
                    <li>緩和騎行 3-5 分鐘，讓心率逐漸下降</li>
                    <li>進行靜態伸展，特別是腿部和臀部</li>
                    <li>補充水分和適量的碳水化合物</li>
                    <li>記錄訓練數據，追蹤進步</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'KnowledgeModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const activeTab = ref('equipment')

    const tabs = ref([
      { id: 'equipment', name: '設備調整', icon: '🔧' },
      { id: 'warmup', name: '暖身動作', icon: '🔥' },
      { id: 'technique', name: '訓練技巧', icon: '💡' },
      { id: 'safety', name: '安全須知', icon: '⚠️' }
    ])

    const handleClose = () => {
      emit('close')
    }

    return {
      activeTab,
      tabs,
      handleClose
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4;
}

.modal-container {
  @apply bg-cycle-dark rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-700;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-700;
}

.modal-title {
  @apply text-2xl font-bold text-white flex items-center;
}

.close-btn {
  @apply text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-700 transition-colors;
}

.modal-body {
  @apply flex-1 overflow-hidden flex flex-col;
}

.tab-buttons {
  @apply flex gap-2 p-4 border-b border-gray-700 overflow-x-auto;
}

.tab-btn {
  @apply px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap;
  @apply text-gray-400 hover:text-white hover:bg-gray-700;
}

.tab-btn.active {
  @apply bg-blue-600 text-white;
}

.content-area {
  @apply flex-1 overflow-y-auto p-6;
}

.content-section {
  @apply space-y-4;
}

.section-title {
  @apply text-xl font-bold text-white mb-4 flex items-center;
}

.guide-card {
  @apply bg-gray-800 rounded-lg p-4 space-y-3;
}

.guide-subtitle {
  @apply text-lg font-semibold text-blue-400 mb-2;
}

.guide-list {
  @apply space-y-2 text-gray-300;
}

.guide-list li {
  @apply pl-5 relative;
}

.guide-list li::before {
  @apply absolute left-0 top-1 w-2 h-2 bg-blue-500 rounded-full;
  content: '';
}

.guide-list strong {
  @apply text-white;
}

/* 運動項目樣式 */
.exercise-item {
  @apply bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700;
}

.exercise-header {
  @apply flex justify-between items-center mb-3;
}

.exercise-header strong {
  @apply text-white text-lg;
}

.exercise-count {
  @apply text-sm text-gray-400;
}

.exercise-visual {
  @apply bg-black rounded-lg p-3 mb-3 overflow-x-auto;
}

.ascii-art {
  @apply text-center;
}

.ascii-art pre {
  @apply text-xs text-green-400 font-mono inline-block;
  line-height: 1.2;
}

.exercise-tip {
  @apply text-sm text-yellow-400 italic;
}

/* 暖身時間軸樣式 */
.warmup-timeline {
  @apply space-y-4 mt-4;
}

.timeline-item {
  @apply flex gap-4 items-start;
}

.timeline-marker {
  @apply text-sm font-bold text-gray-400 min-w-[80px];
}

.timeline-content {
  @apply flex-1;
}

.intensity-level {
  @apply inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2;
}

.intensity-level.low {
  @apply bg-green-900 text-green-300;
}

.intensity-level.medium {
  @apply bg-yellow-900 text-yellow-300;
}

.intensity-level.ready {
  @apply bg-blue-900 text-blue-300;
}

.timeline-details {
  @apply flex flex-wrap gap-3 text-xs text-gray-400;
}

.timeline-details span {
  @apply whitespace-nowrap;
}

.warmup-tips {
  @apply mt-4 p-3 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-700;
}

.warmup-tips p {
  @apply text-blue-300 font-semibold mb-2;
}

.warmup-tips ul {
  @apply ml-4 space-y-1;
}

.warmup-tips li {
  @apply text-sm text-gray-300;
}

/* 動畫效果 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

/* 響應式設計 */
@media (max-width: 640px) {
  .modal-overlay {
    @apply p-2;
  }

  .modal-container {
    @apply max-h-[95vh] m-0 rounded-xl;
  }

  .modal-header {
    @apply p-4;
  }

  .modal-title {
    @apply text-xl;
  }

  .tab-buttons {
    @apply flex-wrap p-3 gap-1;
  }

  .tab-btn {
    @apply text-sm px-3 py-1.5;
  }

  .content-area {
    @apply p-4;
  }

  .exercise-visual {
    @apply p-2;
  }

  .ascii-art pre {
    @apply text-xs;
  }

  .timeline-details {
    @apply text-xs gap-2;
  }
}

/* 極小螢幕優化 */
@media (max-width: 480px) {
  .modal-overlay {
    @apply p-1;
  }

  .modal-container {
    @apply max-h-[98vh] rounded-lg;
  }

  .modal-header {
    @apply p-2;
  }

  .modal-title {
    @apply text-base;
  }

  .tab-buttons {
    @apply p-2 gap-1 grid grid-cols-2;
  }

  .tab-btn {
    @apply text-xs px-2 py-1.5 min-h-[36px] flex items-center justify-center;
  }

  .content-area {
    @apply p-3;
  }

  .guide-card {
    @apply p-3;
  }

  .exercise-item {
    @apply p-3 mb-3;
  }

  .exercise-header {
    @apply mb-2;
  }

  .exercise-header strong {
    @apply text-base;
  }

  .exercise-count {
    @apply text-xs;
  }

  .exercise-visual {
    @apply p-1 mb-2;
  }

  .exercise-tip {
    @apply text-xs;
  }

  .warmup-timeline {
    @apply space-y-3;
  }

  .timeline-item {
    @apply gap-3;
  }

  .timeline-marker {
    @apply min-w-[70px] text-xs;
  }

  .section-title {
    @apply text-lg;
  }

  .guide-subtitle {
    @apply text-base;
  }
}

/* 超窄螢幕優化 (330px 寬度) */
@media (max-width: 360px) {
  .modal-overlay {
    @apply p-0;
  }

  .modal-container {
    @apply max-h-screen rounded-none w-full h-full;
  }

  .modal-header {
    @apply p-2 flex-shrink-0;
  }

  .modal-title {
    @apply text-sm;
  }

  .close-btn {
    @apply w-8 h-8 text-lg;
  }

  .tab-buttons {
    @apply p-1 gap-0.5 grid grid-cols-2 flex-shrink-0;
  }

  .tab-btn {
    @apply text-xs px-1 py-1 min-h-[32px];
  }

  .content-area {
    @apply p-2 flex-1 overflow-y-auto;
  }

  .section-title {
    @apply text-base mb-2;
  }

  .guide-card {
    @apply p-2 mb-3;
  }

  .guide-subtitle {
    @apply text-sm mb-1;
  }

  .exercise-item {
    @apply p-2 mb-2;
  }

  .exercise-header {
    @apply mb-1 flex-col items-start gap-1;
  }

  .exercise-header strong {
    @apply text-sm;
  }

  .exercise-count {
    @apply text-xs text-gray-500;
  }

  .exercise-visual {
    @apply p-1 mb-1;
  }

  .ascii-art pre {
    @apply text-xs leading-tight;
  }

  .exercise-tip {
    @apply text-xs;
  }

  .timeline-item {
    @apply gap-2 flex-col;
  }

  .timeline-marker {
    @apply min-w-full text-xs font-bold text-center;
  }

  .timeline-content {
    @apply w-full;
  }

  .timeline-details {
    @apply grid grid-cols-2 gap-1 text-xs;
  }

  .warmup-tips {
    @apply p-2;
  }

  .warmup-tips ul {
    @apply ml-2;
  }

  .warmup-tips li {
    @apply text-xs;
  }
}
</style>