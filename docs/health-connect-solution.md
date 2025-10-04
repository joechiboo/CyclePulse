# Health Connect 整合方案

## 架構設計

### 方案 A：混合 App（推薦）

```
小米手環 9 Pro
    ↓ (藍牙)
小米運動 App (Zepp Life)
    ↓ (自動同步)
Health Connect (Android 14+)
    ↓ (Health Connect API)
你的 Android App (Kotlin/React Native)
    ↓ (WebView)
CyclePulse Vue 網頁
```

**優點：**
- ✅ 可以即時讀取心率數據
- ✅ 利用現有的 Vue 網頁程式碼
- ✅ Android 用戶體驗佳

**缺點：**
- ❌ 只支援 Android
- ❌ 需要開發原生 App
- ❌ iOS 用戶無法使用

### 方案 B：PWA + Tasker 自動化（創意方案）

```
小米手環 → 小米運動 → Health Connect
    ↓
Tasker/MacroDroid (Android 自動化工具)
    ↓ (HTTP POST)
Firebase Realtime Database
    ↓ (即時訂閱)
CyclePulse PWA 網頁
```

**優點：**
- ✅ 不需要開發原生 App
- ✅ 純網頁技術
- ✅ 跨平台（網頁部分）

**缺點：**
- ❌ 設定複雜（用戶需要安裝 Tasker）
- ❌ 只支援 Android
- ❌ 延遲較高（約 5-10 秒）

---

## 實作步驟（方案 A：混合 App）

### 1. 開發 Android App

#### 選項 1：React Native（推薦，你熟悉 JS）

```bash
# 建立新專案
npx react-native init CyclePulseApp

# 安裝 Health Connect 套件
npm install react-native-health-connect
```

**App.js 範例：**
```javascript
import { WebView } from 'react-native-webview';
import { readRecords, SdkAvailabilityStatus } from 'react-native-health-connect';

export default function App() {
  const [heartRate, setHeartRate] = useState(null);

  // 讀取即時心率
  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await readRecords('HeartRate', {
        timeRangeFilter: {
          operator: 'between',
          startTime: new Date(Date.now() - 60000).toISOString(), // 最近 1 分鐘
          endTime: new Date().toISOString(),
        },
      });

      if (result.records.length > 0) {
        const latestHR = result.records[0].beatsPerMinute;
        setHeartRate(latestHR);
      }
    }, 3000); // 每 3 秒更新

    return () => clearInterval(interval);
  }, []);

  return (
    <WebView
      source={{ uri: 'https://joechiboo.github.io/CyclePulse' }}
      injectedJavaScript={`
        window.NativeHeartRate = ${heartRate};
        window.dispatchEvent(new Event('heartrate-update'));
      `}
    />
  );
}
```

#### 選項 2：Kotlin（原生開發）

```kotlin
// MainActivity.kt
class MainActivity : AppCompatActivity() {
    private val healthConnectClient by lazy { HealthConnectClient.getOrCreate(this) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val webView = WebView(this)
        webView.settings.javaScriptEnabled = true

        // 每 3 秒讀取心率
        GlobalScope.launch {
            while (true) {
                val heartRate = readHeartRate()
                webView.evaluateJavascript(
                    "window.NativeHeartRate = $heartRate; " +
                    "window.dispatchEvent(new Event('heartrate-update'));",
                    null
                )
                delay(3000)
            }
        }

        webView.loadUrl("https://joechiboo.github.io/CyclePulse")
        setContentView(webView)
    }

    private suspend fun readHeartRate(): Int {
        val response = healthConnectClient.readRecords(
            ReadRecordsRequest(
                recordType = HeartRateRecord::class,
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.now().minus(1, ChronoUnit.MINUTES),
                    Instant.now()
                )
            )
        )
        return response.records.firstOrNull()?.samples?.lastOrNull()?.beatsPerMinute ?: 0
    }
}
```

### 2. 修改 Vue 網頁接收心率

**src/stores/heartRate.js**（新增）
```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHeartRateStore = defineStore('heartRate', () => {
  const currentHeartRate = ref(0)
  const isConnected = ref(false)
  const source = ref('none') // 'native' | 'bluetooth' | 'none'

  // 監聽原生 App 傳入的心率
  if (typeof window !== 'undefined') {
    window.addEventListener('heartrate-update', () => {
      if (window.NativeHeartRate) {
        currentHeartRate.value = window.NativeHeartRate
        isConnected.value = true
        source.value = 'native'
      }
    })
  }

  return {
    currentHeartRate,
    isConnected,
    source
  }
})
```

**src/components/HeartRateDisplay.vue**（新增）
```vue
<template>
  <div class="heart-rate-display">
    <div v-if="heartRateStore.isConnected" class="connected">
      <span class="icon">❤️</span>
      <span class="value">{{ heartRateStore.currentHeartRate }}</span>
      <span class="unit">BPM</span>
      <span class="source">({{ sourceLabel }})</span>
    </div>
    <div v-else class="disconnected">
      <span>心率監測未連接</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHeartRateStore } from '@/stores/heartRate'

const heartRateStore = useHeartRateStore()

const sourceLabel = computed(() => {
  switch (heartRateStore.source) {
    case 'native': return 'Health Connect'
    case 'bluetooth': return '藍牙心率帶'
    default: return '未連接'
  }
})
</script>
```

### 3. 用戶設定流程

1. 安裝你的 Android App
2. 在小米運動 App 中開啟「Health Connect 同步」
   - 設定 → 第三方接入 → Health Connect → 開啟心率同步
3. 授權你的 App 讀取 Health Connect 數據
4. 開始訓練時，App 會自動讀取心率並顯示在網頁中

---

## 實作步驟（方案 B：Tasker 自動化）

### 1. 使用者安裝設定

**用戶需要安裝：**
- Tasker（約 NT$120）或 MacroDroid（免費版可用）
- HTTP Request Shortcuts（免費）

**Tasker 設定：**
```
Profile: Health Connect 心率變化
  Event: Health Connect Data Changed
    Data Type: Heart Rate

Task: 上傳心率到 Firebase
  1. HTTP Post
     URL: https://YOUR-PROJECT.firebaseio.com/heartrate/USER_ID.json
     Body: {"value": %hr_value, "timestamp": %TIMES}
     Headers:
       Content-Type: application/json
       Authorization: Bearer YOUR_FIREBASE_TOKEN
```

### 2. Vue 網頁訂閱 Firebase

```javascript
// src/stores/heartRate.js
import { ref, onMounted } from 'vue'
import { getDatabase, ref as dbRef, onValue } from 'firebase/database'

export const useHeartRateStore = defineStore('heartRate', () => {
  const currentHeartRate = ref(0)
  const isConnected = ref(false)

  onMounted(() => {
    const db = getDatabase()
    const heartRateRef = dbRef(db, 'heartrate/USER_ID')

    onValue(heartRateRef, (snapshot) => {
      const data = snapshot.val()
      if (data && Date.now() - data.timestamp < 10000) { // 10 秒內的數據
        currentHeartRate.value = data.value
        isConnected.value = true
      } else {
        isConnected.value = false
      }
    })
  })

  return { currentHeartRate, isConnected }
})
```

---

## 成本與難度比較

| 方案 | 開發難度 | 用戶設定難度 | 成本 | 延遲 | 支援平台 |
|------|----------|--------------|------|------|----------|
| **標準藍牙心率帶** | ⭐⭐ 簡單 | ⭐ 超簡單 | NT$800-2,500 | < 1 秒 | Android + iOS |
| **Health Connect + React Native** | ⭐⭐⭐⭐ 中等 | ⭐⭐ 簡單 | 免費 | 3-5 秒 | Android only |
| **Health Connect + Kotlin** | ⭐⭐⭐⭐⭐ 困難 | ⭐⭐ 簡單 | 免費 | 3-5 秒 | Android only |
| **Tasker + Firebase** | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐⭐ 超複雜 | NT$120 (Tasker) | 5-10 秒 | Android only |

---

## 建議

### 短期（1-2 週內）
**買標準藍牙心率帶（推薦）**
- 實作簡單，現有程式碼稍微修改即可
- 用戶體驗最好
- 支援 iOS + Android
- 心率數據更準確

### 中期（1-2 個月）
**開發 React Native App + Health Connect**
- 如果你想學習 React Native
- 如果大部分用戶是 Android
- 可以利用現有小米手環

### 長期
**混合方案**
- Android 用戶：Health Connect
- iOS 用戶：建議使用藍牙心率帶
- 網頁自動偵測平台，選擇對應方案

---

## 推薦順序

1. **先買一個便宜的藍牙心率帶**（CooSpo H6，約 NT$800）
   - 快速驗證功能
   - 體驗即時心率監測
   - 確認產品方向

2. **如果效果好，再考慮開發 Health Connect 整合**
   - 給 Android 用戶更好的體驗
   - 不需要額外購買硬體

3. **最終提供雙選項**
   - 有藍牙心率帶 → 直接連接（最佳體驗）
   - 有小米手環 + Android → Health Connect（免費方案）
   - 都沒有 → 手動輸入或建議購買心率帶
