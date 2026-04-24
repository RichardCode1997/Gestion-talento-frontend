<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  errorMessage.value = "";
  try {
    const response = await api.post('/auth/login', {
      correo: email.value,
      password: password.value
    });

    // IMPORTANTE: Tu backend devuelve 'accessToken' según la captura
    if (response.data && response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('correo', response.data.correo);
      localStorage.setItem('rol', response.data.rol);
      router.push('/home');
    } else {
      errorMessage.value = "Error en el formato de respuesta del servidor";
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      errorMessage.value = "Correo o contraseña incorrectos";
    } else {
      errorMessage.value = "Error de conexión con el servidor";
    }
  }
};
</script>

<template>
  <div class="login-container">
    <div class="wrapper">
      <div class="form-box">
        <h2>Gestión de Talento</h2>
        <p class="subtitle">Portal de Acceso</p>

        <div class="login-form">
          <div class="input-box">
            <input v-model="email" type="text" placeholder=" " />
            <label>Email</label>
          </div>

          <div class="input-box">
            <input v-model="password" type="password" placeholder=" " />
            <label>Password</label>
          </div>

          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

          <button
            type="button"
            @click="handleLogin"
            class="btn-login"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Cargando...' : 'INGRESAR' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #000 url('/assets/img/Banner_ingreso.jpeg') no-repeat center center/cover;
}

.wrapper {
  width: 400px;
  min-height: 450px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  padding: 40px;
  z-index: 100; /* Aseguramos que esté al frente */
}

.form-box { width: 100%; position: relative; z-index: 200; }
.form-box h2 { text-align: center; color: #162938; margin: 0; }
.subtitle { text-align: center; color: #162938; margin-bottom: 20px; font-weight: bold; }

.input-box {
  position: relative;
  width: 100%;
  height: 50px;
  border-bottom: 2px solid #162938;
  margin: 30px 0;
}

.input-box input {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1em;
  color: #162938;
  font-weight: 600;
}

.input-box label {
  position: absolute;
  top: 50%;
  left: 5px;
  transform: translateY(-50%);
  color: #162938;
  transition: .5s;
  pointer-events: none;
}

.input-box input:focus ~ label,
.input-box input:not(:placeholder-shown) ~ label {
  top: -5px;
}

.btn-login {
  width: 100%;
  height: 45px;
  background: #162938;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  /* IMPORTANTE: z-index para que nada lo tape */
  position: relative;
  z-index: 300;
}

.btn-login:hover { background: #2c4a63; }
.btn-login:disabled { background: #ccc; }
.error-text { color: red; text-align: center; font-weight: bold; font-size: 0.9em; }
</style>
