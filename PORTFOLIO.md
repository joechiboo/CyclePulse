# CyclePulse - 智能飛輪訓練應用

## 🎯 專案概述
CyclePulse 是一款專為飛輪訓練設計的 Web 應用程式，提供智能計時、強度監控和個人化訓練模式。特別針對手機橫向放置在飛輪手把上的使用場景進行優化，為運動愛好者打造專業的訓練體驗。

**🔗 線上展示**：https://joechiboo.github.io/CyclePulse/

## 💻 技術堆疊
- **前端框架**：Vue 3 (Composition API)
- **建構工具**：Vite
- **UI 框架**：Tailwind CSS
- **狀態管理**：Pinia
- **功能庫**：QRCode.js
- **部署平台**：GitHub Pages

## ✨ 核心功能

### 🚴‍♀️ 智能訓練系統
- **多種訓練模式**：咖啡時光(15分)、健身套餐(30分)、強力燃脂(45分)
- **即時計時器**：精確的時間顯示和階段提示
- **強度指示器**：視覺化訓練強度監控
- **閃爍提醒**：關鍵時刻的視覺提示系統

### 📱 移動端優化
- **橫向模式專用設計**：針對手機放置在飛輪手把的使用場景
- **響應式佈局**：完美適配各種螢幕尺寸
- **觸控友好**：大按鈕設計，運動中易於操作

### 💳 支付整合
- **LinePay 整合**：支援開發者贊助功能
- **QR Code 生成**：桌面端顯示 QR Code，手機端直接跳轉
- **跨平台支付體驗**：智能判斷設備類型提供最佳支付流程

## 🛠 技術亮點

### 前端架構
```javascript
// 使用 Vue 3 Composition API 和 Pinia 狀態管理
const trainingStore = useTrainingStore()
const { startTraining, togglePause } = trainingStore

// 響應式設計配合 Tailwind CSS
class="lg:text-6xl md:text-5xl text-4xl font-mono"
```

### 移動端適配
```css
/* 橫向模式專用優化 */
@media (orientation: landscape) and (max-height: 500px) {
  .training-mode-title { display: none; }
  .timer-display { transform: scale(0.9); }
}
```

### 狀態管理
```javascript
// Pinia store 管理訓練狀態
export const useTrainingStore = defineStore('training', {
  state: () => ({
    isTraining: false,
    currentTime: 0,
    selectedMode: null
  })
})
```

## 🎨 設計特色
- **深色主題**：適合健身房環境的視覺設計
- **大字體顯示**：運動中易於讀取的時間顯示
- **動畫效果**：流暢的過場動畫和視覺回饋
- **一致性體驗**：跨設備的統一使用體驗

## 🚀 部署與 CI/CD
- **自動化部署**：使用 GitHub Actions 自動部署到 GitHub Pages
- **版本控制**：Git 工作流程和分支管理
- **建構優化**：Vite 快速建構和最佳化輸出

## 📊 專案成果
- ✅ **完整的產品週期**：從需求分析到部署上線
- ✅ **現代化技術棧**：Vue 3 + Vite + Tailwind 最新技術
- ✅ **用戶體驗優化**：針對特定使用場景的深度優化
- ✅ **第三方整合**：支付系統和 QR Code 功能
- ✅ **響應式設計**：全設備兼容的使用體驗

## 🔧 開發技能展示
- **Vue.js 生態系統**：熟練運用 Vue 3、Pinia、Composition API
- **現代化工具鏈**：Vite、Tailwind CSS、PostCSS 配置
- **響應式設計**：Media Queries、Flexbox、Grid 佈局
- **API 整合**：第三方支付服務整合
- **自動化部署**：GitHub Pages、CI/CD 流程
- **用戶體驗設計**：針對特定使用場景的 UX 優化

---

*這個專案展示了我在現代前端開發、用戶體驗設計和產品思維方面的綜合能力。*