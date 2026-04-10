<template>
  <div class="main-layout">
    <header id="header" class="header fixed-top d-flex align-items-center">
      <div class="d-flex align-items-center justify-content-between">
        <a href="/home" class="logo d-flex align-items-center">
          <span class="d-none d-lg-block">Gestión Talento</span>
        </a>
      </div>
    </header>

    <aside id="sidebar" class="sidebar">
      <ul class="sidebar-nav" id="sidebar-nav">
        <li class="nav-item">
          <router-link class="nav-link" to="/home">
            <i class="bi bi-grid"></i><span>Dashboard</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link collapsed" to="/usuarios">
            <i class="bi bi-people"></i><span>Usuarios</span>
          </router-link>
        </li>
      </ul>
    </aside>

    <main id="main" class="main">
      <router-view />
    </main>
  </div>
</template>

<style>
/* Estilos básicos para que el layout no se rompa */
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');
/* Aquí puedes importar el style.css de tu plantilla NiceAdmin */
</style>
