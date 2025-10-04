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

  async connect() {
    try {
      // 檢查瀏覽器支援
      if (!navigator.bluetooth) {
        throw new Error('此瀏覽器不支援 Web Bluetooth API');
      }

      this.log('🔍 開始掃描小米手環...');
      this.updateStatus('掃描中...');

      // 請求藍牙設備（顯示所有設備）
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          this.MIBAND_SERVICE,
          this.HEART_RATE_SERVICE,
          '0000fee1-0000-1000-8000-00805f9b34fb'
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

      // 嘗試認證（某些型號需要）
      await this.authenticate();

      // 初始化心率服務
      await this.setupHeartRate();

      document.getElementById('startBtn').disabled = false;
      this.log('🎉 連接完成！可以開始測量心率');

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

      const service = await this.server.getPrimaryService(this.HEART_RATE_SERVICE);

      // 心率測量特徵
      this.heartRateCharacteristic = await service.getCharacteristic(
        this.HEART_RATE_MEASUREMENT
      );
      this.log('✅ 取得心率測量特徵');

      // 心率控制特徵（某些型號有）
      try {
        this.controlCharacteristic = await service.getCharacteristic(
          this.HEART_RATE_CONTROL
        );
        this.log('✅ 取得心率控制特徵');
      } catch (e) {
        this.log('⚠️ 無控制特徵（某些型號正常）');
      }

      this.log('✅ 心率服務已就緒');

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
