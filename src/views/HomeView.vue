<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api.js'

const loading = ref(true)

const stats = ref([
  { title: 'Empleados Activos', value: '—', icon: 'bi-people-fill', color: '#4f8cff', bg: 'rgba(79,140,255,0.1)', desc: 'Total en planilla' },
  { title: 'Marcaciones Hoy', value: '—', icon: 'bi-clock-fill', color: '#38d9a9', bg: 'rgba(56,217,169,0.1)', desc: 'Asistencias registradas' },
  { title: 'Tardanzas', value: '—', icon: 'bi-alarm-fill', color: '#ff922b', bg: 'rgba(255,146,43,0.1)', desc: 'Del mes actual' },
  { title: 'Permisos Pendientes', value: '—', icon: 'bi-file-earmark-check-fill', color: '#cc5de8', bg: 'rgba(204,93,232,0.1)', desc: 'Por aprobar' },
])

const modules = [
  { title: 'Empleados', desc: 'Gestiona los perfiles y datos de todos los colaboradores de la organización.', icon: 'bi-people', color: '#4f8cff', link: '/empleados' },
  { title: 'Usuarios', desc: 'Administra las cuentas de acceso al sistema con control de roles y permisos.', icon: 'bi-shield-lock', color: '#38d9a9', link: '/usuarios' },
  { title: 'Horarios', desc: 'Configura y asigna jornadas laborales a los distintos grupos de trabajo.', icon: 'bi-calendar3', color: '#ff922b', link: '/horarios' },
  { title: 'Asistencias', desc: 'Consulta el registro diario de entradas y salidas del personal.', icon: 'bi-clock-history', color: '#cc5de8', link: '/asistencias' },
  { title: 'Tardanzas', desc: 'Monitorea los ingresos fuera de horario y genera reportes de incidencias.', icon: 'bi-alarm', color: '#f03e3e', link: '/tardanzas' },
  { title: 'Faltas', desc: 'Controla las inasistencias y el historial de ausencias no justificadas.', icon: 'bi-calendar-x', color: '#ffd43b', link: '/faltas' },
  { title: 'Permisos', desc: 'Gestiona las solicitudes de permisos y ausencias justificadas del personal.', icon: 'bi-file-earmark-check', color: '#20c997', link: '/permisos' },
  { title: 'Noticias', desc: 'Publica y administra los comunicados internos de la organización.', icon: 'bi-newspaper', color: '#74c0fc', link: '/noticias' },
]

const today = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

onMounted(async () => {
  try {
    const [empleados, asistencias, tardanzas, permisos] = await Promise.allSettled([
      api.get('/empleados/activos'),
      api.get('/asistencias'),
      api.get('/tardanzas'),
      api.get('/permisos'),
    ])

    if (empleados.status === 'fulfilled')
      stats.value[0].value = Array.isArray(empleados.value.data) ? empleados.value.data.length : '—'
    if (asistencias.status === 'fulfilled')
      stats.value[1].value = Array.isArray(asistencias.value.data) ? asistencias.value.data.length : '—'
    if (tardanzas.status === 'fulfilled')
      stats.value[2].value = Array.isArray(tardanzas.value.data) ? tardanzas.value.data.length : '—'
    if (permisos.status === 'fulfilled')
      stats.value[3].value = Array.isArray(permisos.value.data) ? permisos.value.data.length : '—'
  } catch (e) {
    console.warn('No se pudieron cargar algunas estadísticas', e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="home-view">

    <!-- Page Title -->
    <div class="page-title-bar">
      <div>
        <h1 class="page-title">Panel de Control</h1>
        <p class="page-subtitle">Gestión de Talento &rsaquo; Dashboard</p>
      </div>
      <div class="date-badge">
        <i class="bi bi-calendar3"></i>
        <span>{{ today }}</span>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-grid">
      <div
        v-for="stat in stats"
        :key="stat.title"
        class="stat-card"
        :style="{ '--accent-color': stat.color, '--accent-bg': stat.bg }"
      >
        <div class="stat-icon-wrap">
          <i :class="['bi', stat.icon]"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">
            <span v-if="loading" class="loading-shimmer"></span>
            <span v-else>{{ stat.value }}</span>
          </div>
          <div class="stat-title">{{ stat.title }}</div>
          <div class="stat-desc">{{ stat.desc }}</div>
        </div>
      </div>
    </div>

    <!-- Welcome Banner -->
    <div class="welcome-banner">
      <div class="welcome-text">
        <h2>Bienvenido al Sistema de Gestión de Talento 👋</h2>
        <p>Desde este panel puedes administrar el personal, supervisar horarios, controlar asistencias y gestionar las comunicaciones internas de la organización.</p>
      </div>
      <div class="welcome-graphic">
        <i class="bi bi-building"></i>
      </div>
    </div>

    <!-- Modules Grid -->
    <div class="section-header">
      <h2 class="section-title">Módulos del Sistema</h2>
      <p class="section-desc">Accede rápidamente a cualquier sección</p>
    </div>

    <div class="modules-grid">
      <router-link
        v-for="mod in modules"
        :key="mod.title"
        :to="mod.link"
        class="module-card"
        :style="{ '--mod-color': mod.color }"
      >
        <div class="module-icon">
          <i :class="['bi', mod.icon]"></i>
        </div>
        <div class="module-info">
          <h3>{{ mod.title }}</h3>
          <p>{{ mod.desc }}</p>
        </div>
        <i class="bi bi-arrow-right module-arrow"></i>
      </router-link>
    </div>

  </div>
</template>

<style scoped>
.home-view { max-width: 1280px; }

/* Title bar */
.page-title-bar {
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; margin-bottom: 24px;
}
.page-title { font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
.page-subtitle { font-size: 13px; color: var(--text-muted); }
.date-badge {
  display: flex; align-items: center; gap: 7px;
  background: #fff; padding: 7px 14px; border-radius: 8px;
  font-size: 13px; color: var(--text-muted); font-weight: 500;
  box-shadow: var(--card-shadow);
}
.date-badge i { color: var(--accent); }

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px; margin-bottom: 24px;
}
.stat-card {
  background: var(--card-bg); border-radius: var(--radius);
  box-shadow: var(--card-shadow); padding: 20px;
  display: flex; align-items: center; gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
  border-top: 3px solid var(--accent-color);
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
.stat-icon-wrap {
  width: 52px; height: 52px; border-radius: 12px;
  background: var(--accent-bg); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; color: var(--accent-color);
}
.stat-value { font-size: 26px; font-weight: 700; color: var(--text-primary); line-height: 1; margin-bottom: 3px; }
.stat-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 1px; }
.stat-desc { font-size: 11.5px; color: var(--text-muted); }

.loading-shimmer {
  display: inline-block; width: 50px; height: 26px; border-radius: 6px;
  background: linear-gradient(90deg, #f0f2f5 25%, #e2e6ea 50%, #f0f2f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Welcome banner */
.welcome-banner {
  background: linear-gradient(135deg, #0f1623 0%, #1a2540 100%);
  border-radius: var(--radius); padding: 28px 32px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 20px; margin-bottom: 28px; overflow: hidden; position: relative;
}
.welcome-banner::before {
  content: ''; position: absolute; top: -40px; right: 100px;
  width: 200px; height: 200px; border-radius: 50%;
  background: rgba(79,140,255,0.08);
}
.welcome-text h2 { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 8px; }
.welcome-text p { font-size: 13.5px; color: rgba(255,255,255,0.6); max-width: 580px; line-height: 1.6; }
.welcome-graphic { font-size: 64px; color: rgba(79,140,255,0.25); flex-shrink: 0; }

/* Modules */
.section-header { margin-bottom: 16px; }
.section-title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 3px; }
.section-desc { font-size: 13px; color: var(--text-muted); }

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}
.module-card {
  background: var(--card-bg); border-radius: var(--radius);
  box-shadow: var(--card-shadow); padding: 18px 20px;
  display: flex; align-items: center; gap: 14px;
  text-decoration: none; color: inherit;
  border-left: 3px solid var(--mod-color);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}
.module-card:hover {
  transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}
.module-icon {
  width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
  background: color-mix(in srgb, var(--mod-color) 12%, transparent);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: var(--mod-color);
}
.module-info { flex: 1; min-width: 0; }
.module-info h3 { font-size: 14px; font-weight: 700; margin-bottom: 3px; }
.module-info p { font-size: 12px; color: var(--text-muted); line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.module-arrow { color: var(--text-muted); font-size: 14px; flex-shrink: 0; transition: transform 0.2s, color 0.2s; }
.module-card:hover .module-arrow { transform: translateX(4px); color: var(--mod-color); }

@media (max-width: 640px) {
  .welcome-graphic { display: none; }
  .modules-grid { grid-template-columns: 1fr; }
}
</style>
