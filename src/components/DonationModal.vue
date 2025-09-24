<template>
	<transition name="modal" appear>
		<div v-if="isVisible" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" @click="handleOverlayClick">
			<div class="modal-content bg-white text-cycle-dark rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto" @click.stop>
				<!-- Header -->
				<div class="text-center mb-6">
					<button @click="$emit('close')" class="float-right text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
					<h2 class="text-2xl font-bold text-cycle-dark mb-2">💝 支持 CyclePulse</h2>
					<p class="text-gray-600">您的贊助是我們持續開發的動力！</p>
				</div>

				<!-- Donation Options -->
				<div class="donation-options space-y-3 mb-6">
					<button
						v-for="option in donationOptions"
						:key="option.id"
						@click="selectDonation(option)"
						class="donation-option w-full p-4 border-2 border-green-500 bg-green-50 rounded-lg text-left transition-all duration-200 hover:border-green-600 hover:bg-green-100"
						:class="{ 'border-green-600 bg-green-100 shadow-md': selectedOption?.id === option.id }"
					>
						<div class="flex items-center justify-between">
							<div>
								<div class="font-semibold text-lg">{{ option.emoji }} {{ option.title }}</div>
								<div class="text-sm text-gray-600 mt-1">{{ option.description }}</div>
							</div>
							<div class="text-xl font-bold text-green-600">${{ option.amount.toLocaleString() }}</div>
						</div>
					</button>
				</div>

				<!-- LinePay Button -->
				<div class="linepay-section">
					<button
						@click="proceedToLinePay"
						:disabled="!selectedOption"
						class="linepay-button w-full py-6 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-4 relative overflow-hidden"
						:class="{
							'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl': selectedOption,
							'bg-gray-300 text-gray-500 cursor-not-allowed': !selectedOption,
						}"
					>
						<div class="flex items-center space-x-4">
							<img src="/linePay.png" alt="LINE Pay" class="h-10 w-auto object-contain" @error="handleImageError" />
							<span class="text-xl">LINE Pay 立即贊助</span>
						</div>

						<!-- Mobile hint -->
						<div v-if="isMobile" class="absolute top-0 right-2 text-xs opacity-75">直接跳轉</div>
					</button>

					<!-- Desktop hint -->
					<div v-if="!isMobile" class="text-center mt-3">
						<div class="text-xs text-gray-500">📱 點擊按鈕將顯示 QR Code 供手機掃描</div>
					</div>
				</div>

				<!-- QR Code Display for Desktop -->
				<div v-if="showQRCode && !isMobile" class="qr-code-section mt-6 text-center">
					<div class="bg-gray-50 p-6 rounded-lg border">
						<div class="text-lg font-semibold mb-4">掃描 QR Code 完成贊助</div>
						<div class="flex justify-center mb-4">
							<div class="qr-code-container bg-white p-4 rounded-lg shadow-md">
								<canvas ref="qrCanvas" width="200" height="200" class="border"></canvas>
							</div>
						</div>
						<div class="text-sm text-gray-600 mb-4">
							贊助金額：<span class="font-bold text-green-600">${{ selectedOption?.amount.toLocaleString() }}</span>
						</div>
						<button @click="showQRCode = false" class="text-sm text-gray-500 hover:text-gray-700">
							← 返回
						</button>
					</div>
				</div>

				<!-- Info -->
				<div v-if="!showQRCode" class="info-section mt-6 text-center">
					<div class="text-xs text-gray-500 space-y-1">
						<div>💡 贊助完全自願，應用永久免費使用</div>
						<div>🔒 使用 LINE 官方轉帳功能，安全可靠</div>
						<div>❤️ 感謝您對開源項目的支持！</div>
					</div>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>
	import { ref, computed, nextTick } from 'vue';
	import QRCode from 'qrcode';

	export default {
		name: 'DonationModal',
		props: {
			isVisible: {
				type: Boolean,
				default: false,
			},
		},
		emits: ['close'],
		setup(props, { emit }) {
			const selectedOption = ref(null);
			const showQRCode = ref(false);
			const qrCanvas = ref(null);

			// 檢測是否為手機設備
			const isMobile = ref(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

			const donationOptions = ref([
				{
					id: 'coffee',
					emoji: '☕',
					title: '一杯咖啡',
					description: '給作者加油打氣',
					amount: 100,
				},
				{
					id: 'meal',
					emoji: '🍽️',
					title: '一頓大餐',
					description: '支持持續開發',
					amount: 1000,
				},
				{
					id: 'dream',
					emoji: '🌟',
					title: '實現願望',
					description: '花一個晚上執行',
					amount: 3000,
				},
			]);

			const selectDonation = (option) => {
				selectedOption.value = option;
			};

			const handleOverlayClick = () => {
				emit('close');
			};

			const handleImageError = (event) => {
				// 如果 linePay.png 載入失敗，隱藏圖片
				event.target.style.display = 'none';
			};

			const generateLinePayUrl = (amount) => {
				// 使用實際的 LINE Pay 轉帳連結
				// 基於提供的 LINE 連結：https://line.me/R/ch/1586237320/?forwardPath=/c2c/transfer&no=20271936013
				const baseUrl = 'https://line.me/R/ch/1586237320/';
				const params = new URLSearchParams({
					forwardPath: '/c2c/transfer',
					no: '20271936013',
					amount: amount, // 添加金額參數
					memo: `CyclePulse 贊助 - $${amount}` // 添加備註
				});

				return `${baseUrl}?${params.toString()}`;
			};

			const generateQRCode = async (url) => {
				try {
					await nextTick();
					if (qrCanvas.value) {
						await QRCode.toCanvas(qrCanvas.value, url, {
							width: 200,
							margin: 2,
							color: {
								dark: '#000000',
								light: '#FFFFFF'
							}
						});
					}
				} catch (error) {
					console.error('QR Code generation failed:', error);
				}
			};

			const proceedToLinePay = async () => {
				const amount = selectedOption.value?.amount;

				if (amount && amount >= 50) {
					console.log(`準備使用 LINE Pay 贊助 $${amount}`);
					const linePayUrl = generateLinePayUrl(amount);

					if (isMobile.value) {
						// 手機端：直接跳轉到 LINE 轉帳
						window.open(linePayUrl, '_blank');
						// 關閉 modal
						emit('close');
					} else {
						// 桌面端：顯示 QR Code
						showQRCode.value = true;
						await generateQRCode(linePayUrl);
					}
				}
			};

			return {
				selectedOption,
				donationOptions,
				isMobile,
				showQRCode,
				qrCanvas,
				selectDonation,
				handleOverlayClick,
				handleImageError,
				proceedToLinePay,
			};
		},
	};
</script>

<style scoped>
	.modal-overlay {
		background-color: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(4px);
	}

	.modal-content {
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	.donation-option {
		/* 移除預設灰色邊框，使用綠色主題 */
	}

	.linepay-button img {
		/* 移除濾鏡，讓圖片保持原本顏色 */
		max-width: none;
		background: transparent;
	}

	.linepay-button:disabled img {
		opacity: 0.5;
	}

	/* Modal transitions */
	.modal-enter-active,
	.modal-leave-active {
		transition: all 0.3s ease;
	}

	.modal-enter-from,
	.modal-leave-to {
		opacity: 0;
		transform: scale(0.9);
	}

	.modal-enter-active .modal-content,
	.modal-leave-active .modal-content {
		transition: all 0.3s ease;
	}

	.modal-enter-from .modal-content,
	.modal-leave-to .modal-content {
		transform: scale(0.9);
		opacity: 0;
	}
</style>
