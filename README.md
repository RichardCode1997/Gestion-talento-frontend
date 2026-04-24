# Gestión de Talento - Frontend 🌐

Dashboard moderno desarrollado en **Vue.js 3** para la gestión de Recursos Humanos. Permite administrar trabajadores, usuarios y horarios con autenticación JWT y control de acceso por roles.

## 🌐 Demo

[![Ver Demo](https://img.shields.io/badge/Ver%20Demo-Live-brightgreen?style=for-the-badge)](https://gestion-talento-frontend-swart.vercel.app)

**Credenciales de prueba:**
- Correo: `richard@gmail.com`
- Contraseña: `123`

---

## 🚀 Módulos Implementados

### 🛡️ Seguridad y Control de Sesión
* **Autenticación JWT:** Validación de credenciales con tokens firmados.
* **Sesión Temporal:** Al expirar el token, el sistema redirige automáticamente al Login.
* **Route Guards:** Sin token válido no hay acceso a vistas administrativas.

### 👥 Administración de Personal
* **Empleados:** CRUD completo con control de estado (Activo, Inactivo, Cesado).
* **Usuarios:** Gestión de cuentas de acceso con vínculo 1:1 a empleados.

### 🔒 Reglas de Seguridad en el Frontend
* Los empleados y usuarios con rol **ADMINISTRADOR** están protegidos — no se pueden desactivar, cesar ni eliminar desde la interfaz.
* Un administrador no puede modificar ni eliminar su propia cuenta.
* Solo empleados **Activos** aparecen disponibles al crear un nuevo usuario.

---

## 🚧 En Desarrollo

Los siguientes módulos están pendientes de implementación:

* **Horarios** — Gestión de jornadas laborales
* **Asistencias** — Registro de entradas y salidas
* **Tardanzas** — Control de ingresos fuera de hora
* **Faltas** — Gestión de inasistencias
* **Permisos** — Solicitudes de permisos justificados
* **Noticias** — Comunicados corporativos

---

## 🛠️ Correr en local

### Requisitos
* Node.js 18+
* Backend corriendo en `http://localhost:8080`

### 1. Clonar la rama de desarrollo
```bash
git clone -b dev https://github.com/RichardCode1997/Gestion-talento-frontend.git
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configuración
Crea un archivo `.env.development` en la raíz del proyecto:
```
VITE_API_URL=http://localhost:8080/api
```

### 4. Ejecutar
```bash
npm run dev
```

---

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|---|---|
| Vue.js 3 | Framework principal (Composition API) |
| Vue Router | Navegación SPA y Route Guards |
| Axios | Cliente HTTP con interceptores JWT |
| Vite | Build tool |

---

## 🔗 Repositorio Backend
👉 [Gestion-talento-backend](https://github.com/RichardCode1997/Gestion-talento-backend)
