# Garmin HRM-Dual 心率帶整合指南

## 📋 目錄

- [設備選購](#設備選購)
- [Web Bluetooth 整合](#web-bluetooth-整合)
- [完整範例程式碼](#完整範例程式碼)
- [整合到飛輪教練系統](#整合到飛輪教練系統)
- [使用注意事項](#使用注意事項)
- [常見問題](#常見問題)
- [參考資源](#參考資源)

---

## 設備選購

### 推薦型號：Garmin HRM-Dual

**價格：** NT$ 1,990-2,290

**優點：**
- ✅ 支援標準藍牙心率協議（Web Bluetooth API 直接可用）
- ✅ 同時支援 ANT+ 和藍牙 5.0
- ✅ 可同時連接兩個設備
- ✅ CR2032 電池（便利商店就能買）
- ✅ 電池壽命約 3.5 年
- ✅ 防水等級 5ATM（游泳可用）

**缺點：**
- ⚠️ 需綁在胸前（有些人覺得不舒服）

### 其他選項

#### Garmin HRM-Pro Plus（NT$ 3,990-4,490）
- 所有 HRM-Dual 的功能
- 額外有跑步動態數據
- 內建記憶體（可離線記錄）
- ⚠️ 價格較高，飛輪訓練用不到進階功能

#### Garmin HRM-Fit（NT$ 2,990）
- 綁在手臂或前臂（不用綁胸）
- 標準藍牙協議
- 舒適度較高
- ⚠️ 準確度略低於胸帶

### 購買通路

**實體店面：**
- Garmin 專賣店（信義區、台中、高雄）
- 迪卡儂 Decathlon
- 運動用品店（運動筆記合作店家）
- 燦坤、全國電子（部分門市）

**線上：**
- Garmin 官網
- momo、PChome
- 運動筆記商城

**售後服務：**
- 台灣有 Garmin 官方維修中心
- 保固通常 1 年
- 電池沒電自己換即可（CR2032，NT$ 20-30）

---

## Web Bluetooth 整合

### 瀏覽器支援

- ✅ Android Chrome
- ✅ 桌面 Chrome / Edge
- ❌ iOS Safari（不支援 Web Bluetooth）

### 基本連接流程

```javascript
// 1. 請求藍牙設備
const device = await navigator.bluetooth.requestDevice({
  filters: [{ services: ['heart_rate'] }]
});

// 2. 連接 GATT 服務
const server = await device.gatt.connect();
const service = await server.getPrimaryService('heart_rate');
const characteristic = await service.getCharacteristic('heart_rate_measurement');

// 3. 監聽心率變化
characteristic.addEventListener('characteristicvaluechanged', (event) => {
  const value = event.target.value;
  const heartRate = value.getUint8(1);
  console.log('心率:', heartRate);
});

// 4. 開始接收通知
await characteristic.startNotifications();
```

---

## 完整範例程式碼

### 單人心率監測頁面

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Garmin 心率監測</title>
  <style>
    body {
      font-family: 'Microsoft JhengHei', Arial, sans-serif;
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      text-align: center;
    }
    button {
      padding: 15px 30px;
      font-size: 18px;
      margin: 10px;
      background: #007acc;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    #heartRate {
      font-size: 72px;
      color: #e74c3c;
      margin: 40px 0;
      font-weight: bold;
    }
    .status {
      padding: 15px;
      background: #f0f0f0;
      border-radius: 5px;
      margin: 20px 0;
    }
    .connected { background: #d4edda; color: #155724; }
    .measuring { background: #fff3cd; color: #856404; }
  </style>
</head>
<body>
  <h1>💓 Garmin 心率監測</h1>

  <button id="connectBtn">連接 Garmin 心率帶</button>
  <button id="disconnectBtn" disabled>斷開連接</button>

  <div id="status" class="status">等待連接...</div>

  <div id="heartRate">-- BPM</div>

  <div id="info" style="color: #666; font-size: 14px;">
    <p>📱 請確保：</p>
    <p>1. 使用 Android Chrome 或桌面 Chrome</p>
    <p>2. 心率帶已開機（綁好會自動開機）</p>
    <p>3. 藍牙已開啟</p>
  </div>

  <script>
    let device = null;
    let characteristic = null;

    const connectBtn = document.getElementById('connectBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');
    const statusDiv = document.getElementById('status');
    const heartRateDiv = document.getElementById('heartRate');

    function updateStatus(message, className = '') {
      statusDiv.textContent = message;
      statusDiv.className = 'status ' + className;
    }

    function updateHeartRate(bpm) {
      heartRateDiv.textContent = `${bpm} BPM`;
      sendToServer(bpm);
    }

    function sendToServer(heartRate) {
      console.log('發送心率:', heartRate);

      // 範例：發送到後端
      // fetch('/api/heartrate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ heartRate, timestamp: Date.now() })
      // });
    }

    connectBtn.addEventListener('click', async () => {
      try {
        updateStatus('🔍 搜尋 Garmin 設備...', 'measuring');

        device = await navigator.bluetooth.requestDevice({
          filters: [{ services: ['heart_rate'] }]
        });

        updateStatus('🔗 連接中...', 'measuring');

        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('heart_rate');
        characteristic = await service.getCharacteristic('heart_rate_measurement');

        await characteristic.startNotifications();

        characteristic.addEventListener('characteristicvaluechanged', (event) => {
          const value = event.target.value;
          const flags = value.getUint8(0);
          const rate16Bits = flags & 0x1;

          let heartRate;
          if (rate16Bits) {
            heartRate = value.getUint16(1, true);
          } else {
            heartRate = value.getUint8(1);
          }

          if (heartRate > 0 && heartRate < 250) {
            updateHeartRate(heartRate);
          }
        });

        updateStatus(`✅ 已連接：${device.name}`, 'connected');
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;

      } catch (error) {
        updateStatus(`❌ 連接失敗：${error.message}`);
        console.error('錯誤:', error);
      }
    });

    disconnectBtn.addEventListener('click', () => {
      if (device && device.gatt.connected) {
        device.gatt.disconnect();
        updateStatus('已斷開連接');
        heartRateDiv.textContent = '-- BPM';
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
      }
    });

    window.addEventListener('beforeunload', () => {
      if (device && device.gatt.connected) {
        device.gatt.disconnect();
      }
    });
  </script>
</body>
</html>
```

---

## 整合到飛輪教練系統

### Svelte Store 整合

```javascript
// src/stores/garminHeartRate.js
import { writable } from 'svelte/store';

export const heartRate = writable(0);
export const isConnected = writable(false);
export const deviceName = writable('');

let device = null;
let characteristic = null;

export async function connectGarminHRM() {
  try {
    device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }]
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService('heart_rate');
    characteristic = await service.getCharacteristic('heart_rate_measurement');

    await characteristic.startNotifications();

    characteristic.addEventListener('characteristicvaluechanged', (event) => {
      const value = event.target.value;
      const flags = value.getUint8(0);
      const rate16Bits = flags & 0x1;

      let hr;
      if (rate16Bits) {
        hr = value.getUint16(1, true);
      } else {
        hr = value.getUint8(1);
      }

      if (hr > 0 && hr < 250) {
        heartRate.set(hr);
      }
    });

    isConnected.set(true);
    deviceName.set(device.name);

    return { success: true, deviceName: device.name };
  } catch (error) {
    console.error('連接失敗:', error);
    return { success: false, error: error.message };
  }
}

export function disconnectGarminHRM() {
  if (device && device.gatt.connected) {
    device.gatt.disconnect();
  }
  isConnected.set(false);
  heartRate.set(0);
  deviceName.set('');
}
```

### 在 Svelte 組件中使用

```svelte
<script>
  import { heartRate, isConnected, connectGarminHRM, disconnectGarminHRM } from '$lib/stores/garminHeartRate';

  let status = '等待連接...';

  async function handleConnect() {
    status = '連接中...';
    const result = await connectGarminHRM();

    if (result.success) {
      status = `✅ 已連接：${result.deviceName}`;
    } else {
      status = `❌ 連接失敗：${result.error}`;
    }
  }

  function handleDisconnect() {
    disconnectGarminHRM();
    status = '已斷開連接';
  }
</script>

<div class="heart-rate-monitor">
  <h2>💓 心率監測</h2>

  {#if !$isConnected}
    <button on:click={handleConnect}>連接 Garmin 心率帶</button>
  {:else}
    <button on:click={handleDisconnect}>斷開連接</button>
  {/if}

  <div class="status">{status}</div>

  <div class="heart-rate" class:active={$isConnected}>
    {$heartRate || '--'} BPM
  </div>
</div>

<style>
  .heart-rate {
    font-size: 72px;
    color: #e74c3c;
    font-weight: bold;
    margin: 40px 0;
  }
  .heart-rate.active {
    animation: pulse 1s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
</style>
```

### Firebase 多學員監控

```javascript
// 教練端監控多位學員心率
import { getDatabase, ref, onValue, set } from 'firebase/database';

const db = getDatabase();

// 學員端：發送心率數據
export function sendHeartRateToFirebase(classId, studentId, heartRate) {
  const studentRef = ref(db, `classes/${classId}/students/${studentId}`);
  set(studentRef, {
    heartRate,
    timestamp: Date.now(),
    name: localStorage.getItem('studentName') || '學員'
  });
}

// 教練端：監控所有學員
export function monitorStudents(classId, callback) {
  const studentsRef = ref(db, `classes/${classId}/students`);

  onValue(studentsRef, (snapshot) => {
    const students = snapshot.val() || {};
    callback(students);
  });
}

// 使用範例
monitorStudents('class-001', (students) => {
  Object.entries(students).forEach(([id, data]) => {
    console.log(`${data.name}: ${data.heartRate} BPM`);

    // 根據心率顯示警告
    if (data.heartRate > 180) {
      alert(`⚠️ ${data.name} 心率過高！`);
    }
  });
});
```

---

## 使用注意事項

### 首次配戴

1. **電極片要濕潤**
   - 噴點水或汗水在電極片上
   - 確保皮膚與電極片良好接觸

2. **正確綁法**
   - 綁在胸部下緣（胸肌下方）
   - 略緊但不壓迫呼吸
   - 感應器在胸骨正中間

3. **開機方式**
   - 綁好後會自動開機
   - 或手動按壓感應器 2 秒

### 電池更換

- **何時更換：** 心率顯示不穩定或為 0
- **電池型號：** CR2032 鈕扣電池（便利商店有售）
- **更換步驟：**
  1. 用硬幣轉開背蓋（逆時針）
  2. 取出舊電池
  3. 裝入新電池（+極朝上）
  4. 轉緊背蓋（順時針）

### 清潔保養

- **織帶：** 用清水沖洗，不要用洗衣機
- **感應器：** 用濕布擦拭，避免泡水
- **消毒：** 用 75% 酒精棉片擦拭（多人使用時）
- **晾乾：** 自然晾乾，避免陽光直射

### 多人使用建議

如果你要在健身房或工作室使用：

1. **購買數量：** 建議 5-10 條
2. **標籤管理：** 每條貼上編號
3. **衛生管理：** 準備酒精棉片
4. **備用電池：** 至少準備 3-5 顆

---

## 常見問題

### Q1: 心率顯示為 0 或不穩定？

**原因：** 電極片太乾，接觸不良

**解決方法：**
1. 噴水在電極片上
2. 重新調整綁帶鬆緊
3. 確認電池是否有電

### Q2: 無法連接藍牙？

**原因：** 心率帶未開機或距離太遠

**解決方法：**
1. 重新綁緊啟動
2. 手動按壓感應器 2 秒
3. 確認藍牙已開啟
4. 靠近電腦/手機再試

### Q3: 數值跳動太大？

**原因：** 電池快沒電或電極片接觸不良

**解決方法：**
1. 更換電池
2. 清潔電極片
3. 重新濕潤並配戴

### Q4: iOS 能用嗎？

**答：** iOS Safari 不支援 Web Bluetooth

**替代方案：**
1. 開發 iOS App（使用 CoreBluetooth）
2. 使用 Capacitor 包成 App
3. 學員使用 Android 設備
4. 使用相機測心率作為替代

### Q5: 可以同時連接多個設備嗎？

**答：** HRM-Dual 可同時連接 2 個藍牙設備

**使用場景：**
- 學員手機 + 教練平板
- 手機 + 飛輪機台

---

## 參考資源

### 官方文件

- [Garmin HRM-Dual 產品頁](https://www.garmin.com/zh-TW/p/641230)
- [Garmin 支援中心](https://support.garmin.com/)

### 教學影片

- [HRM-Dual 使用教學](https://www.youtube.com/watch?v=vyLW5MewWzo)

### Web Bluetooth API

- [MDN Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [Web Bluetooth Samples](https://googlechrome.github.io/samples/web-bluetooth/)
- [Heart Rate Service UUID](https://www.bluetooth.com/specifications/gatt/services/)

### 藍牙心率協議

- **Service UUID:** `0x180D` (Heart Rate Service)
- **Characteristic UUID:** `0x2A37` (Heart Rate Measurement)

**數據格式：**
```
Byte 0: Flags
  - Bit 0: Heart Rate Value Format (0 = UINT8, 1 = UINT16)
  - Bit 1-2: Sensor Contact Status
  - Bit 3: Energy Expended Status
  - Bit 4: RR-Interval

Byte 1 (or 1-2): Heart Rate Value (BPM)
```

---

## 快速對比表

| 設備 | 價格 | Web 開發難度 | 準確度 | 運動穩定性 |
|------|------|-------------|-------|-----------|
| **Garmin HRM-Dual** | $$ | ⭐ 超簡單 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Garmin HRM-Pro Plus | $$$ | ⭐ 超簡單 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Polar H10 | $$$ | ⭐ 超簡單 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 小米手環 | $$ | ⭐⭐⭐⭐⭐ 很難 | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 相機測心率 | 免費 | ⭐⭐ 簡單 | ⭐⭐⭐ | ⭐ 不適合運動中 |

---

## 總結

### 為什麼選擇 Garmin HRM-Dual？

1. ✅ **開發簡單：** 5 行程式碼就能讀取心率
2. ✅ **準確度高：** 胸帶式測量，誤差 <1%
3. ✅ **穩定可靠：** 運動中不掉線
4. ✅ **售後方便：** 台灣有官方維修中心
5. ✅ **成本合理：** NT$ 2,000 左右，電池可用 3.5 年

### 快速開始檢查清單

- [ ] 購買 Garmin HRM-Dual
- [ ] 測試 Web Bluetooth 連接
- [ ] 整合到現有專案
- [ ] 測試多人連接（如需要）
- [ ] 準備備用電池
- [ ] 制定清潔保養流程

---

**文件版本：** 1.0
**最後更新：** 2025-10-16
**適用專案：** CyclePulse 飛輪教練系統
