# CyclePulse GitHub Pages 部署指南

## 設置步驟

### 1. 更新 vite.config.js
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/CyclePulse/',
  server: {
    port: 3000
  }
})
```

### 2. 安裝 gh-pages
```bash
npm install --save-dev gh-pages
```

### 3. 在 package.json 添加部署腳本
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist",
    "predeploy": "npm run build"
  }
}
```

### 4. 部署指令
```bash
# 建構並部署到 GitHub Pages
npm run deploy
```

### 5. GitHub 設定
1. 去 GitHub repository → Settings → Pages
2. Source 選擇 "Deploy from a branch"
3. Branch 選擇 "gh-pages"
4. 點擊 Save

## 部署後的網址
https://joechiboo.github.io/CyclePulse/

## 注意事項
- 每次推送新版本都需要執行 `npm run deploy`
- gh-pages 分支會自動創建和管理
- 建議將 dist/ 目錄加到 .gitignore
- 部署可能需要 5-10 分鐘才會生效

## 故障排除
- 如果頁面顯示 404，檢查 vite.config.js 中的 base 路徑
- 如果資源無法載入，確認所有路徑都是相對路徑
- 清除瀏覽器快取再測試