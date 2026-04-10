<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { empleadosService, horariosService, departamentosService } from '@/services/api.js'

const router = useRouter()
const route  = useRoute()

const id        = route.params.id
const esEdicion = computed(() => !!id)
const loading   = ref(false)
const guardando = ref(false)
const error     = ref(null)

// Opciones para selects
const horarios     = ref([])
const departamentos = ref([])

// Modelo del formulario
const form = ref({
  nombre:          '',
  apellido:        '',
  dni:             '',
  celular:         '',
  direccion:       '',
  idHorario:       '',
  idDepartamento:  '',
})

const errores = ref({})

// ── Carga datos iniciales ──
onMounted(async () => {
  loading.value = true
  try {
    const [resHorarios, resDepts] = await Promise.all([
      horariosService.listarTodos(),
      departamentosService.listarTodos(),
    ])
    horarios.value      = resHorarios.data
    departamentos.value = resDepts.data

    if (esEdicion.value) {
      const res = await empleadosService.listarTodos()
      const emp = res.data.find(e => e.idEmpleado === Number(id))
      if (emp) {
        form.value = {
          nombre:         emp.nombre,
          apellido:       emp.apellido,
          dni:            emp.dni,
          celular:        emp.celular,
          direccion:      emp.direccion,
          idHorario:      emp.horario?.idHorario ?? '',
          idDepartamento: emp.departamento?.idDepartamento ?? '',
        }
      }
    }
  } catch (e) {
    error.value = 'Error al cargar los datos del formulario.'
  } finally {
    loading.value = false
  }
})

// ── Validación ──
function validar() {
  const e = {}
  if (!form.value.nombre.trim())        e.nombre        = 'El nombre es requerido.'
  if (!form.value.apellido.trim())      e.apellido      = 'El apellido es requerido.'
  if (!/^\d{8}$/.test(form.value.dni))  e.dni           = 'El DNI debe tener 8 dígitos.'
  if (!/^\d{9}$/.test(form.value.celular)) e.celular    = 'El celular debe tener 9 dígitos.'
  if (!form.value.direccion.trim())     e.direccion     = 'La dirección es requerida.'
  if (!form.value.idHorario)            e.idHorario     = 'Selecciona un horario.'
  if (!form.value.idDepartamento)       e.idDepartamento = 'Selecciona un departamento.'
  errores.value = e
  return Object.keys(e).length === 0
}

// ── Guardar ──
async function guardar() {
  if (!validar()) return
  guardando.value = true
  error.value     = null
  try {
    const payload = {
      nombre:      form.value.nombre,
      apellido:    form.value.apellido,
      dni:         form.value.dni,
      celular:     form.value.celular,
      direccion:   form.value.direccion,
      horario:     { idHorario: Number(form.value.idHorario) },
      departamento:{ idDepartamento: Number(form.value.idDepartamento) },
    }
    if (esEdicion.value) {
      await empleadosService.actualizar(id, payload)
    } else {
      await empleadosService.registrar(payload)
    }
    router.push('/empleados')
  } catch (e) {
    const msg = e.response?.data?.message
    error.value = msg ?? 'Ocurrió un error al guardar. Verifica los datos.'
  } finally {
    guardando.value = false
  }
}

function cancelar() {
  router.push('/empleados')
}
</script>

<template>
  <div class="form-view">

    <!-- Header -->
    <div class="module-header">
      <div>
        <h1 class="page-title">{{ esEdicion ? 'Editar Empleado' : 'Nuevo Empleado' }}</h1>
        <p class="page-subtitle">
          Gestión de Talento &rsaquo; Empleados &rsaquo;
          {{ esEdicion ? 'Editar' : 'Registrar' }}
        </p>
      </div>
      <button class="btn-outline" @click="cancelar">
        <i class="bi bi-arrow-left"></i> Volver
      </button>
    </div>

    <!-- Loading inicial -->
    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <span>Cargando datos...</span>
    </div>

    <!-- Formulario -->
    <div v-else class="form-card">
      <div v-if="error" class="alert-error">
        <i class="bi bi-exclamation-circle"></i> {{ error }}
      </div>

      <div class="form-section">
        <h2 class="form-section-title">
          <i class="bi bi-person"></i> Datos Personales
        </h2>
        <div class="form-grid">

          <div class="form-group">
            <label>Nombre <span class="req">*</span></label>
            <input
              v-model="form.nombre"
              type="text"
              placeholder="Ej: Richard"
              :class="{ error: errores.nombre }"
            />
            <span class="field-error" v-if="errores.nombre">{{ errores.nombre }}</span>
          </div>

          <div class="form-group">
            <label>Apellido <span class="req">*</span></label>
            <input
              v-model="form.apellido"
              type="text"
              placeholder="Ej: Quispe"
              :class="{ error: errores.apellido }"
            />
            <span class="field-error" v-if="errores.apellido">{{ errores.apellido }}</span>
          </div>

          <div class="form-group">
            <label>DNI <span class="req">*</span></label>
            <input
              v-model="form.dni"
              type="text"
              maxlength="8"
              placeholder="8 dígitos"
              :class="{ error: errores.dni }"
            />
            <span class="field-error" v-if="errores.dni">{{ errores.dni }}</span>
          </div>

          <div class="form-group">
            <label>Celular <span class="req">*</span></label>
            <input
              v-model="form.celular"
              type="text"
              maxlength="9"
              placeholder="9 dígitos"
              :class="{ error: errores.celular }"
            />
            <span class="field-error" v-if="errores.celular">{{ errores.celular }}</span>
          </div>

          <div class="form-group full">
            <label>Dirección <span class="req">*</span></label>
            <input
              v-model="form.direccion"
              type="text"
              placeholder="Ej: Calle abc mz abc lt.abc"
              :class="{ error: errores.direccion }"
            />
            <span class="field-error" v-if="errores.direccion">{{ errores.direccion }}</span>
          </div>

        </div>
      </div>

      <div class="form-section">
        <h2 class="form-section-title">
          <i class="bi bi-building"></i> Asignación Laboral
        </h2>
        <div class="form-grid">

          <div class="form-group">
            <label>Departamento <span class="req">*</span></label>
            <select
              v-model="form.idDepartamento"
              :class="{ error: errores.idDepartamento }"
            >
              <option value="" disabled>Selecciona un departamento</option>
              <option
                v-for="dept in departamentos"
                :key="dept.idDepartamento"
                :value="dept.idDepartamento"
              >
                {{ dept.nombreDepartamento }}
              </option>
            </select>
            <span class="field-error" v-if="errores.idDepartamento">{{ errores.idDepartamento }}</span>
          </div>

          <div class="form-group">
            <label>Horario <span class="req">*</span></label>
            <select
              v-model="form.idHorario"
              :class="{ error: errores.idHorario }"
            >
              <option value="" disabled>Selecciona un horario</option>
              <option
                v-for="h in horarios"
                :key="h.idHorario"
                :value="h.idHorario"
              >
                {{ h.nombre }} ({{ h.hora_entrada }} - {{ h.hora_salida }})
              </option>
            </select>
            <span class="field-error" v-if="errores.idHorario">{{ errores.idHorario }}</span>
          </div>

        </div>
      </div>

      <!-- Acciones -->
      <div class="form-actions">
        <button class="btn-outline" @click="cancelar" :disabled="guardando">
          Cancelar
        </button>
        <button class="btn-primary" @click="guardar" :disabled="guardando">
          <span v-if="guardando"><i class="bi bi-hourglass-split"></i> Guardando...</span>
          <span v-else>
            <i :class="esEdicion ? 'bi bi-check-lg' : 'bi bi-person-plus'"></i>
            {{ esEdicion ? 'Guardar Cambios' : 'Registrar Empleado' }}
          </span>
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.form-view { max-width: 860px; }

.module-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; margin-bottom: 20px;
}
.page-title    { font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
.page-subtitle { font-size: 13px; color: var(--text-muted); }

.btn-outline {
  display: flex; align-items: center; gap: 7px;
  background: none; border: 1.5px solid #d0d7de; border-radius: 8px;
  padding: 8px 16px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: var(--font); color: var(--text-primary);
  transition: border-color 0.2s, background 0.2s;
}
.btn-outline:hover { border-color: var(--accent); color: var(--accent); }

.btn-primary {
  display: flex; align-items: center; gap: 7px;
  background: var(--accent); color: #fff; border: none; border-radius: 8px;
  padding: 10px 22px; font-size: 13.5px; font-weight: 600;
  cursor: pointer; font-family: var(--font);
  transition: background 0.2s, transform 0.15s;
}
.btn-primary:hover:not(:disabled) { background: #3a7be0; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

/* States */
.state-box {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; background: #fff; border-radius: var(--radius);
  padding: 60px 20px; text-align: center; color: var(--text-muted);
  box-shadow: var(--card-shadow);
}
.spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid #e5e9f0; border-top-color: var(--accent);
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Card */
.form-card {
  background: #fff; border-radius: var(--radius);
  box-shadow: var(--card-shadow); overflow: hidden;
}

.alert-error {
  display: flex; align-items: center; gap: 9px;
  background: #fff5f5; color: #c92a2a;
  border-bottom: 1px solid #ffc9c9;
  padding: 12px 24px; font-size: 13.5px; font-weight: 500;
}

/* Sections */
.form-section { padding: 24px 28px; border-bottom: 1px solid #f0f2f5; }
.form-section:last-of-type { border-bottom: none; }
.form-section-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 700; color: var(--text-primary);
  margin-bottom: 20px;
}
.form-section-title i { color: var(--accent); font-size: 16px; }

/* Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.form-group.full { grid-column: 1 / -1; }

/* Field */
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group label {
  font-size: 13px; font-weight: 600; color: var(--text-primary);
}
.req { color: #f03e3e; }

.form-group input,
.form-group select {
  padding: 9px 13px; border-radius: 8px;
  border: 1.5px solid #e5e9f0;
  font-size: 13.5px; font-family: var(--font);
  color: var(--text-primary); background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}
.form-group input:focus,
.form-group select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(79,140,255,0.12);
}
.form-group input.error,
.form-group select.error { border-color: #f03e3e; }

.field-error { font-size: 12px; color: #f03e3e; }

/* Actions */
.form-actions {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 20px 28px; background: #f8f9fb;
  border-top: 1px solid #f0f2f5;
}

@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .form-section { padding: 20px 16px; }
  .form-actions { padding: 16px; }
}
</style>
