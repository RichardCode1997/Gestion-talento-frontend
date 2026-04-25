<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usuariosService, empleadosService } from '@/services/api.js'
import api from '@/services/api.js'

const router = useRouter()
const route  = useRoute()

const id        = route.params.id
const esEdicion = computed(() => !!id)
const loading   = ref(false)
const guardando = ref(false)
const error     = ref(null)
const empleados = ref([])
const roles     = ref([])

const form = ref({
  correo:     '',
  contraseña: '',
  idRol:      '',
  idEmpleado: '',
})

const errores        = ref({})
const mostrarPass    = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const resRoles = await api.get('/roles')
    roles.value = resRoles.data.filter(r => r.nombreRol !== 'SUPERADMIN')

    if (!esEdicion.value) {
      const resEmpleados = await empleadosService.listarSinUsuario()
      empleados.value = resEmpleados.data.filter(e => e.estado === 'Activo')
    }

    if (esEdicion.value) {
      const res = await usuariosService.obtenerPorId(id)
      const usuario = res.data
      if (usuario) {
        form.value = {
          correo:     usuario.correo,
          contraseña: '',
          idRol:      usuario.rol?.idRol ?? '',
          idEmpleado: '',
        }
      }
    }
  } catch {
    error.value = 'Error al cargar los datos del formulario.'
  } finally {
    loading.value = false
  }
})

function validar() {
  const e = {}
  if (!form.value.correo.trim())                        e.correo = 'El correo es requerido.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.correo)) e.correo = 'Ingresa un correo válido.'
  if (!esEdicion.value && !form.value.contraseña.trim()) e.contraseña = 'La contraseña es requerida.'
  if (!form.value.idRol)                                 e.idRol = 'Selecciona un rol.'
  if (!esEdicion.value && !form.value.idEmpleado)
    e.idEmpleado = 'Selecciona un empleado.'
  errores.value = e
  return Object.keys(e).length === 0
}

async function guardar() {
  if (!validar()) return
  guardando.value = true
  error.value = null
  try {
    const payload = {
      correo:     form.value.correo,
      contraseña: form.value.contraseña,
      rol: { idRol: Number(form.value.idRol) },
    }

    if (esEdicion.value) {
      await usuariosService.actualizar(id, payload)
    } else {
      // 1. Crear el usuario
      const res = await usuariosService.registrar(payload)
      const nuevoIdUsuario = res.data.idUsuario

      // 2. Vincular el empleado con el nuevo usuario
      const empRes = await empleadosService.obtener(form.value.idEmpleado)
      const empleado = empRes.data
      empleado.usuario = { idUsuario: nuevoIdUsuario }
      await empleadosService.actualizar(form.value.idEmpleado, empleado)
    }

    router.push('/usuarios')
  } catch (e) {
    const msg = e.response?.data?.message
    error.value = msg ?? 'Ocurrió un error al guardar. Verifica los datos.'
  } finally {
    guardando.value = false
  }
}

function cancelar() { router.push('/usuarios') }
</script>

<template>
  <div class="form-view">

    <div class="module-header">
      <div>
        <h1 class="page-title">{{ esEdicion ? 'Editar Usuario' : 'Nuevo Usuario' }}</h1>
        <p class="page-subtitle">
          Gestión de Talento &rsaquo; Usuarios &rsaquo;
          {{ esEdicion ? 'Editar' : 'Registrar' }}
        </p>
      </div>
      <button class="btn-outline" @click="cancelar">
        <i class="bi bi-arrow-left"></i> Volver
      </button>
    </div>

    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <span>Cargando datos...</span>
    </div>

    <div v-else class="form-card">
      <div v-if="error" class="alert-error">
        <i class="bi bi-exclamation-circle"></i> {{ error }}
      </div>

      <div class="form-section">
        <h2 class="form-section-title">
          <i class="bi bi-shield-lock"></i> Datos de Acceso
        </h2>
        <div class="form-grid">

          <div class="form-group full">
            <label>Correo electrónico <span class="req">*</span></label>
            <input
              v-model="form.correo"
              type="email"
              placeholder="ejemplo@correo.com"
              :class="{ error: errores.correo }"
            />
            <span class="field-error" v-if="errores.correo">{{ errores.correo }}</span>
          </div>

          <div class="form-group full">
            <label>
              Contraseña
              <span class="req" v-if="!esEdicion">*</span>
              <span class="label-hint" v-else>(dejar en blanco para no cambiar)</span>
            </label>
            <div class="input-pass-wrap" :class="{ error: errores.contraseña }">
              <input
                v-model="form.contraseña"
                :type="mostrarPass ? 'text' : 'password'"
                placeholder="••••••••"
              />
              <button type="button" class="toggle-pass" @click="mostrarPass = !mostrarPass">
                <i :class="mostrarPass ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <span class="field-error" v-if="errores.contraseña">{{ errores.contraseña }}</span>
          </div>

          <div class="form-group full" v-if="!esEdicion">
            <label>Empleado <span class="req">*</span></label>
            <select v-model="form.idEmpleado" :class="{ error: errores.idEmpleado }">
              <option value="" disabled>Selecciona un empleado</option>
              <option
                v-for="emp in empleados"
                :key="emp.idEmpleado"
                :value="emp.idEmpleado"
              >
                {{ emp.nombre }} {{ emp.apellido }} — {{ emp.dni }}
              </option>
            </select>
            <span class="field-error" v-if="errores.idEmpleado">{{ errores.idEmpleado }}</span>
          </div>

          <div class="form-group full">
            <label>Rol <span class="req">*</span></label>
            <select v-model="form.idRol" :class="{ error: errores.idRol }">
              <option value="" disabled>Selecciona un rol</option>
              <option
                v-for="rol in roles"
                :key="rol.idRol"
                :value="rol.idRol"
              >
                {{ rol.nombreRol }}
              </option>
            </select>
            <span class="field-error" v-if="errores.idRol">{{ errores.idRol }}</span>
          </div>

        </div>
      </div>

      <div class="form-actions">
        <button class="btn-outline" @click="cancelar" :disabled="guardando">Cancelar</button>
        <button class="btn-primary" @click="guardar"  :disabled="guardando">
          <span v-if="guardando"><i class="bi bi-hourglass-split"></i> Guardando...</span>
          <span v-else>
            <i :class="esEdicion ? 'bi bi-check-lg' : 'bi bi-person-add'"></i>
            {{ esEdicion ? 'Guardar Cambios' : 'Registrar Usuario' }}
          </span>
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.form-view { max-width: 600px; }

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

.form-card { background: #fff; border-radius: var(--radius); box-shadow: var(--card-shadow); overflow: hidden; }

.alert-error {
  display: flex; align-items: center; gap: 9px;
  background: #fff5f5; color: #c92a2a;
  border-bottom: 1px solid #ffc9c9;
  padding: 12px 24px; font-size: 13.5px; font-weight: 500;
}

.form-section { padding: 24px 28px; }
.form-section-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 20px;
}
.form-section-title i { color: var(--accent); font-size: 16px; }

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.form-group.full { grid-column: 1 / -1; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.req { color: #f03e3e; }
.label-hint { font-size: 11.5px; color: var(--text-muted); font-weight: 400; margin-left: 4px; }

.form-group input,
.form-group select {
  padding: 9px 13px; border-radius: 8px; border: 1.5px solid #e5e9f0;
  font-size: 13.5px; font-family: var(--font); color: var(--text-primary);
  background: #fff; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
}
.form-group input:focus,
.form-group select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(79,140,255,0.12);
}
.form-group input.error,
.form-group select.error { border-color: #f03e3e; }

/* Password input */
.input-pass-wrap {
  display: flex; align-items: center;
  border: 1.5px solid #e5e9f0; border-radius: 8px;
  overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s;
}
.input-pass-wrap:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(79,140,255,0.12);
}
.input-pass-wrap.error { border-color: #f03e3e; }
.input-pass-wrap input {
  flex: 1; border: none !important; box-shadow: none !important;
  outline: none; padding: 9px 13px;
  font-size: 13.5px; font-family: var(--font); color: var(--text-primary);
}
.toggle-pass {
  background: none; border: none; cursor: pointer;
  padding: 0 12px; color: var(--text-muted); font-size: 16px;
  transition: color 0.2s;
}
.toggle-pass:hover { color: var(--accent); }

.field-error { font-size: 12px; color: #f03e3e; }

.form-actions {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 20px 28px; background: #f8f9fb; border-top: 1px solid #f0f2f5;
}
</style>
