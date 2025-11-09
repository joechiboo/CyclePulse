<template>
  <div class="app-wrapper">
    <!-- 頁面切換導航 -->
    <nav class="nav-bar fixed top-0 left-0 right-0 bg-gray-900 bg-opacity-95 backdrop-blur-sm z-50 shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-1">
            <router-link
              to="/"
              class="nav-link px-4 py-2 rounded-lg font-medium transition-all duration-200"
              :class="$route.path === '/' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'"
            >
              🚴 飛輪訓練
            </router-link>
            <router-link
              to="/heart-rate"
              class="nav-link px-4 py-2 rounded-lg font-medium transition-all duration-200"
              :class="$route.path === '/heart-rate' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'"
            >
              ❤️ 心率監測
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 頁面內容 -->
    <div class="page-content pt-16">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CyclePulseApp'
}
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
}

.page-content {
  min-height: 100vh;
}

.nav-link {
  user-select: none;
}
</style>