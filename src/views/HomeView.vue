<script setup>
// Aquí podrías traer estadísticas de tu API más adelante
const stats = [
  { title: 'Colaboradores', count: 150, icon: 'bi-people', color: 'primary' },
  { title: 'Marcaciones Hoy', count: 42, icon: 'bi-clock-check', color: 'success' },
  { title: 'Alertas', count: 3, icon: 'bi-exclamation-triangle', color: 'danger' }
]
</script>

<template>
  <div class="pagetitle">
    <h1>Panel de Control</h1>
    <nav>
      <ol class="breadcrumb">
        <li class="breadcrumb-item active">Gestión de Talento / Dashboard</li>
      </ol>
    </nav>
  </div>

  <section class="section dashboard">
    <div class="row">
      <div v-for="stat in stats" :key="stat.title" class="col-xxl-4 col-md-4">
        <div :class="['card info-card', stat.color + '-card']">
          <div class="card-body">
            <h5 class="card-title">{{ stat.title }}</h5>
            <div class="d-flex align-items-center">
              <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                <i :class="['bi', stat.icon]"></i>
              </div>
              <div class="ps-3">
                <h6>{{ stat.count }}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Bienvenido al Sistema de Gestión de Talento</h5>
            <p>Desde este panel podrás administrar el personal, supervisar horarios y gestionar las noticias corporativas de la organización.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Estilos específicos para las tarjetas de NiceAdmin si no cargan del CSS global */
.card-icon {
  font-size: 32px;
  line-height: 0;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  flex-grow: 0;
}
.primary-card .card-icon { color: #4154f1; background: #f6f6fe; }
.success-card .card-icon { color: #2eca6a; background: #e0f8e9; }
.danger-card .card-icon { color: #ff771d; background: #ffecdf; }
</style>
