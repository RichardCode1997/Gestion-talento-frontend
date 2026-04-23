<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usuariosService } from '@/services/api.js'

const router           = useRouter()
const usuarios         = ref([])
const loading          = ref(true)
const error            = ref(null)
const search           = ref('')
const filtroEstado     = ref('todos')
const showConfirm      = ref(false)
const usuarioAEliminar = ref(null)
const toastMsg         = ref('')
const toastType        = ref('success')
let toastTimer         = null

const correoActual = localStorage.getItem('correo')

function puedeDesactivar(usuario) {
  if (usuario.correo === correoActual) return false
  if (usuario.rol?.nombreRol === 'ADMINISTRADOR') return false
  return true
}

async function cargarUsuarios() {
  loading.value = true
  error.value   = null
  try {
    const res = await usuariosService.listarTodos()
    usuarios.value = res.data
  } catch {
    error.value = 'No se pudieron cargar los usuarios.'
  } finally {
    loading.value = false
  }
}

const usuariosFiltrados = computed(() => {
  let lista = usuarios.value
  if (filtroEstado.value === 'activos')
    lista = lista.filter(u => u.estado)
  else if (filtroEstado.value === 'inactivos')
    lista = lista.filter(u => !u.estado)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    lista = lista.filter(u =>
      u.correo.toLowerCase().includes(q) ||
      u.rol?.nombreRol?.toLowerCase().includes(q)
    )
  }
  return lista
})

function irANuevo()    { router.push('/usuarios/nuevo') }
function irAEditar(id) { router.push(`/usuarios/${id}/editar`) }

function confirmarEliminar(usuario) {
  usuarioAEliminar.value = usuario
  showConfirm.value = true
}

async function eliminar() {
  try {
    await usuariosService.eliminar(usuarioAEliminar.value.idUsuario)
    await cargarUsuarios()
    mostrarToast('Usuario eliminado correctamente.', 'success')
  } catch {
    mostrarToast('Error al eliminar el usuario.', 'error')
  } finally {
    showConfirm.value = false
    usuarioAEliminar.value = null
  }
}

async function toggleEstado(usuario) {
  try {
    if (usuario.estado) {
      await usuariosService.desactivar(usuario.idUsuario)
    } else {
      await usuariosService.activar(usuario.idUsuario)
    }
    await cargarUsuarios()
    mostrarToast('Estado actualizado correctamente.', 'success')
  } catch (e) {
    const msg = e.response?.data?.message ?? 'Error al cambiar el estado.'
    mostrarToast(msg, 'error')
  }
}

function mostrarToast(msg, type = 'success') {
  toastMsg.value  = msg
  toastType.value = type
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 3500)
}

function getRolClass(rol) {
  const map = {
    'ADMINISTRADOR': 'badge-admin',
    'SUPERVISOR':    'badge-supervisor',
    'ASESOR':        'badge-asesor',
  }
  return map[rol] ?? 'badge-default'
}

onMounted(cargarUsuarios)
</script>

<template>
  <div class="module-view">

    <transition name="toast">
      <div v-if="toastMsg" :class="['toast-msg', toastType]">
        <i :class="toastType === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
        {{ toastMsg }}
      </div>
    </transition>

    <div class="module-header">
      <div>
        <h1 class="page-title">Usuarios</h1>
        <p class="page-subtitle">Gestión de Talento &rsaquo; Usuarios</p>
      </div>
      <button class="btn-primary" @click="irANuevo">
        <i class="bi bi-person-add"></i> Nuevo Usuario
      </button>
    </div>

    <div class="filters-bar">
      <div class="search-wrap">
        <i class="bi bi-search"></i>
        <input v-model="search" type="text" placeholder="Buscar por correo o rol..." class="search-input" />
      </div>
      <div class="filter-tabs">
        <button :class="['filter-tab', filtroEstado === 'todos'     && 'active']" @click="filtroEstado = 'todos'">Todos</button>
        <button :class="['filter-tab', filtroEstado === 'activos'   && 'active']" @click="filtroEstado = 'activos'">Activos</button>
        <button :class="['filter-tab', filtroEstado === 'inactivos' && 'active']" @click="filtroEstado = 'inactivos'">Inactivos</button>
      </div>
    </div>

    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <span>Cargando usuarios...</span>
    </div>

    <div v-else-if="error" class="state-box error">
      <i class="bi bi-exclamation-circle"></i>
      <span>{{ error }}</span>
      <button class="btn-outline" @click="cargarUsuarios">Reintentar</button>
    </div>

    <div v-else class="table-card">
      <div class="table-info">
        <span>{{ usuariosFiltrados.length }} usuario(s) encontrado(s)</span>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="usuariosFiltrados.length === 0">
              <td colspan="5" class="empty-row">
                <i class="bi bi-inbox"></i>
                <span>No se encontraron usuarios</span>
              </td>
            </tr>
            <tr v-for="u in usuariosFiltrados" :key="u.idUsuario">
              <td class="td-id">{{ u.idUsuario }}</td>
              <td>
                <div class="usuario-cell">
                  <div class="user-avatar">{{ u.correo.charAt(0).toUpperCase() }}</div>
                  <span class="user-correo">{{ u.correo }}</span>
                </div>
              </td>
              <td>
                <span :class="['badge', getRolClass(u.rol?.nombreRol)]">
                  {{ u.rol?.nombreRol ?? '—' }}
                </span>
              </td>
              <td>
                <button
                  :class="['estado-toggle', u.estado ? 'activo' : 'inactivo', !puedeDesactivar(u) && 'disabled']"
                  @click="puedeDesactivar(u) && toggleEstado(u)"
                  :title="!puedeDesactivar(u) ? 'No puedes cambiar el estado de este usuario' : u.estado ? 'Desactivar' : 'Activar'"
                >
                  <i :class="u.estado ? 'bi bi-toggle-on' : 'bi bi-toggle-off'"></i>
                  {{ u.estado ? 'Activo' : 'Inactivo' }}
                </button>
              </td>
              <td>
                <div class="actions-cell">
                  <button class="action-btn edit"   @click="irAEditar(u.idUsuario)" title="Editar">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="action-btn delete" @click="confirmarEliminar(u)" title="Eliminar">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <transition name="modal">
      <div v-if="showConfirm" class="modal-overlay" @click.self="showConfirm = false">
        <div class="modal-box">
          <div class="modal-icon danger">
            <i class="bi bi-exclamation-triangle"></i>
          </div>
          <h3>¿Eliminar usuario?</h3>
          <p>
            Estás a punto de eliminar a
            <strong>{{ usuarioAEliminar?.correo }}</strong>.
            Esta acción no se puede deshacer.
          </p>
          <div class="modal-actions">
            <button class="btn-outline" @click="showConfirm = false">Cancelar</button>
            <button class="btn-danger"  @click="eliminar">Sí, eliminar</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.module-view { max-width: 900px; position: relative; }
.module-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
.page-title    { font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
.page-subtitle { font-size: 13px; color: var(--text-muted); }
.btn-primary { display: flex; align-items: center; gap: 7px; background: var(--accent); color: #fff; border: none; border-radius: 8px; padding: 9px 18px; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: var(--font); transition: background 0.2s, transform 0.15s; }
.btn-primary:hover { background: #3a7be0; transform: translateY(-1px); }
.btn-outline { background: none; border: 1.5px solid #d0d7de; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--font); color: var(--text-primary); transition: border-color 0.2s, background 0.2s; }
.btn-outline:hover { border-color: var(--accent); color: var(--accent); }
.btn-danger { background: #f03e3e; color: #fff; border: none; border-radius: 8px; padding: 8px 20px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--font); transition: background 0.2s; }
.btn-danger:hover { background: #c92a2a; }
.filters-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.search-wrap { display: flex; align-items: center; gap: 9px; background: #fff; border: 1.5px solid #e5e9f0; border-radius: 9px; padding: 0 14px; flex: 1; min-width: 220px; transition: border-color 0.2s; }
.search-wrap:focus-within { border-color: var(--accent); }
.search-wrap i { color: var(--text-muted); font-size: 15px; }
.search-input { border: none; outline: none; background: none; padding: 9px 0; font-size: 13.5px; font-family: var(--font); color: var(--text-primary); width: 100%; }
.filter-tabs { display: flex; gap: 6px; }
.filter-tab { padding: 7px 14px; border-radius: 8px; border: 1.5px solid #e5e9f0; background: #fff; font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--font); color: var(--text-muted); transition: all 0.2s; }
.filter-tab.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.filter-tab:not(.active):hover { border-color: var(--accent); color: var(--accent); }
.state-box { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: #fff; border-radius: var(--radius); padding: 60px 20px; text-align: center; color: var(--text-muted); box-shadow: var(--card-shadow); }
.state-box.error { color: #f03e3e; }
.state-box i { font-size: 36px; }
.spinner { width: 36px; height: 36px; border-radius: 50%; border: 3px solid #e5e9f0; border-top-color: var(--accent); animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.table-card { background: #fff; border-radius: var(--radius); box-shadow: var(--card-shadow); overflow: hidden; }
.table-info { padding: 12px 20px; font-size: 12.5px; color: var(--text-muted); border-bottom: 1px solid #f0f2f5; }
.table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.data-table thead tr { background: #f8f9fb; }
.data-table th { padding: 11px 14px; text-align: left; font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); white-space: nowrap; border-bottom: 1px solid #f0f2f5; }
.data-table td { padding: 12px 14px; border-bottom: 1px solid #f8f9fb; vertical-align: middle; }
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: #fafbfc; }
.td-id { color: var(--text-muted); font-size: 12px; font-weight: 600; }
.usuario-cell { display: flex; align-items: center; gap: 10px; }
.user-avatar { width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, #4f8cff, #cc5de8); color: #fff; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; }
.user-correo { font-weight: 500; color: var(--text-primary); }
.badge { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 11.5px; font-weight: 700; white-space: nowrap; }
.badge-admin      { background: rgba(204,93,232,0.12); color: #cc5de8; }
.badge-supervisor { background: rgba(255,146,43,0.12);  color: #ff922b; }
.badge-asesor     { background: rgba(56,217,169,0.12);  color: #20c997; }
.badge-default    { background: #f0f2f5; color: var(--text-muted); }
.estado-toggle { display: flex; align-items: center; gap: 5px; background: none; border: none; cursor: pointer; font-size: 12.5px; font-weight: 600; font-family: var(--font); padding: 4px 8px; border-radius: 6px; transition: background 0.2s; }
.estado-toggle i { font-size: 18px; }
.estado-toggle.activo   { color: #20c997; }
.estado-toggle.inactivo { color: #adb5bd; }
.estado-toggle.disabled { opacity: 0.4; cursor: not-allowed; }
.estado-toggle:not(.disabled):hover { background: #f0f2f5; }
.actions-cell { display: flex; gap: 6px; }
.action-btn { width: 32px; height: 32px; border-radius: 7px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; transition: background 0.2s, color 0.2s; }
.action-btn.edit   { background: rgba(79,140,255,0.1); color: #4f8cff; }
.action-btn.delete { background: rgba(240,62,62,0.1);  color: #f03e3e; }
.action-btn.edit:hover   { background: #4f8cff; color: #fff; }
.action-btn.delete:hover { background: #f03e3e; color: #fff; }
.empty-row { text-align: center; padding: 48px !important; color: var(--text-muted); }
.empty-row i { font-size: 32px; display: block; margin-bottom: 8px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(3px); }
.modal-box { background: #fff; border-radius: 14px; padding: 32px 28px; max-width: 420px; width: 90%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-icon { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 26px; margin: 0 auto 16px; }
.modal-icon.danger { background: rgba(240,62,62,0.1); color: #f03e3e; }
.modal-box h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.modal-box p  { font-size: 13.5px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; }
.modal-actions { display: flex; gap: 10px; justify-content: center; }
.toast-msg { position: fixed; bottom: 24px; right: 24px; display: flex; align-items: center; gap: 9px; padding: 12px 20px; border-radius: 10px; font-size: 13.5px; font-weight: 600; box-shadow: 0 6px 24px rgba(0,0,0,0.15); z-index: 2000; }
.toast-msg.success { background: #ebfbee; color: #2f9e44; border: 1px solid #b2f2bb; }
.toast-msg.error   { background: #fff5f5; color: #c92a2a; border: 1px solid #ffc9c9; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.92); }
</style>
