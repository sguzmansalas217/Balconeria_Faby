<script setup>
import { auth } from '@/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { authApi } from '@/service/api';
import { useAuth } from '@/composables/useAuth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { refresh } = useAuth();
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    // 1. Login con Firebase Auth (valida email/password)
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    // 2. Pedir JWT al backend (que registra/actualiza el usuario en PostgreSQL)
    const { data } = await authApi.getToken(user.uid, user.email, user.displayName);

    // 3. Guardar JWT y refrescar estado reactivo del rol
    localStorage.setItem("jwt_token", data.token);
    refresh();

    router.replace("/sistema/herramientas/TablaHerramienta");
  } catch (error) {
    console.error("Error en login:", error);
    // Si el backend falla después del login de Firebase, cerrar sesión Firebase también
    await signOut(auth).catch(() => {});
    localStorage.removeItem("jwt_token");
    errorMessage.value = "Error en el inicio de sesión. Verifica tus credenciales.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <section class="hero">
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="Logo MAGUZSA" class="logo-img" />
      </div>
    </section>

    <div class="login-form-container">
      <h2 class="login-title">Bienvenido</h2>
      <p class="login-subtitle">A sistema interno de control de produccion</p>
      <p class="login-subtitle">Inicia sesión en tu cuenta</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <label>Email:</label>
        <input type="email" v-model="email" required placeholder="Ingresa tu correo" :disabled="loading" />

        <label>Contraseña:</label>
        <input type="password" v-model="password" required placeholder="Ingresa tu contraseña" :disabled="loading" />

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <button type="submit" class="cta-btn" :disabled="loading">
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </form>
    </div>

    <footer class="contacto-footer">
      <div class="contacto-container">
        <h3>Contáctanos</h3>
        <p><strong>Teléfono:</strong> 449 180 17 69 / 449 197 11 54</p>
        <p><strong>Email:</strong> herreriaguzsa@outlook.es</p>
        <p><strong>Dirección:</strong> Parque industrial Cobalto Blvd. a Zacatecas Km. 9, Trojes de Alonso</p>
        <p class="copy">&copy; 2025 MAGUZSA. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff;
  min-height: 100vh;
}
.hero {
  width: 100%;
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
}
.logo-img {
  max-width: 250px;
  width: 70%;
  height: auto;
}
.login-form-container {
  background: #ffffff;
  padding: 40px 25px;
  margin: 40px auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  max-width: 450px;
  width: 90%;
  text-align: center;
}
.login-title {
  font-size: 28px;
  font-weight: bold;
  color: #004777;
  margin-bottom: 10px;
}
.login-subtitle {
  font-size: 16px;
  color: #3f2700;
  margin-bottom: 20px;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.login-form label {
  text-align: left;
  font-size: 14px;
  font-weight: bold;
  color: #3f2700;
}
.login-form input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 15px;
}
.cta-btn {
  background: linear-gradient(to right, #075988, #004AAD);
  color: white;
  border: none;
  padding: 12px;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
  border-radius: 6px;
  margin-top: 10px;
  transition: 0.3s;
}
.cta-btn:hover:not(:disabled) {
  background: linear-gradient(to right, #004AAD, #009fd4);
}
.cta-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.error-message {
  color: red;
  font-size: 14px;
  margin-top: -5px;
}
.contacto-footer {
  background-color: #004AAD;
  color: white;
  padding: 30px 20px;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  margin-top: auto;
}
.contacto-container h3 {
  margin-bottom: 15px;
  font-size: 20px;
  color: #3f2700;
  font-weight: bold;
}
.copy {
  margin-top: 15px;
  font-size: 13px;
  color: #e0e0e0;
}
</style>
