# 小米手環 9 心率監測測試指南

## 📋 環境需求

### 必要條件
- ✅ **小米手環 9**（已確認型號）
- ✅ **Android 手機**（Web Bluetooth 只支援 Android）
- ✅ **Chrome 瀏覽器** v56+
- ✅ **HTTPS 連線**（Web Bluetooth 安全性要求）
- ✅ **手環已在小米運動/小米穿戴 App 配對過**

### 不支援的環境
- ❌ iOS Safari（不支援 Web Bluetooth）
- ❌ HTTP 連線（必須是 HTTPS）
- ❌ 桌面版瀏覽器（建議使用 Android Chrome）

---

## 🚀 快速開始

### 方法 1：使用本機 HTTPS 伺服器（推薦）

1. **安裝 http-server**
   ```bash
   npm install -g http-server
   ```

2. **啟動 HTTPS 伺服器**
   ```bash
   cd C:\Personal\Project\CyclePulse
   http-server -S -C cert.pem -K key.pem -p 8080
   ```

3. **產生自簽憑證**（如果沒有 cert.pem）
   ```bash
   # Windows（需要 OpenSSL）
   openssl req -newkey rsa:2048 -new -nodes -x509 -days 365 -keyout key.pem -out cert.pem

   # 或使用 mkcert（更簡單）
   choco install mkcert
   mkcert localhost 127.0.0.1 ::1
   ```

4. **在 Android Chrome 開啟**
   ```
   https://你的電腦IP:8080/miband-test.html
   ```

### 方法 2：部署到 GitHub Pages

1. **建立 GitHub 儲存庫**
2. **上傳這三個檔案：**
   - `miband-test.html`
   - `miband.js`
   - `MIBAND-TEST-README.md`

3. **啟用 GitHub Pages**
   - Settings → Pages → Source: main branch

4. **訪問網址**
   ```
   https://你的帳號.github.io/儲存庫名稱/miband-test.html
   ```

---

## 📱 測試步驟

### 1. 準備手環
- 確保手環已充電
- 確保手環已在小米運動/小米穿戴 App 配對過
- 手環佩戴在手腕上（心率感測器需要接觸皮膚）

### 2. 開啟測試頁面
- 在 **Android Chrome** 開啟 `miband-test.html`
- 確保網址是 `https://`（不是 `http://`）

### 3. 連接手環
1. 點擊「🔗 連接手環」按鈕
2. 在彈出視窗選擇你的「小米手環 9」
3. 等待連接完成（觀察除錯日誌）

### 4. 開始測量
1. 點擊「▶️ 開始測量心率」按鈕
2. 等待 5-10 秒（手環需要時間偵測心率）
3. 心率數據會顯示在頁面中央

### 5. 停止測量
- 點擊「⏹️ 停止測量」按鈕

---

## 🔧 小米手環 9 特定 UUID

根據小米手環 9 的規格，使用以下 UUID：

```javascript
// 標準心率服務（小米手環 9 支援）
HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb'
HEART_RATE_MEASUREMENT = '00002a37-0000-1000-8000-00805f9b34fb'
HEART_RATE_CONTROL = '00002a39-0000-1000-8000-00805f9b34fb'

// 小米專屬服務
MIBAND_SERVICE = '0000fee0-0000-1000-8000-00805f9b34fb'
AUTH_CHARACTERISTIC = '00000009-0000-3512-2118-0009af100700'
```

---

## 🐛 常見問題排解

### 問題 1：找不到設備
**症狀：** 點擊「連接手環」後，彈出視窗沒有顯示手環

**解決方法：**
1. 確認手環已在小米運動 App 配對過
2. 嘗試在手環上點選「更多設定」→「藍牙」確認藍牙已開啟
3. 檢查手機藍牙是否開啟
4. 嘗試重新啟動手環

### 問題 2：連接失敗
**症狀：** 日誌顯示「GATT Server disconnected」

**解決方法：**
1. 關閉小米運動/小米穿戴 App（避免同時連線衝突）
2. 確保手環靠近手機（距離 < 1 公尺）
3. 重新整理頁面後再試一次

### 問題 3：無法測量心率
**症狀：** 連接成功但沒有心率數據

**解決方法：**
1. 確認手環佩戴在手腕上（感測器需接觸皮膚）
2. 檢查除錯日誌中是否有錯誤訊息
3. 嘗試在小米運動 App 中手動測量心率（確認硬體正常）
4. 等待更長時間（首次測量可能需要 10-15 秒）

### 問題 4：瀏覽器不支援
**症狀：** 日誌顯示「此瀏覽器不支援 Web Bluetooth API」

**解決方法：**
1. 確認使用 **Android Chrome**（不是其他瀏覽器）
2. 更新 Chrome 到最新版本
3. 在 Chrome 中輸入 `chrome://flags` 啟用 Web Bluetooth

### 問題 5：HTTPS 憑證錯誤
**症狀：** Chrome 顯示「您的連線不是私人連線」

**解決方法：**
1. 點擊「進階」→「繼續前往...（不安全）」
2. 或使用 `mkcert` 產生本機信任的憑證
3. 或部署到 GitHub Pages（自動有效的 HTTPS）

---

## 📊 數據格式說明

### 心率數據解析
小米手環 9 遵循標準 BLE Heart Rate Profile：

```javascript
// 位元組 0：旗標
// - bit 0: 0=UINT8, 1=UINT16
// - bit 1-2: 感測器接觸狀態
// - bit 3: 能量消耗欄位
// - bit 4: RR 間期欄位

// 位元組 1+：心率值
// - UINT8: 0-255 BPM
// - UINT16: 0-65535 BPM（小端序）
```

### 範例數據
```
收到資料：[0x00, 0x48]
→ 旗標=0x00（UINT8 格式）
→ 心率=0x48（72 BPM）
```

---

## 🔗 整合到專案

### 步驟 1：將心率數據發送到 Firebase

在 `miband.js` 的 `onHeartRateUpdate` 函數中：

```javascript
onHeartRateUpdate(heartRate) {
  const userId = 'user123'; // 替換為實際用戶 ID

  firebase.database().ref(`heartRate/${userId}`).push({
    value: heartRate,
    timestamp: Date.now(),
    device: 'Mi Band 9'
  });
}
```

### 步驟 2：整合到 CyclePulse 專案

```javascript
// 在 App.tsx 或相關元件中
import { MiBandConnector } from './miband.js';

const miBand = new MiBandConnector();

// 覆寫回調函數
miBand.onHeartRateUpdate = (heartRate) => {
  // 更新 React state
  setCurrentHeartRate(heartRate);

  // 發送到後端
  fetch('/api/heartrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ heartRate, timestamp: Date.now() })
  });
};
```

---

## 📈 進階功能

### 即時心率圖表
可以使用 Chart.js 或 Recharts 繪製即時心率曲線：

```javascript
const heartRateHistory = [];

miBand.onHeartRateUpdate = (heartRate) => {
  heartRateHistory.push({
    time: new Date(),
    value: heartRate
  });

  // 更新圖表
  updateChart(heartRateHistory);
};
```

### 心率區間分析
```javascript
function getHeartRateZone(heartRate, age) {
  const maxHR = 220 - age;
  const percentage = (heartRate / maxHR) * 100;

  if (percentage < 50) return '輕鬆';
  if (percentage < 60) return '燃脂';
  if (percentage < 70) return '有氧';
  if (percentage < 80) return '無氧';
  return '最大強度';
}
```

---

## 🔒 安全性注意事項

1. **隱私保護**
   - 心率數據屬於敏感個人資料
   - 傳輸時使用 HTTPS
   - 儲存時加密處理

2. **用戶同意**
   - 首次使用前要求用戶同意
   - 清楚說明數據用途

3. **錯誤處理**
   - 處理所有可能的連線錯誤
   - 提供清楚的錯誤訊息

---

## 📚 參考資料

- [Web Bluetooth API 文件](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [BLE Heart Rate Profile 規格](https://www.bluetooth.com/specifications/gatt/services/)
- [小米手環開發者論壇](https://github.com/Freeyourgadget/Gadgetbridge)

---

## ✅ 測試檢查清單

- [ ] 環境準備
  - [ ] Android 手機 + Chrome 瀏覽器
  - [ ] HTTPS 伺服器或 GitHub Pages
  - [ ] 小米手環 9 已充電且配對

- [ ] 連接測試
  - [ ] 能在藍牙裝置列表看到手環
  - [ ] 成功連接手環
  - [ ] 除錯日誌顯示「連接完成」

- [ ] 心率測試
  - [ ] 成功啟動心率監測
  - [ ] 能看到心率數值更新
  - [ ] 數值合理（40-200 BPM）

- [ ] 功能測試
  - [ ] 停止測量功能正常
  - [ ] 重新連接功能正常
  - [ ] 斷線後能重新連接

---

## 🎯 下一步

測試成功後，可以：
1. 整合到 CyclePulse 主專案
2. 加入心率歷史記錄功能
3. 實作心率區間分析
4. 加入心率異常警報
5. 串接 Firebase 即時資料庫
