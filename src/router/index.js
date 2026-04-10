import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import MainLayout from '../layouts/MainLayout.vue' // Importante crear este archivo primero

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView // Aquí no hay menús
    },
    {
      path: '/',
      component: MainLayout, // Este es el "padre" que tiene el Sidebar
      children: [
        {
          path: 'home',
          name: 'home',
          component: () => import('../views/HomeView.vue')
        },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: () => import('../views/UserView.vue')
        }
      ]
    }
  ]
})

export default router
