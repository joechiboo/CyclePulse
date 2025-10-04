# 藍牙心率監測待辦事項

## 當前狀態
- ✅ 已建立 HTTPS 測試環境（自簽憑證）
- ✅ 已實作基本藍牙連接程式碼（`public/miband.js`）
- ✅ 已建立測試頁面（`public/miband-test.html`）
- ⚠️ 手機端藍牙連接**尚未測試成功**

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

## 技術細節

### 藍牙 UUID
- Mi Band Service: `0000fee0-0000-1000-8000-00805f9b34fb`
- Heart Rate Service: `0000180d-0000-1000-8000-00805f9b34fb`
- Heart Rate Measurement: `00002a37-0000-1000-8000-00805f9b34fb`

### 手環資訊
- 型號：Xiaomi Smart Band 9 Pro
- 藍牙名稱：`Xiaomi Smart Band 9 Pro 24A0`

### 程式碼位置
- 藍牙連接邏輯：`public/miband.js`
- 測試頁面：`public/miband-test.html`
- 主應用整合：待完成（需整合到 Vue 應用中）

## 後續整合計畫
1. ✅ 完成獨立測試頁面
2. ⏳ 確認手機端可以連接手環
3. ⏳ 整合到 Vue 主應用（`src/stores/training.js`）
4. ⏳ 在訓練過程中即時顯示心率
5. ⏳ 記錄心率數據到本地存儲或 Firebase

## 注意事項
- `.pem` 憑證檔已加到 `.gitignore`，不會推送到 GitHub
- GitHub Pages 部署時會使用 GitHub 提供的 SSL 憑證
- Web Bluetooth API 必須在 HTTPS 環境下才能使用
- iOS Safari 不支援 Web Bluetooth，必須使用 Android Chrome
