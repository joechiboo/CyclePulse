<template>
  <div class="heart-rate-chart">

    <div v-if="heartRateHistory.length === 0" class="text-center text-gray-400 py-8">
      尚無心率數據
    </div>

    <div v-else class="chart-container">
      <!-- SVG 折線圖 -->
      <svg
        :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
        class="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- 背景網格線 -->
        <g class="grid">
          <line
            v-for="i in 7"
            :key="`h-${i}`"
            :x1="padding"
            :y1="padding + (chartHeight - padding * 2) / 6 * (i - 1)"
            :x2="chartWidth - padding"
            :y2="padding + (chartHeight - padding * 2) / 6 * (i - 1)"
            stroke="#374151"
            stroke-width="1"
            stroke-dasharray="2,2"
          />
        </g>

        <!-- Y軸標籤 -->
        <g class="y-labels">
          <text
            v-for="(label, i) in yLabels"
            :key="`y-${i}`"
            :x="padding - 10"
            :y="padding + (chartHeight - padding * 2) / 6 * i + 5"
            text-anchor="end"
            fill="#9ca3af"
            font-size="12"
          >
            {{ label }}
          </text>
        </g>

        <!-- 心率區間背景色 -->
        <g class="zone-backgrounds">
          <rect
            :x="padding"
            :y="getYPosition(180)"
            :width="chartWidth - padding * 2"
            :height="getYPosition(165) - getYPosition(180)"
            fill="#ef4444"
            opacity="0.1"
          />
          <rect
            :x="padding"
            :y="getYPosition(165)"
            :width="chartWidth - padding * 2"
            :height="getYPosition(150) - getYPosition(165)"
            fill="#f59e0b"
            opacity="0.1"
          />
          <rect
            :x="padding"
            :y="getYPosition(150)"
            :width="chartWidth - padding * 2"
            :height="getYPosition(130) - getYPosition(150)"
            fill="#10b981"
            opacity="0.1"
          />
        </g>

        <!-- 折線圖 -->
        <polyline
          :points="linePoints"
          fill="none"
          stroke="#3b82f6"
          stroke-width="2"
          stroke-linejoin="round"
        />

        <!-- 數據點 -->
        <g class="data-points">
          <circle
            v-for="(point, i) in dataPoints"
            :key="`point-${i}`"
            :cx="point.x"
            :cy="point.y"
            r="3"
            :fill="getZoneColor(point.heartRate)"
          />
        </g>
      </svg>

      <!-- X軸時間標籤 -->
      <div class="flex justify-between text-xs text-gray-500 mt-2 px-10">
        <span>{{ startTime }}</span>
        <span>現在</span>
      </div>

      <!-- 統計資訊（直屏顯示） -->
      <div class="grid grid-cols-3 gap-4 mt-4 landscape:hidden">
        <div class="text-center">
          <div class="text-xs text-gray-400">平均</div>
          <div class="text-lg font-bold text-blue-400">{{ avgHeartRate }}</div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-400">最高</div>
          <div class="text-lg font-bold text-red-400">{{ maxHR }}</div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-400">最低</div>
          <div class="text-lg font-bold text-green-400">{{ minHR }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'HeartRateChart',
  props: {
    heartRateHistory: {
      type: Array,
      default: () => []
    }
  },
  emits: ['clear'],
  setup(props) {
    const chartWidth = 1000
    const chartHeight = 350
    const padding = 50

    const yLabels = [200, 175, 150, 125, 100, 75, 50]

    // 計算 Y 位置
    const getYPosition = (heartRate) => {
      const maxHR = 200
      const minHR = 50
      const range = maxHR - minHR
      const clampedHR = Math.max(minHR, Math.min(maxHR, heartRate))
      const normalizedValue = (maxHR - clampedHR) / range
      return padding + normalizedValue * (chartHeight - padding * 2)
    }

    // 數據點
    const dataPoints = computed(() => {
      if (props.heartRateHistory.length === 0) return []

      const points = props.heartRateHistory.map((item, index) => {
        const x = padding + (index / (props.heartRateHistory.length - 1 || 1)) * (chartWidth - padding * 2)
        const y = getYPosition(item.heartRate)
        return { x, y, heartRate: item.heartRate }
      })

      return points
    })

    // 折線點字串
    const linePoints = computed(() => {
      return dataPoints.value.map(p => `${p.x},${p.y}`).join(' ')
    })

    // 區間顏色
    const getZoneColor = (hr) => {
      if (hr >= 180) return '#ef4444'
      if (hr >= 165) return '#f59e0b'
      if (hr >= 150) return '#10b981'
      if (hr >= 130) return '#3b82f6'
      return '#6b7280'
    }

    // 開始時間
    const startTime = computed(() => {
      if (props.heartRateHistory.length === 0) return '--'
      const firstItem = props.heartRateHistory[0]
      const date = new Date(firstItem.timestamp)
      return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    })

    // 統計數據
    const avgHeartRate = computed(() => {
      if (props.heartRateHistory.length === 0) return '--'
      const sum = props.heartRateHistory.reduce((acc, item) => acc + item.heartRate, 0)
      return Math.round(sum / props.heartRateHistory.length)
    })

    const maxHR = computed(() => {
      if (props.heartRateHistory.length === 0) return '--'
      return Math.max(...props.heartRateHistory.map(item => item.heartRate))
    })

    const minHR = computed(() => {
      if (props.heartRateHistory.length === 0) return '--'
      return Math.min(...props.heartRateHistory.map(item => item.heartRate))
    })

    return {
      chartWidth,
      chartHeight,
      padding,
      yLabels,
      dataPoints,
      linePoints,
      getYPosition,
      getZoneColor,
      startTime,
      avgHeartRate,
      maxHR,
      minHR
    }
  }
}
</script>

<style scoped>
.chart-container {
  user-select: none;
}
</style>
