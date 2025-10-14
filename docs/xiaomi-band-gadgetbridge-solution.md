# 小米手環 9 + Gadgetbridge 整合方案

## 方案概述

由於小米手環 9 使用加密的專屬協定，無法直接透過 Web Bluetooth 讀取心率數據。本方案透過 Gadgetbridge 作為中介，取得手環數據後再傳送到網頁應用。

---

## 技術架構

```
小米手環 9 Pro
    ↓ (藍牙 + Auth Key)
Gadgetbridge (Android App)
    ↓ (Intent / HTTP / WebView)
CyclePulse Vue 網頁
```

---

## 前置需求

- ✅ Android 手機（iOS 不支援）
- ✅ 小米手環 9 / 9 Pro
- ✅ 小米運動健康 App (Mi Fitness / Xiaomi Wear)
- ✅ Gadgetbridge App（開源，從 F-Droid 或 GitHub 下載）
- ⏱️ 預估時間：1-2 小時

---

## 步驟 1：取得 Auth Key

### 方法 A：從 Log 檔案（不需 Root）✨ 推薦

#### 1.1 確保手環已配對
- 在小米運動健康 App 中配對小米手環 9
- **⚠️ 重要：不要取消配對！**（否則 Auth Key 會失效）
- 等待至少 1 小時，讓 Auth Key 寫入 log 檔案

#### 1.2 取得 Log 檔案

**使用檔案管理器（簡單）：**
```
路徑：/sdcard/Android/data/com.xiaomi.wearable/files/log/Transfer.device.log
```
1. 開啟檔案管理器（如 Files by Google）
2. 找到上述路徑的 `Transfer.device.log` 檔案
3. 複製到電腦或用文字編輯器 App 開啟

**使用 ADB（進階）：**
```bash
# 連接手機到電腦
adb shell
cd /sdcard/Android/data/com.xiaomi.wearable/files/log

# 搜尋 Auth Key
grep -Eo '(encryptKey|token|authKey|huamiAuthKey)[":= ]+[[:xdigit:]]{32}' Transfer.device.log
```

#### 1.3 搜尋 Auth Key

在 `Transfer.device.log` 中搜尋以下關鍵字：
- `token=`
- `authKey=`
- `encryptKey=`
- `huamiAuthKey=`

**範例：**
```json
{
  "token": "a1b2c3d4e5f6789012345678901234ab",
  ...
}
```

複製這個 32 位的十六進位字串（例如：`a1b2c3d4e5f6789012345678901234ab`）

#### 1.4 疑難排解

**問題：找不到 token**
- 等待更久（2-3 小時）
- 在小米運動 App 中同步手環數據
- 試著搜尋其他關鍵字：`encryptKey`、`authKey`

**問題：authKey 顯示為 NULL**
- 改找 `token` 或 `encryptKey` 欄位

---

### 方法 B：從資料庫取得（需 Root）

```bash
adb shell
su  # 需要 Root 權限
sqlite3 /data/data/com.xiaomi.wearable/databases/origin_db_* "SELECT AUTHKEY FROM DEVICE"
```

---

## 步驟 2：安裝 Gadgetbridge

### 2.1 下載安裝

**選項 1：F-Droid（推薦）**
- 下載 F-Droid：https://f-droid.org/
- 搜尋 "Gadgetbridge" 並安裝

**選項 2：GitHub Release**
- 前往：https://github.com/Freeyourgadget/Gadgetbridge/releases
- 下載最新的 `.apk` 檔案
- 安裝 APK（需開啟「允許安裝未知來源」）

### 2.2 授予權限

開啟 Gadgetbridge 並授予以下權限：
- ✅ 藍牙
- ✅ 位置（Android 藍牙掃描需要）
- ✅ 通知存取（選用）
- ✅ 儲存空間（選用）

---

## 步驟 3：配對手環到 Gadgetbridge

### 3.1 準備配對

1. **⚠️ 重要：不要從小米運動 App 取消配對！**
   - Auth Key 綁定手環的配對狀態
   - 取消配對或重置手環會讓 Key 失效

2. **停用小米運動 App 的藍牙權限**
   - 設定 → 應用程式 → Mi Fitness → 權限 → 藍牙 → 停用
   - 或直接解除安裝（可稍後重新安裝）

3. **重啟手機和手環**（建議）

### 3.2 開始配對

1. 開啟 Gadgetbridge
2. 點擊右下角的 **"+"** 按鈕
3. 點擊 **"Start discovery"** 開始掃描
4. 找到 **"Xiaomi Smart Band 9"** 或類似名稱
5. 點擊手環名稱

### 3.3 輸入 Auth Key

1. 會彈出視窗要求輸入 Auth Key
2. **格式：`0x` + 你的 32 位 Key**
   - 範例：`0xa1b2c3d4e5f6789012345678901234ab`
   - ⚠️ 必須加 `0x` 前綴（零 + 小寫 x）
   - ⚠️ 輸入後不要按 Enter，直接按確認

3. 等待配對完成

### 3.4 配對結果

**✅ 成功：**
- Gadgetbridge 主畫面顯示手環圖示
- 可以看到電池電量、步數等資訊
- 手環會震動一下

**❌ 卡在 "Authenticating"：**
- 檢查 Auth Key 格式（`0x` 開頭）
- 重啟手機和手環後重試
- ⚠️ 可能是小米手環 9 的 Gadgetbridge 支援尚未完善（截至 2025-10）

---

## 步驟 4：整合到 CyclePulse 網頁

### 目前狀況

❌ **Gadgetbridge 無法直接與網頁通訊**

需要額外開發橋接方案：

### 方案 A：開發 Android App (WebView)

建立一個簡單的 Android App，包含：
1. WebView 載入 CyclePulse 網頁
2. 監聽 Gadgetbridge 的 Intent 廣播
3. 將心率數據注入網頁的 JavaScript

**技術棧：**
- React Native + WebView（JS 開發者友善）
- 或 Kotlin + WebView（原生效能更好）

**預估開發時間：2-3 天**

### 方案 B：Tasker 自動化 + Firebase

使用 Tasker 監聽 Gadgetbridge 的數據變化，自動上傳到 Firebase：

```
Gadgetbridge → Tasker (監聽 Intent) → HTTP POST → Firebase → CyclePulse 網頁
```

**缺點：**
- 延遲 5-10 秒
- 用戶需要購買 Tasker (NT$120)
- 設定複雜

### 方案 C：Gadgetbridge HTTP Server (實驗性)

Gadgetbridge 有實驗性的 HTTP Server 功能：
1. 在 Gadgetbridge 設定中開啟 HTTP Server
2. 網頁透過 HTTP 輪詢讀取心率數據

**問題：**
- 需要同網域或 CORS 設定
- 延遲較高
- 功能可能不穩定

---

## 替代方案比較

| 方案 | 價格 | 開發難度 | 延遲 | 準確度 | 平台支援 |
|------|------|----------|------|--------|----------|
| **小米手環 9 + Gadgetbridge** | 已有 | ⭐⭐⭐⭐⭐ 困難 | 5-10秒 | ⭐⭐⭐⭐ | Android only |
| **Bangle.js 2** | ~NT$2,300 | ⭐⭐ 簡單 | <1秒 | ⭐⭐⭐ | iOS + Android |
| **Polar H10 心率帶** | ~NT$2,500 | ⭐⭐ 簡單 | <1秒 | ⭐⭐⭐⭐⭐ | iOS + Android |
| **CooSpo H6 心率帶** | ~NT$800 | ⭐⭐ 簡單 | <1秒 | ⭐⭐⭐⭐ | iOS + Android |
| **Health Connect + React Native** | 免費 | ⭐⭐⭐⭐ 中等 | 3-5秒 | ⭐⭐⭐⭐ | Android only |

---

## 建議

### 短期（立即可用）
**購買標準藍牙心率帶（推薦）**
- CooSpo H6 (NT$800) 或 Wahoo TICKR (NT$1,500)
- 原生支援 Web Bluetooth
- 現有程式碼稍微修改即可使用
- 支援 iOS + Android

### 中期（學習目的）
**嘗試 Gadgetbridge 配對**
- 學習如何取得 Auth Key
- 了解藍牙配對機制
- 但實際整合到網頁仍需額外開發

### 長期（最佳體驗）
**Bangle.js 2（最佳折衷方案）**
- 開源智慧手錶
- 原生支援 Web Bluetooth
- 可自訂程式
- 價格合理（~NT$2,300）
- 購買連結：https://shop.espruino.com/banglejs2

---

## 技術限制總結

### 為什麼小米手環 9 無法用 Web Bluetooth？

1. **加密配對機制**
   - 小米手環使用專屬的加密配對流程
   - 需要 Auth Key 才能連接
   - Web Bluetooth API 無法完成這個授權流程

2. **非標準協定**
   - 不使用標準 BLE Heart Rate Profile (0x180D)
   - 使用專屬的 UUID 和數據格式
   - 需要特殊的命令序列啟動心率監測

3. **健康數據保護**
   - 心率等健康數據屬於敏感資訊
   - 小米透過加密保護這些數據
   - 只有授權的 App（小米運動、Gadgetbridge）能訪問

4. **Gadgetbridge 支援狀態**
   - 小米手環 9 的支援正在開發中
   - 配對可能卡在 "Authenticating"
   - 部分功能可能不完整

---

## 參考資料

### 官方文件
- [Gadgetbridge 官網](https://gadgetbridge.org/)
- [Gadgetbridge 配對指南](https://gadgetbridge.org/basics/pairing/)
- [Huami/Xiaomi 伺服器配對](https://gadgetbridge.org/basics/pairing/huami-xiaomi-server/)

### GitHub Issues
- [Gadgetbridge Issue #4540 - Cannot get Auth Key for Mi Band 9](https://codeberg.org/Freeyourgadget/Gadgetbridge/issues/4540)
- [Gadgetbridge Issue #3930 - Xiaomi Smart Band 9 Support Request](https://codeberg.org/Freeyourgadget/Gadgetbridge/issues/3930)

### Bangle.js 資源
- [Bangle.js 官網](https://banglejs.com/)
- [Bangle.js 心率監測範例](https://github.com/NiqueWrld/Bangle.js-Heart-Monitoring-App)
- [Bangle.js 數據串流教學](https://github.com/espruino/EspruinoDocs/blob/master/tutorials/Bangle.js%20Data%20Streaming.md)

### 標準心率帶
- [Web Bluetooth Heart Rate Demo](https://googlechrome.github.io/samples/web-bluetooth/)
- [BLE Heart Rate Profile 規格](https://www.bluetooth.com/specifications/gatt/services/)

---

## 下次待辦事項

### 如果要繼續嘗試 Gadgetbridge：
- [ ] 取得小米手環 9 的 Auth Key
- [ ] 安裝 Gadgetbridge 並配對手環
- [ ] 測試 Gadgetbridge HTTP Server 功能
- [ ] 評估開發 Android App (WebView) 的可行性

### 如果購買硬體：
- [ ] 選擇心率帶型號（CooSpo H6 / Wahoo TICKR / Polar H10）
- [ ] 或選擇 Bangle.js 2 智慧手錶
- [ ] 修改 `public/miband.js` 以支援標準 Heart Rate Profile
- [ ] 整合到 Vue 主應用
- [ ] 測試 iOS + Android 相容性

---

## 結論

**小米手環 9 + Gadgetbridge 技術上可行，但實際整合到網頁非常複雜。**

**建議：**
1. 如果預算有限：購買 CooSpo H6 心率帶（NT$800）
2. 如果想要智慧手錶功能：購買 Bangle.js 2（NT$2,300）
3. 如果追求最準確：購買 Polar H10 心率帶（NT$2,500）

這些方案都能：
- ✅ 原生支援 Web Bluetooth
- ✅ 即時讀取心率（延遲 < 1 秒）
- ✅ 支援 iOS + Android
- ✅ 現有程式碼稍微修改即可使用
- ✅ 無需額外開發 Android App

---

*最後更新：2025-10-14*
