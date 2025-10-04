# 1. 心率監測整合

## 測試結論
- ❌ 小米手環 9 Pro 無法透過 Web Bluetooth 讀取心率（需加密授權）
- ✅ 可連接並讀取基本資訊，但無實用價值
- 📄 詳細測試結果：`docs/bluetooth-todo.md`

## 可行方案

### 方案 A：購買標準 BLE 心率帶（推薦）
**優點：**
- 原生支援 Web Bluetooth
- 不需要任何 App
- 心率數據更準確（胸帶 vs 手腕）
- 支援 iOS + Android
- 程式碼簡單（稍微修改現有 miband.js 即可）

**推薦型號：**
- CooSpo H6（約 NT$800）- 預算選擇
- Wahoo TICKR（約 NT$1,500）- CP 值高
- Polar H10（約 NT$2,500）- 最準確

**實作步驟：**
1. ⏳ 購買心率帶
2. ⏳ 修改 `public/miband.js` 支援標準 Heart Rate Profile (0x180D)
3. ⏳ 整合到 Vue 主應用（新增 `src/stores/heartRate.js`）
4. ⏳ 在訓練過程中即時顯示心率
5. ⏳ 記錄心率數據到 localStorage

### 方案 B：Health Connect 整合（中長期）
**優點：**
- 免費使用現有小米手環
- Android 用戶體驗好

**缺點：**
- 只支援 Android（iOS 無法使用）
- 需要開發原生 App（React Native 或 Kotlin）
- 開發成本高

**實作步驟：**
1. ⏳ 學習 React Native 基礎
2. ⏳ 開發 Android App 讀取 Health Connect
3. ⏳ 透過 WebView 嵌入 CyclePulse 網頁
4. ⏳ 實作心率數據即時傳遞
5. ⏳ 發布到 Google Play Store

**詳細技術方案：** `docs/health-connect-solution.md`

### 方案 C：手動輸入（臨時方案）
**實作步驟：**
1. ⏳ 新增心率輸入框
2. ⏳ 允許用戶手動更新心率
3. ⏳ 顯示在訓練介面

## 建議執行順序
1. **先實作方案 C**（手動輸入）- 1 小時內完成
2. **購買心率帶測試方案 A** - 驗證產品方向
3. **如果效果好，考慮開發方案 B** - 給 Android 用戶更多選擇

---

# 2. 教練模式

我有一個飛輪web
我想開發教練模式
由教練端控制學員的手機

這樣是不是要用web socket的技術
如果我的web放在github pages上
要怎麼實現

是的，使用 WebSocket 是實現即時控制的好選擇！但 GitHub Pages 只能託管靜態網頁，無法運行 WebSocket 伺服器。讓我幫你分析幾種可行方案：

架構建議
方案 1：使用免費的 WebSocket 服務（推薦入門）
前端：GitHub Pages 託管
WebSocket 伺服器：使用第三方服務
Firebase Realtime Database 或 Firestore（Google 提供，有免費額度）
Supabase（有免費方案，支援即時訂閱）
Pusher（專門做即時通訊，有免費額度）
方案 2：自建後端
前端：GitHub Pages
WebSocket 伺服器：部署到
Render（免費方案）
Railway（有免費額度）
Fly.io（免費方案）
Heroku（需付費）
推薦實作流程（以 Firebase 為例）
javascript
// 教練端控制
import { getDatabase, ref, set } from 'firebase/database';

const db = getDatabase();
function sendCommand(studentId, command) {
  set(ref(db, `sessions/${studentId}/command`), {
    type: command.type,  // 'resistance', 'speed', 'stop'
    value: command.value,
    timestamp: Date.now()
  });
}

// 學員端接收
import { onValue } from 'firebase/database';

const commandRef = ref(db, `sessions/${myStudentId}/command`);
onValue(commandRef, (snapshot) => {
  const command = snapshot.val();
  // 執行控制指令
  applyCommand(command);
});
功能設計建議
教練端需要：

學員列表顯示
即時數據監控（速度、阻力、心率等）
發送控制指令介面
學員端需要：

接收並執行教練指令
上傳即時運動數據
顯示當前訓練狀態
你目前飛輪 web 是用什麼技術開發的？React、Vue 還是原生 JavaScript？這樣我可以給你更具體的程式碼範例。