# Gestión de Talento - Frontend 🌐

Interfaz de usuario moderna y dinámica desarrollada en **Vue.js 3**, diseñada para interactuar con la API de Gestión de Talento. Este dashboard permite a los administradores gestionar el control de asistencia y personal de manera intuitiva y segura.

## 🚀 Módulos y Funcionalidades (Sincronizados con API)

### 🛡️ Seguridad y Control de Sesión
* **Autenticación JWT:** Validación de credenciales mediante el intercambio de tokens firmados.
* **Sesión Temporal:** Implementación de seguridad basada en tiempo de vida del token. Una vez expirado el tiempo de sesión configurado en el backend, el sistema protege los datos obligando a un nuevo inicio de sesión.
* **Route Guards:** Protección de rutas a nivel de cliente mediante Vue Router, evitando el acceso a vistas administrativas sin un token válido y activo.

### 👥 Administración de Personal
* **Dashboard de Empleados:** Visualización y gestión (CRUD) de perfiles de trabajadores en tiempo real.
* **Configuración de Horarios:** Interfaz para la asignación y administración de jornadas laborales.

### ⏱️ Monitoreo de Asistencia e Incidencias
* **Reporte de Asistencias:** Control detallado de entradas, salidas y registro automático de **Tardanzas**.
* **Gestor de Permisos:** Módulo para la visualización y administración de solicitudes de faltas y permisos justificados.

### 📢 Comunicación Corporativa
* **Módulo de Noticias:** Panel dinámico para la publicación y lectura de comunicados internos.

## 🛠️ Integración Técnica

### Consumo de API con Axios 🔌
Para mantener la integridad y seguridad en la comunicación con el backend, se utiliza un interceptor de peticiones que:
1. Inyecta el **Bearer Token** en la cabecera `Authorization` de cada solicitud.
2. Maneja de forma global la expiración del token (Error **401 Unauthorized**), redirigiendo automáticamente al usuario al Login para garantizar una sesión segura.

### 🔗 Ecosistema (Backend)
Este proyecto consume los servicios de la API REST desarrollada en Java. Puedes revisar la lógica de negocio y seguridad del servidor aquí:
👉 **[Repositorio Backend (Java & Spring Boot)](https://github.com/RichardCode1997/Gestion-talento-backend)**

## 🛠️ Stack Tecnológico
* **Vue.js 3** (Composition API)
* **Vue Router** (Gestión de navegación SPA)
* **Axios** (Cliente HTTP)
* **Bootstrap** (Diseño responsivo y componentes de UI)
* **Vite** (Herramienta de construcción y desarrollo)