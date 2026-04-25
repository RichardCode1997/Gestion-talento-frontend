<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { empleadosService } from '@/services/api.js'

const router            = useRouter()
const rolUsuario        = localStorage.getItem('rol')
const correoUsuario     = localStorage.getItem('correo')
const empleados         = ref([])
const paginaActual      = ref(0)
const totalPaginas      = ref(0)
const loading           = ref(true)
const error             = ref(null)
const search            = ref('')
const filtroEstado      = ref('Todo')
const showConfirm       = ref(false)
const empleadoAEliminar = ref(null)
const toastMsg          = ref('')
const toastType         = ref('success')
let toastTimer          = null

// ── Filtro ──
const empleadosFiltrados = computed(() => {
  let lista = empleados.value.filter(e => e.usuario?.rol?.nombreRol !== 'SUPERADMIN')

  if (filtroEstado.value === 'Activo')
    lista = lista.filter(e => e.estado === 'Activo')
  else if (filtroEstado.value === 'Inactivo')
    lista = lista.filter(e => e.estado === 'Inactivo')
  else if (filtroEstado.value === 'Cesado')
    lista = lista.filter(e => e.estado === 'Cesado')
  // 'Todo' no necesita condición, devuelve toda la lista

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    lista = lista.filter(e =>
      e.nombre.toLowerCase().includes(q) ||
      e.apellido.toLowerCase().includes(q) ||
      e.dni.includes(q) ||
      e.departamento?.nombreDepartamento?.toLowerCase().includes(q)
    )
  }
  return lista
})

// ── Carga ──
async function cargarEmpleados() {
  loading.value = true
  error.value   = null
  try {
    const res = await empleadosService.listarTodos(paginaActual.value)
    empleados.value = res.data.content
    totalPaginas.value = res.data.totalPages
  } catch (e) {
    error.value = 'No se pudieron cargar los empleados.'
  } finally {
    loading.value = false
  }
}

// ── Acciones ──

function puedeCambiarEstado(emp) {
  if (emp.usuario?.correo === correoUsuario) return false
  if (emp.usuario?.rol?.nombreRol === 'SUPERADMIN') return false
  if (emp.usuario?.rol?.nombreRol === 'ADMINISTRADOR' && rolUsuario !== 'SUPERADMIN') return false
  if (rolUsuario !== 'SUPERADMIN' && rolUsuario !== 'ADMINISTRADOR') return false
  return true
}

function puedeEditar(emp) {
  if (emp.usuario?.correo === correoUsuario) return false
  if (emp.usuario?.rol?.nombreRol === 'SUPERADMIN') return false
  if (emp.usuario?.rol?.nombreRol === 'ADMINISTRADOR' && rolUsuario !== 'SUPERADMIN') return false
  if (rolUsuario !== 'SUPERADMIN' && rolUsuario !== 'ADMINISTRADOR') return false
  return true
}

function puedeEliminarEmpleado(emp) {
  if (emp.usuario?.correo === correoUsuario) return false
    if (emp.usuario?.rol?.nombreRol === 'SUPERADMIN') return false
    if (emp.usuario?.rol?.nombreRol === 'ADMINISTRADOR' && rolUsuario !== 'SUPERADMIN') return false
    if (rolUsuario !== 'SUPERADMIN' && rolUsuario !== 'ADMINISTRADOR') return false
    return true
}

function paginaAnterior() {
  if (paginaActual.value > 0) {
    paginaActual.value--
    cargarEmpleados()
  }
}

function paginaSiguiente() {
  if (paginaActual.value < totalPaginas.value - 1) {
    paginaActual.value++
    cargarEmpleados()
  }
}

function irANuevo() {
  router.push('/empleados/nuevo')
}
function irAEditar(id) {
  router.push(`/empleados/${id}/editar`)
}

function confirmarEliminar(empleado) {
  empleadoAEliminar.value = empleado
  showConfirm.value = true
}
async function eliminar() {
  try {
    await empleadosService.eliminar(empleadoAEliminar.value.idEmpleado)
    await cargarEmpleados()
    mostrarToast('Empleado eliminado correctamente.', 'success')
  } catch {
    mostrarToast('Error al eliminar el empleado.', 'error')
  } finally {
    showConfirm.value = false
    empleadoAEliminar.value = null
  }
}

async function cambiarEstado(empleado, nuevoEstado) {
  // Bloquear si intenta cambiarse a sí mismo

  if (empleado.usuario?.correo === correoUsuario) {
    mostrarToast('No puedes cambiar tu propio estado.', 'error')
    return
  }
  try {
    await empleadosService.cambiarEstado(empleado.idEmpleado, nuevoEstado)
    await cargarEmpleados()
    mostrarToast('Estado actualizado.', 'success')
  } catch {
    mostrarToast('Error al cambiar el estado.', 'error')
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

onMounted(cargarEmpleados)
</script>

<template>
  <div class="module-view">

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toastMsg" :class="['toast-msg', toastType]">
        <i :class="toastType === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
        {{ toastMsg }}
      </div>
    </transition>

    <!-- Header -->
    <div class="module-header">
      <div>
        <h1 class="page-title">Empleados</h1>
        <p class="page-subtitle">Gestión de Talento &rsaquo; Empleados</p>
      </div>
      <button class="btn-primary" @click="irANuevo">
        <i class="bi bi-person-plus"></i> Nuevo Empleado
      </button>
    </div>

    <!-- Filtros -->
    <div class="filters-bar">
      <div class="search-wrap">
        <i class="bi bi-search"></i>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por nombre, DNI o departamento..."
          class="search-input"
        />
      </div>
      <div class="filter-tabs">
        <button :class="['filter-tab', filtroEstado === 'Todo'    && 'active']" @click="filtroEstado = 'Todo'">Todos</button>
        <button :class="['filter-tab', filtroEstado === 'Activo'   && 'active']" @click="filtroEstado = 'Activo'">Activos</button>
        <button :class="['filter-tab', filtroEstado === 'Inactivo' && 'active']" @click="filtroEstado = 'Inactivo'">Inactivos</button>
        <button :class="['filter-tab', filtroEstado === 'Cesado'   && 'active']" @click="filtroEstado = 'Cesado'">Cesados</button>
      </div>
    </div>

    <!-- Estado de carga / error -->
    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <span>Cargando empleados...</span>
    </div>

    <div v-else-if="error" class="state-box error">
      <i class="bi bi-exclamation-circle"></i>
      <span>{{ error }}</span>
      <button class="btn-outline" @click="cargarEmpleados">Reintentar</button>
    </div>

    <!-- Tabla -->
    <div v-else class="table-card">
      <div class="table-info">
        <span>{{ empleadosFiltrados.length }} empleado(s) encontrado(s)</span>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Empleado</th>
              <th>DNI</th>
              <th>Celular</th>
              <th>Departamento</th>
              <th>Horario</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="empleadosFiltrados.length === 0">
              <td colspan="10" class="empty-row">
                <i class="bi bi-inbox"></i>
                <span>No se encontraron empleados</span>
              </td>
            </tr>
            <tr v-for="emp in empleadosFiltrados" :key="emp.idEmpleado">
              <td class="td-id">{{ emp.idEmpleado }}</td>
              <td>
                <div class="empleado-cell">
                  <div class="emp-avatar">{{ emp.nombre.charAt(0) }}{{ emp.apellido.charAt(0) }}</div>
                  <div>
                    <div class="emp-name">{{ emp.nombre }} {{ emp.apellido }}</div>
                    <div class="emp-dir">{{ emp.direccion }}</div>
                  </div>
                </div>
              </td>
              <td>{{ emp.dni }}</td>
              <td>{{ emp.celular }}</td>
              <td>
                <span class="badge badge-dept">{{ emp.departamento?.nombreDepartamento ?? '—' }}</span>
              </td>
              <td>
                <div class="horario-cell">
                  <span class="horario-name">{{ emp.horario?.nombre ?? '—' }}</span>
                  <span class="horario-horas" v-if="emp.horario">
                    {{ emp.horario.hora_entrada }} - {{ emp.horario.hora_salida }}
                  </span>
                </div>
              </td>
              <td class="td-correo">{{ emp.usuario?.correo ?? '—' }}</td>
              <td>
                <span :class="['badge', getRolClass(emp.usuario?.rol?.nombreRol)]">
                  {{ emp.usuario?.rol?.nombreRol ?? '—' }}
                </span>
              </td>

              <td>
                <!-- Dropdown estado — visible según jerarquía -->
                <div v-if="puedeCambiarEstado(emp)"
                       class="badge-wrap" style="position:relative; display:inline-block;">
                    <button :class="['badge-estado', `estado-${emp.estado.toLowerCase()}`]"
                            @click="emp._open = !emp._open">
                      <span class="badge-dot"></span>
                      {{ emp.estado }} ▾
                    </button>
                    <div v-if="emp._open" class="estado-dropdown">
                      <div class="dd-item" @click="cambiarEstado(emp, 'Activo');  emp._open=false">
                        <span class="dd-dot activo-dot"></span> Activo
                      </div>
                      <div class="dd-item" @click="cambiarEstado(emp, 'Inactivo'); emp._open=false">
                        <span class="dd-dot inactivo-dot"></span> Inactivo
                      </div>
                      <div class="dd-item" @click="cambiarEstado(emp, 'Cesado');  emp._open=false">
                        <span class="dd-dot cesado-dot"></span> Cesado
                      </div>
                    </div>
                </div>

                <!-- Otros roles: solo ven el badge sin dropdown -->
                <span v-else :class="['badge-estado', `estado-${emp.estado.toLowerCase()}`]"
                        style="cursor:default;">
                    <span class="badge-dot"></span>
                    {{ emp.estado }}
                </span>
              </td>

              <td>
                <div class="actions-cell">
                  <button class="action-btn edit"
                          @click="puedeEditar(emp) && irAEditar(emp.idEmpleado)"
                          :disabled="!puedeEditar(emp)"
                          :style="!puedeEditar(emp) ? 'opacity:0.4; cursor:not-allowed' : ''"
                          title="Editar">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="action-btn delete"
                          @click="puedeEliminarEmpleado(emp) && confirmarEliminar(emp)"
                          :disabled="!puedeEliminarEmpleado(emp)"
                          :style="!puedeEliminarEmpleado(emp) ? 'opacity:0.4; cursor:not-allowed' : ''"
                          title="Eliminar">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Paginación Empleados -->
    <div class="pagination" v-if="totalPaginas > 1">
      <button class="btn-outline" @click="paginaAnterior" :disabled="paginaActual === 0">
        <i class="bi bi-chevron-left"></i> Anterior
      </button>
      <span class="page-info">Página {{ paginaActual + 1 }} de {{ totalPaginas }}</span>
      <button class="btn-outline" @click="paginaSiguiente" :disabled="paginaActual === totalPaginas - 1">
        Siguiente <i class="bi bi-chevron-right"></i>
      </button>
    </div>

    <!-- Modal confirmación eliminar -->
    <transition name="modal">
      <div v-if="showConfirm" class="modal-overlay" @click.self="showConfirm = false">
        <div class="modal-box">
          <div class="modal-icon danger">
            <i class="bi bi-exclamation-triangle"></i>
          </div>
          <h3>¿Eliminar empleado?</h3>
          <p>
            Estás a punto de eliminar a
            <strong>{{ empleadoAEliminar?.nombre }} {{ empleadoAEliminar?.apellido }}</strong>.
            Esta acción no se puede deshacer.
          </p>
          <div class="modal-actions">
            <button class="btn-outline" @click="showConfirm = false">Cancelar</button>
            <button class="btn-danger" @click="eliminar">Sí, eliminar</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>


<style scoped>
.module-view { max-width: 1400px; position: relative; }

/* Header */
.module-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; margin-bottom: 20px;
}
.page-title  { font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
.page-subtitle { font-size: 13px; color: var(--text-muted); }

/* Buttons */
.btn-primary {
  display: flex; align-items: center; gap: 7px;
  background: var(--accent); color: #fff;
  border: none; border-radius: 8px;
  padding: 9px 18px; font-size: 13.5px; font-weight: 600;
  cursor: pointer; font-family: var(--font);
  transition: background 0.2s, transform 0.15s;
}
.btn-primary:hover { background: #3a7be0; transform: translateY(-1px); }

.btn-outline {
  background: none; border: 1.5px solid #d0d7de; border-radius: 8px;
  padding: 8px 16px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: var(--font); color: var(--text-primary);
  transition: border-color 0.2s, background 0.2s;
}
.btn-outline:hover { border-color: var(--accent); color: var(--accent); background: rgba(79,140,255,0.05); }

.btn-danger {
  background: #f03e3e; color: #fff; border: none; border-radius: 8px;
  padding: 8px 20px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: var(--font);
  transition: background 0.2s;
}
.btn-danger:hover { background: #c92a2a; }

/* Filters */
.filters-bar {
  display: flex; align-items: center; gap: 12px;
  flex-wrap: wrap; margin-bottom: 16px;
}
.search-wrap {
  display: flex; align-items: center; gap: 9px;
  background: #fff; border: 1.5px solid #e5e9f0;
  border-radius: 9px; padding: 0 14px; flex: 1; min-width: 220px;
  transition: border-color 0.2s;
}
.search-wrap:focus-within { border-color: var(--accent); }
.search-wrap i { color: var(--text-muted); font-size: 15px; }
.search-input {
  border: none; outline: none; background: none;
  padding: 9px 0; font-size: 13.5px; font-family: var(--font);
  color: var(--text-primary); width: 100%;
}

.filter-tabs { display: flex; gap: 6px; }
.filter-tab {
  padding: 7px 14px; border-radius: 8px; border: 1.5px solid #e5e9f0;
  background: #fff; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: var(--font); color: var(--text-muted);
  transition: all 0.2s;
}
.filter-tab.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.filter-tab:not(.active):hover { border-color: var(--accent); color: var(--accent); }

/* States */
.state-box {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 12px;
  background: #fff; border-radius: var(--radius);
  padding: 60px 20px; text-align: center;
  color: var(--text-muted); font-size: 14px;
  box-shadow: var(--card-shadow);
}
.state-box.error { color: #f03e3e; }
.state-box i { font-size: 36px; }
.spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid #e5e9f0; border-top-color: var(--accent);
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Table */
.table-card {
  background: #fff; border-radius: var(--radius);
  box-shadow: var(--card-shadow); overflow: visible;
}
.table-info {
  padding: 12px 20px; font-size: 12.5px;
  color: var(--text-muted); border-bottom: 1px solid #f0f2f5;
}
.table-wrap { overflow: visible; }

.data-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.data-table thead tr { background: #f8f9fb; }
.data-table th {
  padding: 11px 14px; text-align: left;
  font-size: 11.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--text-muted); white-space: nowrap;
  border-bottom: 1px solid #f0f2f5;
}
.data-table td {
  padding: 12px 14px; border-bottom: 1px solid #f8f9fb;
  vertical-align: middle;
}
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: #fafbfc; }

.td-id { color: var(--text-muted); font-size: 12px; font-weight: 600; }
.td-correo { font-size: 12.5px; color: var(--text-muted); }

.empleado-cell { display: flex; align-items: center; gap: 10px; }
.emp-avatar {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #4f8cff, #38d9a9);
  color: #fff; font-weight: 700; font-size: 12px;
  display: flex; align-items: center; justify-content: center;
}
.emp-name { font-weight: 600; color: var(--text-primary); }
.emp-dir  { font-size: 11.5px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }

.horario-cell { display: flex; flex-direction: column; gap: 2px; }
.horario-name { font-weight: 500; font-size: 13px; }
.horario-horas { font-size: 11.5px; color: var(--text-muted); }

/* Pagination */
.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 16px; }
.page-info { font-size: 13px; color: var(--text-muted); }

/* Badges */
.badge {
  display: inline-block; padding: 3px 9px; border-radius: 20px;
  font-size: 11.5px; font-weight: 700; white-space: nowrap;
}
.badge-dept       { background: rgba(79,140,255,0.1);  color: #4f8cff; }
.badge-admin      { background: rgba(204,93,232,0.12); color: #cc5de8; }
.badge-supervisor { background: rgba(255,146,43,0.12); color: #ff922b; }
.badge-asesor     { background: rgba(56,217,169,0.12); color: #20c997; }
.badge-default    { background: #f0f2f5; color: var(--text-muted); }

/* Estado toggle */
.estado-toggle {
  display: flex; align-items: center; gap: 5px;
  background: none; border: none; cursor: pointer;
  font-size: 12.5px; font-weight: 600; font-family: var(--font);
  padding: 4px 8px; border-radius: 6px; transition: background 0.2s;
}
.estado-toggle i { font-size: 18px; }
.estado-toggle.activo  { color: #20c997; }
.estado-toggle.inactivo { color: #adb5bd; }
.estado-toggle:hover { background: #f0f2f5; }

/* Actions */
.actions-cell { display: flex; gap: 6px; }
.action-btn {
  width: 32px; height: 32px; border-radius: 7px; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 14px; transition: background 0.2s, color 0.2s;
}
.action-btn.edit   { background: rgba(79,140,255,0.1);  color: #4f8cff; }
.action-btn.delete { background: rgba(240,62,62,0.1);   color: #f03e3e; }
.action-btn.edit:hover   { background: #4f8cff; color: #fff; }
.action-btn.delete:hover { background: #f03e3e; color: #fff; }

/* Empty row */
.empty-row {
  text-align: center; padding: 48px !important;
  color: var(--text-muted);
}
.empty-row i { font-size: 32px; display: block; margin-bottom: 8px; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; backdrop-filter: blur(3px);
}
.modal-box {
  background: #fff; border-radius: 14px;
  padding: 32px 28px; max-width: 420px; width: 90%;
  text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.modal-icon {
  width: 60px; height: 60px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; margin: 0 auto 16px;
}
.modal-icon.danger { background: rgba(240,62,62,0.1); color: #f03e3e; }
.modal-box h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.modal-box p  { font-size: 13.5px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; }
.modal-actions { display: flex; gap: 10px; justify-content: center; }

/* Toast */
.toast-msg {
  position: fixed; bottom: 24px; right: 24px;
  display: flex; align-items: center; gap: 9px;
  padding: 12px 20px; border-radius: 10px;
  font-size: 13.5px; font-weight: 600;
  box-shadow: 0 6px 24px rgba(0,0,0,0.15); z-index: 2000;
}
.toast-msg.success { background: #ebfbee; color: #2f9e44; border: 1px solid #b2f2bb; }
.toast-msg.error   { background: #fff5f5; color: #c92a2a; border: 1px solid #ffc9c9; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }

/* Modal transition */
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.92); }

.badge-estado {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 10px; border-radius: 999px;
  font-size: 12px; font-weight: 600;
  cursor: pointer; border: none;
}
.estado-activo   { background: #ebfbee; color: #2f9e44; }
.estado-inactivo { background: #fff3e0; color: #e67700; }
.estado-cesado   { background: #fff5f5; color: #c92a2a; }

.badge-dot { width: 6px; height: 6px; border-radius: 50%; }
.estado-activo   .badge-dot { background: #2f9e44; }
.estado-inactivo .badge-dot { background: #e67700; }
.estado-cesado   .badge-dot { background: #c92a2a; }

.estado-dropdown {
  position: absolute; top: calc(100% + 6px); left: 0;
  background: #fff; border: 1px solid #e5e9f0;
  border-radius: 10px; min-width: 130px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  z-index: 99; overflow: hidden;
}
.dd-item {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 14px; cursor: pointer; font-size: 13px;
}
.dd-item:hover { background: #f8f9fb; }
.dd-dot        { width: 8px; height: 8px; border-radius: 50%; }
.activo-dot    { background: #2f9e44; }
.inactivo-dot  { background: #e67700; }
.cesado-dot    { background: #c92a2a; }

</style>
