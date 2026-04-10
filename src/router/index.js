import { createRouter, createWebHistory } from 'vue-router'

// Layouts
import MainLayout from '@/layouts/MainLayout.vue'

// Views — carga lazy para mejor performance
const LoginView    = () => import('@/views/LoginView.vue')
const HomeView     = () => import('@/views/HomeView.vue')

// Usuarios
const UsuariosView  = () => import('@/views/usuarios/UsuariosView.vue')
const UsuarioForm   = () => import('@/views/usuarios/UsuarioForm.vue')

// Empleados
const EmpleadosView = () => import('@/views/empleados/EmpleadosView.vue')
const EmpleadoForm  = () => import('@/views/empleados/EmpleadoForm.vue')

// Horarios
const HorariosView  = () => import('@/views/horarios/HorariosView.vue')
const HorarioForm   = () => import('@/views/horarios/HorarioForm.vue')

// Asistencias, Tardanzas, Faltas, Permisos, Noticias
const AsistenciasView = () => import('@/views/asistencias/AsistenciasView.vue')
const TardanzasView   = () => import('@/views/tardanzas/TardanzasView.vue')
const FaltasView      = () => import('@/views/faltas/FaltasView.vue')
const PermisosView    = () => import('@/views/permisos/PermisosView.vue')
const NoticiasView    = () => import('@/views/noticias/NoticiasView.vue')
const NoticiaForm     = () => import('@/views/noticias/NoticiaForm.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ── Pública ──
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      redirect: '/home'
    },

    // ── Protegidas (dentro del MainLayout) ──
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'home',
          name: 'home',
          component: HomeView
        },

        // Usuarios
        {
          path: 'usuarios',
          name: 'usuarios',
          component: UsuariosView
        },
        {
          path: 'usuarios/nuevo',
          name: 'usuarios-nuevo',
          component: UsuarioForm
        },
        {
          path: 'usuarios/:id/editar',
          name: 'usuarios-editar',
          component: UsuarioForm,
          props: true
        },

        // Empleados
        {
          path: 'empleados',
          name: 'empleados',
          component: EmpleadosView
        },
        {
          path: 'empleados/nuevo',
          name: 'empleados-nuevo',
          component: EmpleadoForm
        },
        {
          path: 'empleados/:id/editar',
          name: 'empleados-editar',
          component: EmpleadoForm,
          props: true
        },

        // Horarios
        {
          path: 'horarios',
          name: 'horarios',
          component: HorariosView
        },
        {
          path: 'horarios/nuevo',
          name: 'horarios-nuevo',
          component: HorarioForm
        },
        {
          path: 'horarios/:id/editar',
          name: 'horarios-editar',
          component: HorarioForm,
          props: true
        },

        // Solo lectura / listados
        { path: 'asistencias', name: 'asistencias', component: AsistenciasView },
        { path: 'tardanzas',   name: 'tardanzas',   component: TardanzasView   },
        { path: 'faltas',      name: 'faltas',      component: FaltasView      },
        { path: 'permisos',    name: 'permisos',    component: PermisosView    },

        // Noticias
        {
          path: 'noticias',
          name: 'noticias',
          component: NoticiasView
        },
        {
          path: 'noticias/nueva',
          name: 'noticias-nueva',
          component: NoticiaForm
        },
        {
          path: 'noticias/:id/editar',
          name: 'noticias-editar',
          component: NoticiaForm,
          props: true
        },
      ]
    },

    // Catch-all → login
    { path: '/:pathMatch(.*)*', redirect: '/login' }
  ]
})

// ── Guard global de autenticación ──
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const requiresAuth = to.meta.requiresAuth !== false // por defecto protegida

  if (requiresAuth && !token) {
    return { name: 'login' }
  }
  if (!requiresAuth && token && to.name === 'login') {
    return { name: 'home' }
  }
})

export default router
