class MiBandConnector {
  constructor() {
    this.device = null;
    this.server = null;
    this.heartRateCharacteristic = null;
    this.controlCharacteristic = null;

    // 小米手環的藍牙服務 UUID（通用）
    this.MIBAND_SERVICE = '0000fee0-0000-1000-8000-00805f9b34fb';
    this.HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
    this.HEART_RATE_MEASUREMENT = '00002a37-0000-1000-8000-00805f9b34fb';
    this.HEART_RATE_CONTROL = '00002a39-0000-1000-8000-00805f9b34fb';

    // 小米特定特徵 UUID
    this.AUTH_CHARACTERISTIC = '00000009-0000-3512-2118-0009af100700';
    this.SENSOR_CHARACTERISTIC = '00000001-0000-3512-2118-0009af100700';
  }

  log(message) {
    const logDiv = document.getElementById('log');
    const time = new Date().toLocaleTimeString();
    logDiv.innerHTML += `[${time}] ${message}\n`;
    logDiv.scrollTop = logDiv.scrollHeight;
    console.log(message);
  }

  updateStatus(status) {
    document.getElementById('status').textContent = `狀態：${status}`;
  }

  async listAllServices() {
    try {
      this.log('🔍 掃描所有可用服務...');
      const services = await this.server.getPrimaryServices();
      this.log(`📋 找到 ${services.length} 個服務：`);

      for (const service of services) {
        this.log(`  📦 服務: ${service.uuid}`);
        try {
          const chars = await service.getCharacteristics();
          for (const char of chars) {
            this.log(`    └─ 特徵: ${char.uuid}`);
          }
        } catch (e) {
          this.log(`    └─ 無法讀取特徵: ${e.message}`);
        }
      }
      this.log('✅ 服務掃描完成');
    } catch (error) {
      this.log(`⚠️ 掃描服務失敗: ${error.message}`);
    }
  }

  async connect() {
    try {
      // 檢查瀏覽器支援
      if (!navigator.bluetooth) {
        throw new Error('此瀏覽器不支援 Web Bluetooth API');
      }

      this.log('🔍 開始掃描小米手環...');
      this.updateStatus('掃描中...');

      // 請求藍牙設備（顯示所有設備，不限制服務）
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'Xiaomi' }
        ],
        optionalServices: [
          this.MIBAND_SERVICE,
          '0000fee1-0000-1000-8000-00805f9b34fb',
          '0000180a-0000-1000-8000-00805f9b34fb',
          '0000180d-0000-1000-8000-00805f9b34fb',
          '00001530-0000-3512-2118-0009af100700',
          '00001800-0000-1000-8000-00805f9b34fb',
          '00001801-0000-1000-8000-00805f9b34fb'
        ]
      });

      this.log(`✅ 找到設備：${this.device.name}`);

      // 監聽斷線事件
      this.device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));

      // 連接 GATT 伺服器
      this.log('🔗 正在連接 GATT 伺服器...');
      this.server = await this.device.gatt.connect();
      this.log('✅ 已連接到 GATT 伺服器');

      this.updateStatus(`已連接：${this.device.name}`);

      // 先列出所有可用服務（這是最重要的！）
      await this.listAllServices();

      // 暫時跳過認證和心率設定，先看看有哪些服務
      this.log('⚠️ 請查看上方日誌中的服務列表');
      this.log('⚠️ 將服務 UUID 提供給開發者以繼續開發');

      document.getElementById('startBtn').disabled = true;
      return; // 先暫停，等看到服務列表再繼續

      // // 嘗試認證（某些型號需要）
      // await this.authenticate();

      // // 初始化心率服務
      // await this.setupHeartRate();

      // document.getElementById('startBtn').disabled = false;
      // this.log('🎉 連接完成！可以開始測量心率');

    } catch (error) {
      this.log(`❌ 連接錯誤：${error.message}`);
      this.updateStatus('連接失敗');
      throw error;
    }
  }

  async authenticate() {
    try {
      this.log('🔐 嘗試認證...');

      const service = await this.server.getPrimaryService(this.MIBAND_SERVICE);
      const authChar = await service.getCharacteristic(this.AUTH_CHARACTERISTIC);

      // 發送認證請求
      await authChar.writeValue(new Uint8Array([0x01, 0x00]));
      this.log('✅ 認證成功');

    } catch (error) {
      this.log(`⚠️ 認證失敗（可能不需要認證）：${error.message}`);
      // 某些型號不需要認證，繼續執行
    }
  }

  async setupHeartRate() {
    try {
      this.log('💓 設定心率服務...');

      // 先嘗試標準心率服務
      try {
        const service = await this.server.getPrimaryService(this.HEART_RATE_SERVICE);
        this.heartRateCharacteristic = await service.getCharacteristic(
          this.HEART_RATE_MEASUREMENT
        );
        this.log('✅ 使用標準心率服務');
        return;
      } catch (e) {
        this.log('⚠️ 標準心率服務不可用，嘗試小米專屬服務...');
      }

      // 使用小米專屬服務 (0000fee1)
      try {
        const miBandService = await this.server.getPrimaryService('0000fee1-0000-1000-8000-00805f9b34fb');
        this.log('✅ 找到小米專屬服務 0xFEE1');

        // 嘗試找心率特徵 (通常是 0x2A37 或小米自定義)
        const characteristics = await miBandService.getCharacteristics();
        this.log(`📋 找到 ${characteristics.length} 個特徵`);

        for (const char of characteristics) {
          this.log(`  - UUID: ${char.uuid}`);
        }

        // 嘗試使用感測器特徵
        this.heartRateCharacteristic = await miBandService.getCharacteristic(this.SENSOR_CHARACTERISTIC);
        this.log('✅ 使用小米感測器特徵');
      } catch (e) {
        this.log(`❌ 小米專屬服務失敗：${e.message}`);
        throw new Error('無法找到心率服務，請查看日誌中列出的可用特徵');
      }

    } catch (error) {
      this.log(`❌ 心率服務設定失敗：${error.message}`);
      throw error;
    }
  }

  async startHeartRateMonitoring() {
    try {
      this.log('▶️ 開始心率監測...');

      // 啟動連續測量（如果支援控制特徵）
      if (this.controlCharacteristic) {
        try {
          await this.controlCharacteristic.writeValue(new Uint8Array([0x15, 0x01, 0x01]));
          this.log('✅ 已啟動連續測量模式');
        } catch (e) {
          this.log('⚠️ 無法啟動連續模式，使用預設模式');
        }
      }

      // 監聽心率數據
      await this.heartRateCharacteristic.startNotifications();
      this.log('✅ 已啟動心率通知');

      this.heartRateCharacteristic.addEventListener(
        'characteristicvaluechanged',
        this.handleHeartRateChange.bind(this)
      );

      this.updateStatus('正在測量心率...');
      document.getElementById('startBtn').disabled = true;
      document.getElementById('stopBtn').disabled = false;

      this.log('💗 等待心率數據...');

    } catch (error) {
      this.log(`❌ 啟動監測失敗：${error.message}`);
      throw error;
    }
  }

  handleHeartRateChange(event) {
    const value = event.target.value;

    // 解析心率數據（標準 BLE Heart Rate Profile 格式）
    const flags = value.getUint8(0);
    const heartRateFormat = flags & 0x01;

    let heartRate;
    if (heartRateFormat === 0) {
      // UINT8 格式
      heartRate = value.getUint8(1);
    } else {
      // UINT16 格式
      heartRate = value.getUint16(1, true);
    }

    // 驗證心率數據合理性
    if (heartRate > 0 && heartRate < 250) {
      this.log(`💗 心率：${heartRate} BPM`);
      document.getElementById('heartRate').textContent = `${heartRate} BPM`;

      // 觸發回調函數（可用於上傳數據）
      this.onHeartRateUpdate(heartRate);
    } else {
      this.log(`⚠️ 收到異常心率值：${heartRate}`);
    }
  }

  async stopHeartRateMonitoring() {
    try {
      this.log('⏹️ 停止心率監測...');

      // 停止連續測量模式
      if (this.controlCharacteristic) {
        try {
          await this.controlCharacteristic.writeValue(new Uint8Array([0x15, 0x01, 0x00]));
          this.log('✅ 已停止連續測量模式');
        } catch (e) {
          this.log('⚠️ 停止連續模式失敗');
        }
      }

      // 停止通知
      if (this.heartRateCharacteristic) {
        await this.heartRateCharacteristic.stopNotifications();
        this.log('✅ 已停止心率通知');
      }

      this.updateStatus('已停止測量');
      document.getElementById('heartRate').textContent = '-- BPM';
      document.getElementById('startBtn').disabled = false;
      document.getElementById('stopBtn').disabled = true;

    } catch (error) {
      this.log(`❌ 停止失敗：${error.message}`);
    }
  }

  disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
      this.log('🔌 已斷開連接');
      this.updateStatus('未連接');
      document.getElementById('startBtn').disabled = true;
      document.getElementById('stopBtn').disabled = true;
    }
  }

  onDisconnected() {
    this.log('⚠️ 設備已斷線');
    this.updateStatus('設備已斷線');
    document.getElementById('heartRate').textContent = '-- BPM';
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = true;
  }

  // 回調函數：可以在這裡處理心率數據
  onHeartRateUpdate(heartRate) {
    // 在這裡可以將數據發送到伺服器或 Firebase
    console.log('收到心率數據:', heartRate, 'BPM');

    // 範例：發送到 Firebase Realtime Database
    // const userId = 'user123';
    // firebase.database().ref(`heartRate/${userId}`).push({
    //   value: heartRate,
    //   timestamp: Date.now()
    // });

    // 範例：發送到後端 API
    // fetch('/api/heartrate', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ heartRate, timestamp: Date.now() })
    // });
  }
}

// ==================== 初始化與事件綁定 ====================

const miBand = new MiBandConnector();

document.getElementById('connectBtn').addEventListener('click', async () => {
  try {
    await miBand.connect();
  } catch (error) {
    alert('連接失敗：' + error.message);
  }
});

document.getElementById('startBtn').addEventListener('click', async () => {
  try {
    await miBand.startHeartRateMonitoring();
  } catch (error) {
    alert('啟動測量失敗：' + error.message);
  }
});

document.getElementById('stopBtn').addEventListener('click', async () => {
  try {
    await miBand.stopHeartRateMonitoring();
  } catch (error) {
    alert('停止測量失敗：' + error.message);
  }
});

// 頁面關閉前斷開連接
window.addEventListener('beforeunload', () => {
  miBand.disconnect();
});

// 初始化日誌
document.addEventListener('DOMContentLoaded', () => {
  miBand.log('🚀 系統初始化完成');
  miBand.log('📱 請確保使用 Android Chrome 瀏覽器');
  miBand.log('🔒 請確保透過 HTTPS 訪問此頁面');

  // 檢查瀏覽器支援
  if (!navigator.bluetooth) {
    miBand.log('❌ 此瀏覽器不支援 Web Bluetooth API');
    miBand.updateStatus('瀏覽器不支援');
    document.getElementById('connectBtn').disabled = true;
  }
});
