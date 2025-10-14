# 藍牙心率監測待辦事項

## 當前狀態
- ✅ 已建立 HTTPS 測試環境（自簽憑證）
- ✅ 已實作基本藍牙連接程式碼（`public/miband.js`）
- ✅ 已建立測試頁面（`public/miband-test.html`）
- ✅ 成功連接並掃描手環服務
- ❌ **無法讀取心率數據** - 小米手環 9 Pro 不支援 Web Bluetooth 讀取心率

## 問題記錄
1. **手機端沒有顯示藍牙裝置列表**
   - 可能原因：瀏覽器不支援、權限問題、HTTPS 憑證問題
   - 需確認：使用 Chrome、HTTPS 連接、藍牙權限已開啟

2. **電腦端可以顯示裝置列表，但沒看到手環**
   - 手環可能需要先喚醒螢幕
   - 手環需要先與小米運動 App 斷開連接

## 下次測試步驟

### 1. 手機端測試
```
1. 確認使用 Android + Chrome 瀏覽器（iOS Safari 不支援 Web Bluetooth）
2. 前往 https://192.168.31.42:8080/miband-test.html
3. 接受自簽憑證警告
4. 檢查 Chrome 藍牙權限：
   - Chrome 設定 → 網站設定 → 藍牙 → 允許
   - 手機系統設定 → Chrome → 權限 → 藍牙 → 允許
5. 在小米運動 App 中斷開手環連接
6. 喚醒手環螢幕
7. 點擊網頁上的「連接手環」按鈕
```

### 2. 啟動 HTTPS 伺服器
```bash
# 在專案根目錄執行
npx http-server -S -C cert.pem -K key.pem -p 8080
```

### 3. 查看手機 IP
```bash
ipconfig
# 找到 192.168.31.x 的 IP 位址
```

## 測試結果

### 實際掃描到的服務（Xiaomi Smart Band 9 Pro）

Web Bluetooth **只能訪問以下基本服務**，無法訪問心率數據：

#### 1. Generic Access (0x1800)
**用途：** 基本設備資訊
- `0x2A00` - Device Name（設備名稱）
- `0x2A01` - Appearance（外觀類別）
- `0x2A04` - Peripheral Preferred Connection Parameters（連接參數）
- `0x2AA6` - Central Address Resolution（地址解析）

**可讀取資訊：**
- ✅ 設備名稱："Xiaomi Smart Band 9 Pro 24A0"
- ✅ 設備類型
- ℹ️ 這些資訊僅用於基本識別，無實際應用價值

#### 2. Generic Attribute (0x1801)
**用途：** GATT 協定管理
- `0x2A05` - Service Changed（服務變更通知）
- `0x2B29` - Client Supported Features（客戶端支援功能）
- `0x2B3A` - Database Hash（資料庫雜湊值）

**可讀取資訊：**
- ℹ️ 這是藍牙協定層的管理服務，無實用數據

#### 3. Device Information Service (0x180A)
**用途：** 製造商資訊
- `0x2A50` - PnP ID（即插即用 ID）

**可讀取資訊：**
- ℹ️ 廠商 ID、產品 ID、版本號
- ℹ️ 無健康監測相關資訊

### ❌ 無法訪問的服務

以下服務**需要小米運動 App 的加密授權**，Web Bluetooth 無法訪問：

- ❌ `0xFEE0` - Mi Band Service（小米手環主服務）
- ❌ `0xFEE1` - Mi Band Sensor Service（感測器服務）
- ❌ `0x180D` - Heart Rate Service（心率服務）
- ❌ `0x1530` - Mi Band Custom Service（小米自定義服務）

### 技術限制說明

**為什麼無法讀取心率？**

1. **需要配對授權**
   - 小米手環 9 Pro 使用加密的配對流程
   - 只有小米運動 App 擁有配對密鑰
   - Web Bluetooth API 無法完成這個授權流程

2. **健康數據保護**
   - 心率等健康數據屬於敏感資訊
   - 小米透過加密保護這些數據
   - 未授權的應用無法訪問

3. **非標準協定**
   - 小米手環不使用標準 BLE Heart Rate Profile (0x180D)
   - 使用專屬的加密協定
   - 需要逆向工程才能解析（違反使用條款）

### 手環資訊
- 型號：Xiaomi Smart Band 9 Pro
- 藍牙名稱：`Xiaomi Smart Band 9 Pro 24A0`
- 藍牙 MAC：`3C:AF:B7:F8:24:A0`
- 可訪問服務：僅基本資訊服務（0x1800, 0x1801, 0x180A）
- 心率服務：❌ 不可訪問

### 程式碼位置
- 藍牙連接邏輯：`public/miband.js`
- 測試頁面：`public/miband-test.html`
- 主應用整合：待完成（需整合到 Vue 應用中）

## 替代方案

### 方案 1：使用標準 BLE 心率帶（推薦）

購買支援標準 Heart Rate Profile 的心率帶，可直接用 Web Bluetooth 連接：

**推薦型號：**
- **Polar H10**（約 NT$2,500）- 最準確，業界標準
- **Wahoo TICKR**（約 NT$1,500）- CP 值高
- **Garmin HRM-Dual**（約 NT$2,000）- 雙模藍牙
- **CooSpo H6**（約 NT$800）- 預算選擇

**優點：**
- ✅ 原生支援 Web Bluetooth
- ✅ 不需要任何 App
- ✅ 心率數據更準確（胸帶 vs 手腕）
- ✅ 標準協定，程式碼簡單

### 方案 2：使用 Gadgetbridge + 數據導出

使用開源 App Gadgetbridge 管理小米手環，導出數據給網頁讀取：

**流程：**
1. 安裝 Gadgetbridge（Android）
2. 配對小米手環
3. 導出心率數據為 CSV/JSON
4. Web App 讀取導出檔案

**缺點：**
- ❌ 無法即時讀取
- ❌ 需要額外 App
- ❌ 使用體驗較差

### 方案 3：改用手動輸入

訓練時讓用戶手動輸入心率：

**優點：**
- ✅ 無需額外硬體
- ✅ 實作簡單

**缺點：**
- ❌ 使用體驗不佳
- ❌ 無法連續監測

## 建議

**最佳方案：購買標準 BLE 心率帶**

預算 NT$800-2,500，可獲得：
- 即時心率監測
- 更準確的數據（胸帶式感測器）
- 原生 Web Bluetooth 支援
- 無需任何中介 App

現有的 `public/miband.js` 程式碼只需稍微修改即可支援標準心率帶。

## 後續計畫

### 如果購買標準心率帶：
1. ✅ 測試頁面已完成
2. ⏳ 修改程式碼以支援標準 Heart Rate Profile
3. ⏳ 整合到 Vue 主應用
4. ⏳ 在訓練過程中即時顯示心率
5. ⏳ 記錄心率數據到本地存儲

### 如果繼續使用小米手環：
1. ❌ Web Bluetooth 方案不可行
2. ⏳ 考慮使用 Gadgetbridge 導出數據
3. ⏳ 或改用手動輸入方式

## 注意事項
- `.pem` 憑證檔已加到 `.gitignore`，不會推送到 GitHub
- GitHub Pages 部署時會使用 GitHub 提供的 SSL 憑證
- Web Bluetooth API 必須在 HTTPS 環境下才能使用
- iOS Safari 不支援 Web Bluetooth，必須使用 Android Chrome
