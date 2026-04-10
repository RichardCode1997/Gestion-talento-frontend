import axios from 'axios'
import router from '@/router'

// ── Instancia base ──
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
})

// ── Request interceptor: agrega token ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: maneja 401 ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userName')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

// ════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
}

// ════════════════════════════════════════
//  USUARIOS
// ════════════════════════════════════════
export const usuariosService = {
  listarTodos:     ()       => api.get('/usuarios'),
  listarActivos:   ()       => api.get('/usuarios/activos'),
  listarInactivos: ()       => api.get('/usuarios/inactivos'),
  buscarPorCorreo: (correo) => api.get(`/usuarios/correo/${correo}`),
  registrar:       (data)   => api.post('/usuarios', data),
  actualizar:      (id, data) => api.put(`/usuarios/${id}`, data),
  activar:         (id) => api.patch(`/usuarios/${id}/activar`),
  desactivar:      (id) => api.patch(`/usuarios/${id}/desactivar`),
  eliminar:        (id)     => api.delete(`/usuarios/${id}`),
}

// ════════════════════════════════════════
//  EMPLEADOS
// ════════════════════════════════════════
export const empleadosService = {
  listarTodos:     ()      => api.get('/empleados'),
  listarActivos:   ()      => api.get('/empleados/activos'),
  listarInactivos: ()      => api.get('/empleados/inactivos'),
  buscarPorDni:    (dni)   => api.get(`/empleados/dni/${dni}`),
  registrar:       (data)  => api.post('/empleados', data),
  actualizar:      (id, data) => api.put(`/empleados/${id}`, data),
  activar:         (id) => api.patch(`/empleados/${id}/activar`),
  desactivar:      (id) => api.patch(`/empleados/${id}/desactivar`),
  eliminar:        (id)    => api.delete(`/empleados/${id}`),
}

// ════════════════════════════════════════
//  DEPARTAMENTOS
// ════════════════════════════════════════
export const departamentosService = {
  listarTodos:  ()         => api.get('/departamentos'),
  registrar:    (data)     => api.post('/departamentos', data),
  actualizar:   (id, data) => api.put(`/departamentos/${id}`, data),
  eliminar:     (id)       => api.delete(`/departamentos/${id}`),
}

// ════════════════════════════════════════
//  HORARIOS
// ════════════════════════════════════════
export const horariosService = {
  listarTodos: ()          => api.get('/horarios'),
  registrar:   (data)      => api.post('/horarios', data),
  actualizar:  (id, data)  => api.put(`/horarios/${id}`, data),
  eliminar:    (id)        => api.delete(`/horarios/${id}`),
}

// ════════════════════════════════════════
//  ASISTENCIAS
// ════════════════════════════════════════
export const asistenciasService = {
  listarTodas: () => api.get('/asistencias'),
}

// ════════════════════════════════════════
//  TARDANZAS
// ════════════════════════════════════════
export const tardanzasService = {
  listarTodas: () => api.get('/tardanzas'),
}

// ════════════════════════════════════════
//  FALTAS
// ════════════════════════════════════════
export const faltasService = {
  listarTodas: () => api.get('/faltas'),
}

// ════════════════════════════════════════
//  PERMISOS
// ════════════════════════════════════════
export const permisosService = {
  listarTodos: () => api.get('/permisos'),
}

// ════════════════════════════════════════
//  NOTICIAS
// ════════════════════════════════════════
export const noticiasService = {
  listarTodas:  ()         => api.get('/noticias'),
  registrar:    (data)     => api.post('/noticias', data),
  actualizar:   (id, data) => api.put(`/noticias/${id}`, data),
  eliminar:     (id)       => api.delete(`/noticias/${id}`),
}

export default api
