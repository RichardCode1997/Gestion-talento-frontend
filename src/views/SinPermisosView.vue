<template>
  <div class="sin-permisos">
    <div class="sin-permisos-box">
      <div class="sin-permisos-icon">
        <i class="bi bi-shield-lock"></i>
      </div>
      <h1>Acceso Denegado</h1>
      <p>No tienes permisos para acceder a esta sección. Contacta al administrador del sistema si crees que esto es un error.</p>
      <router-link to="/home" class="btn-volver">
        <i class="bi bi-arrow-left"></i> Volver al Dashboard
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.sin-permisos {
  display: flex; align-items: center; justify-content: center;
  min-height: 60vh;
}
.sin-permisos-box {
  text-align: center; max-width: 420px; padding: 48px 32px;
  background: #fff; border-radius: 16px; box-shadow: var(--card-shadow);
}
.sin-permisos-icon {
  width: 80px; height: 80px; border-radius: 50%;
  background: rgba(240,62,62,0.1); color: #f03e3e;
  font-size: 36px; display: flex; align-items: center;
  justify-content: center; margin: 0 auto 20px;
}
h1 { font-size: 22px; font-weight: 700; margin-bottom: 10px; color: var(--text-primary); }
p  { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; }
.btn-volver {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--accent); color: #fff; text-decoration: none;
  padding: 10px 22px; border-radius: 8px; font-size: 13.5px; font-weight: 600;
  transition: background 0.2s;
}
.btn-volver:hover { background: #3a7be0; }
</style>
