import { createRouter, createWebHistory } from 'vue-router'
import TrainingPage from '../views/TrainingPage.vue'
import HeartRatePage from '../views/HeartRatePage.vue'

const routes = [
  {
    path: '/',
    name: 'Training',
    component: TrainingPage,
    meta: { title: '飛輪訓練' }
  },
  {
    path: '/heart-rate',
    name: 'HeartRate',
    component: HeartRatePage,
    meta: { title: '心率監測' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 更新頁面標題
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} | CyclePulse` : 'CyclePulse'
  next()
})

export default router
