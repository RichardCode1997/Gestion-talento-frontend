<template>
  <div class="main-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">

    <!-- HEADER -->
    <header class="app-header">
      <div class="header-left">
        <button class="toggle-btn" @click="toggleSidebar">
          <i class="bi bi-list"></i>
        </button>
        <a href="/home" class="brand">
          <span class="brand-icon">GT</span>
          <span class="brand-name">Gestión Talento</span>
        </a>
      </div>
      <div class="header-right">
        <div class="header-user" @click="toggleUserMenu" ref="userMenuRef">
          <div class="user-avatar">{{ userInitial }}</div>
          <span class="user-name d-none d-md-inline">{{ userName }}</span>
          <i class="bi bi-chevron-down"></i>
          <div class="user-dropdown" v-show="userMenuOpen">
            <a href="#"><i class="bi bi-person"></i> Mi Perfil</a>
            <div class="divider"></div>
            <a href="#" @click.prevent="logout"><i class="bi bi-box-arrow-right"></i> Cerrar Sesión</a>
          </div>
        </div>
      </div>
    </header>

    <!-- SIDEBAR -->
    <aside class="app-sidebar">
      <nav class="sidebar-nav">

        <div class="nav-section-label">Principal</div>

        <router-link class="nav-item" to="/home" exact-active-class="active">
          <i class="bi bi-speedometer2"></i>
          <span>Dashboard</span>
        </router-link>

        <div class="nav-section-label">Recursos Humanos</div>

        <!-- Empleados -->
        <div v-if="esAdminNivelOSupervisor" class="nav-group" :class="{ open: openGroup === 'empleados' }">
          <div class="nav-item nav-group-toggle" @click="toggleGroup('empleados')">
            <i class="bi bi-people"></i>
            <span>Empleados</span>
            <i class="bi bi-chevron-right nav-arrow"></i>
          </div>
          <div class="nav-group-items">
            <router-link v-if="esAdminNivelOSupervisor" class="nav-subitem" to="/empleados" exact-active-class="active">
              <i class="bi bi-list-ul"></i> Listar Empleados
            </router-link>
            <router-link v-if="esAdminNivel" class="nav-subitem" to="/empleados/nuevo" active-class="active">
              <i class="bi bi-person-plus"></i> Registrar Empleado
            </router-link>
          </div>
        </div>

        <!-- Usuarios - solo ADMINISTRADOR -->
        <div v-if="esAdminNivelOSupervisor" class="nav-group" :class="{ open: openGroup === 'usuarios' }">
          <div class="nav-item nav-group-toggle" @click="toggleGroup('usuarios')">
            <i class="bi bi-shield-lock"></i>
            <span>Usuarios</span>
            <i class="bi bi-chevron-right nav-arrow"></i>
          </div>
          <div class="nav-group-items">
            <router-link v-if="esAdminNivelOSupervisor" class="nav-subitem" to="/usuarios" exact-active-class="active">
              <i class="bi bi-list-ul"></i> Listar Usuarios
            </router-link>
            <router-link v-if="esAdminNivel" class="nav-subitem" to="/usuarios/nuevo" active-class="active">
              <i class="bi bi-person-add"></i> Registrar Usuario
            </router-link>
          </div>
        </div>

        <!-- Horarios -->
        <div v-if="esAdminNivelOSupervisor" class="nav-group" :class="{ open: openGroup === 'horarios' }">
          <div class="nav-item nav-group-toggle" @click="toggleGroup('horarios')">
            <i class="bi bi-calendar3"></i>
            <span>Horarios</span>
            <i class="bi bi-chevron-right nav-arrow"></i>
          </div>
          <div class="nav-group-items">
            <router-link v-if="esAdminNivelOSupervisor" class="nav-subitem" to="/horarios" exact-active-class="active">
              <i class="bi bi-list-ul"></i> Listar Horarios
            </router-link>
            <router-link v-if="esAdminNivel" class="nav-subitem" to="/horarios/nuevo" active-class="active">
              <i class="bi bi-calendar-plus"></i> Registrar Horario
            </router-link>
          </div>
        </div>

        <div class="nav-section-label">Control de Asistencia</div>

        <router-link class="nav-item" to="/asistencias" active-class="active">
          <i class="bi bi-clock-history"></i>
          <span>Asistencias</span>
        </router-link>

        <router-link class="nav-item" to="/tardanzas" active-class="active">
          <i class="bi bi-alarm"></i>
          <span>Tardanzas</span>
        </router-link>

        <router-link class="nav-item" to="/faltas" active-class="active">
          <i class="bi bi-calendar-x"></i>
          <span>Faltas</span>
        </router-link>

        <router-link class="nav-item" to="/permisos" active-class="active">
          <i class="bi bi-file-earmark-check"></i>
          <span>Permisos</span>
        </router-link>

        <div class="nav-section-label">Comunicación</div>

        <router-link class="nav-item" to="/noticias" active-class="active">
          <i class="bi bi-newspaper"></i>
          <span>Noticias</span>
        </router-link>

      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="logout">
          <i class="bi bi-box-arrow-right"></i>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="app-main">
      <router-view />
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const sidebarCollapsed = ref(false)
const openGroup = ref(null)
const userMenuOpen = ref(false)
const userMenuRef = ref(null)

const userName = computed(() => {
  return localStorage.getItem('correo') || 'Administrador'
})

const userInitial = computed(() => {
  return userName.value.charAt(0).toUpperCase()
})

const rol = computed(() => localStorage.getItem('rol'))
const esSuperAdmin = computed(() => rol.value === 'SUPERADMIN')
const esAdmin = computed(() => rol.value === 'ADMINISTRADOR')
const esSupervisor = computed(() => rol.value === 'SUPERVISOR')
const esAdminNivel = computed(() => esSuperAdmin.value || esAdmin.value)
const esAdminNivelOSupervisor = computed(() => esAdminNivel.value || esSupervisor.value)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function toggleGroup(group) {
  openGroup.value = openGroup.value === group ? null : group
}

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('correo')
  localStorage.removeItem('rol')
  router.push('/login')
}

function handleClickOutside(e) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    userMenuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<style>
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --sidebar-w: 250px;
  --header-h: 60px;
  --bg: #f0f2f5;
  --sidebar-bg: #0f1623;
  --sidebar-text: #a8b2c1;
  --sidebar-active: #ffffff;
  --sidebar-active-bg: rgba(79, 140, 255, 0.15);
  --sidebar-active-border: #4f8cff;
  --sidebar-hover: rgba(255,255,255,0.06);
  --header-bg: #ffffff;
  --header-shadow: 0 1px 0 #e5e9f0;
  --accent: #4f8cff;
  --accent-2: #38d9a9;
  --text-primary: #1a2035;
  --text-muted: #6c757d;
  --card-bg: #ffffff;
  --card-shadow: 0 2px 12px rgba(0,0,0,0.07);
  --radius: 10px;
  --font: 'Plus Jakarta Sans', sans-serif;
  --transition: 0.22s cubic-bezier(0.4,0,0.2,1);
}

body { font-family: var(--font); background: var(--bg); color: var(--text-primary); }

/* ── LAYOUT ── */
.main-layout {
  display: grid;
  grid-template-rows: var(--header-h) 1fr;
  grid-template-columns: var(--sidebar-w) 1fr;
  grid-template-areas:
    "header header"
    "sidebar main";
  min-height: 100vh;
  transition: grid-template-columns var(--transition);
}
.main-layout.sidebar-collapsed {
  grid-template-columns: 68px 1fr;
}

/* ── HEADER ── */
.app-header {
  grid-area: header;
  background: var(--header-bg);
  box-shadow: var(--header-shadow);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-left { display: flex; align-items: center; gap: 14px; }
.toggle-btn {
  background: none; border: none; cursor: pointer;
  width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: var(--text-muted);
  transition: background var(--transition), color var(--transition);
}
.toggle-btn:hover { background: #f0f2f5; color: var(--accent); }

.brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.brand-icon {
  width: 34px; height: 34px; border-radius: 8px;
  background: linear-gradient(135deg, #4f8cff, #38d9a9);
  color: #fff; font-weight: 700; font-size: 13px;
  display: flex; align-items: center; justify-content: center;
}
.brand-name { font-weight: 700; font-size: 15px; color: var(--text-primary); }

.header-right { display: flex; align-items: center; gap: 12px; }
.header-user {
  display: flex; align-items: center; gap: 8px;
  cursor: pointer; padding: 6px 10px; border-radius: 8px;
  position: relative; user-select: none;
  transition: background var(--transition);
}
.header-user:hover { background: #f0f2f5; }
.user-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg, #4f8cff, #38d9a9);
  color: #fff; font-weight: 700; font-size: 13px;
  display: flex; align-items: center; justify-content: center;
}
.user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.header-user > .bi-chevron-down { font-size: 11px; color: var(--text-muted); }

.user-dropdown {
  position: absolute; top: calc(100% + 8px); right: 0;
  background: #fff; border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  min-width: 180px; padding: 6px; z-index: 200;
}
.user-dropdown a {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 12px; border-radius: 7px;
  font-size: 13px; color: var(--text-primary); text-decoration: none;
  transition: background var(--transition);
}
.user-dropdown a:hover { background: #f0f2f5; }
.user-dropdown .divider { height: 1px; background: #f0f2f5; margin: 4px 0; }

/* ── SIDEBAR ── */
.app-sidebar {
  grid-area: sidebar;
  background: var(--sidebar-bg);
  display: flex; flex-direction: column;
  overflow: hidden;
  position: sticky; top: var(--header-h);
  height: calc(100vh - var(--header-h));
  transition: width var(--transition);
}

.sidebar-nav {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  padding: 12px 10px;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
}
.sidebar-nav::-webkit-scrollbar { width: 4px; }
.sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

.nav-section-label {
  font-size: 10px; font-weight: 700; letter-spacing: 1px;
  text-transform: uppercase; color: rgba(168,178,193,0.45);
  padding: 14px 10px 6px;
  white-space: nowrap; overflow: hidden;
}
.sidebar-collapsed .nav-section-label { opacity: 0; height: 0; padding: 0; }

.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 9px 12px; border-radius: 8px;
  color: var(--sidebar-text); text-decoration: none;
  font-size: 13.5px; font-weight: 500;
  cursor: pointer; white-space: nowrap;
  transition: background var(--transition), color var(--transition), border-color var(--transition);
  border-left: 2px solid transparent;
  margin-bottom: 2px;
  position: relative;
}
.nav-item i { font-size: 17px; flex-shrink: 0; }
.nav-item:hover { background: var(--sidebar-hover); color: #fff; }
.nav-item.active, .router-link-active.nav-item {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active);
  border-left-color: var(--sidebar-active-border);
}

.nav-arrow {
  margin-left: auto; font-size: 11px !important;
  transition: transform var(--transition);
}
.nav-group.open .nav-arrow { transform: rotate(90deg); }

.nav-group-items {
  max-height: 0; overflow: hidden;
  transition: max-height 0.3s ease;
}
.nav-group.open .nav-group-items { max-height: 200px; }

.nav-subitem {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 12px 7px 38px;
  color: rgba(168,178,193,0.8); text-decoration: none;
  font-size: 13px; border-radius: 7px;
  transition: background var(--transition), color var(--transition);
  margin-bottom: 1px;
}
.nav-subitem i { font-size: 14px; }
.nav-subitem:hover { background: var(--sidebar-hover); color: #fff; }
.nav-subitem.active { color: var(--accent); background: var(--sidebar-active-bg); }

/* Collapsed sidebar */
.sidebar-collapsed .app-sidebar { width: 68px; }
.sidebar-collapsed .nav-item span,
.sidebar-collapsed .nav-arrow,
.sidebar-collapsed .nav-subitem,
.sidebar-collapsed .sidebar-footer span { display: none; }
.sidebar-collapsed .nav-item { justify-content: center; padding: 10px; }
.sidebar-collapsed .nav-group-items { display: none; }

.sidebar-footer {
  padding: 12px 10px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.logout-btn {
  display: flex; align-items: center; gap: 12px;
  width: 100%; padding: 9px 12px; border-radius: 8px;
  background: none; border: none; cursor: pointer;
  color: rgba(255, 100, 100, 0.75); font-size: 13.5px; font-weight: 500;
  font-family: var(--font); white-space: nowrap;
  transition: background var(--transition), color var(--transition);
}
.logout-btn i { font-size: 17px; flex-shrink: 0; }
.logout-btn:hover { background: rgba(255,80,80,0.12); color: #ff6464; }

/* ── MAIN ── */
.app-main {
  grid-area: main;
  padding: 24px;
  min-width: 0;
}

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .main-layout {
    grid-template-columns: 0 1fr;
  }
  .main-layout.sidebar-collapsed {
    grid-template-columns: 0 1fr;
  }
  .app-sidebar {
    position: fixed; left: 0; top: var(--header-h);
    transform: translateX(-100%); z-index: 99;
    transition: transform var(--transition);
    width: var(--sidebar-w) !important;
  }
  .main-layout:not(.sidebar-collapsed) .app-sidebar {
    transform: translateX(0);
  }
  .app-main { padding: 16px; }
}
</style>
