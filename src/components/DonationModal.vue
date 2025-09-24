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
				<div v-if="!showQRCode" class="donation-options space-y-3 mb-6">
					<button
						v-for="option in donationOptions"
						:key="option.id"
						@click="selectDonation(option)"
						class="donation-option w-full p-4 border-2 border-gray-300 bg-white rounded-lg text-left transition-all duration-200 hover:border-green-600 hover:bg-green-50"
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
				<div v-if="!showQRCode" class="linepay-section">
					<button
						@click="proceedToLinePay"
						class="linepay-button w-full py-6 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-4 relative overflow-hidden bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl"
					>
						<div class="flex items-center space-x-4">
							<img src="/linePay.png" alt="LINE Pay" class="h-10 w-auto object-contain" @error="handleImageError" />
							<span class="text-xl">LINE Pay 立即贊助</span>
						</div>

						<!-- Mobile hint -->
						<div v-if="isMobile" class="absolute top-0 right-2 text-xs opacity-75">顯示 QR Code</div>
					</button>

					<!-- Desktop hint -->
					<div v-if="!isMobile" class="text-center mt-3">
						<div class="text-xs text-gray-500">📱 點擊按鈕將顯示 QR Code 供掃描</div>
					</div>
				</div>

				<!-- QR Code Display -->
				<div v-if="showQRCode" class="qr-code-section text-center">
					<div class="bg-gray-50 p-8 rounded-lg border">
						<div class="text-xl font-semibold mb-6">掃描 QR Code 完成贊助</div>
						<div class="flex justify-center mb-6">
							<div class="qr-code-container bg-white p-6 rounded-lg shadow-lg">
								<img src="/linePay.png" alt="LINE Pay QR Code" class="w-60 h-60 object-contain rounded" />
							</div>
						</div>
						<div class="text-base text-gray-700 mb-6">
							贊助金額：<span class="font-bold text-green-600 text-lg">${{ (selectedOption?.amount || 100).toLocaleString() }}</span>
						</div>
						<button @click="showQRCode = false" class="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded-lg text-gray-700 transition-colors duration-200">
							← 返回選擇
						</button>
					</div>
				</div>

				<!-- About Author -->
				<div v-if="!showQRCode" class="author-section mt-6 p-4 bg-gray-50 rounded-lg">
					<div class="text-sm text-gray-600 space-y-3">
						<div class="flex items-center justify-center">
							<a href="https://joechiboo.github.io/" target="_blank" rel="noopener noreferrer"
							   class="author-link group flex items-center space-x-3 px-4 py-3 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md">
								<div class="flex items-center space-x-2">
									<span class="text-xl group-hover:animate-bounce">🌐</span>
									<span class="font-medium text-gray-700 group-hover:text-blue-600">關於作者</span>
								</div>
								<svg class="w-4 h-4 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all duration-200"
									 fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
								</svg>
							</a>
						</div>
						<div class="text-center">
							<p class="text-gray-600 italic text-sm">熱愛運動科技的開發者 🚴‍♂️💻</p>
						</div>
					</div>
				</div>

				<!-- Info -->
				<div v-if="!showQRCode" class="info-section mt-4 text-center">
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



			const proceedToLinePay = () => {
				// 直接顯示 QR Code PNG
				showQRCode.value = true;
			};

			return {
				selectedOption,
				donationOptions,
				isMobile,
				showQRCode,
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
