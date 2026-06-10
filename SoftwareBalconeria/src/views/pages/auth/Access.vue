<script setup>
import { auth, db } from '@/firebase'; // Importar la configuración de Firebase
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Importar la función para crear usuario
import { doc, setDoc } from 'firebase/firestore';
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // Para redireccionar a otras páginas

// Variables reactivas
const email = ref("");
const password = ref("");
const tipoUsuario = ref("User"); // Por defecto, tipoUsuario será "User"
const errorMessage = ref(""); // Para mostrar errores
const successMessage = ref(""); // Para mostrar mensajes de éxito
const router = useRouter(); // Para redirigir

// Función para registrar al usuario
const handleRegister = async () => {
  try {
    // Crear usuario con correo y contraseña
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    // Referencia al documento de Firestore en la colección "Usuarios"
    const userRef = doc(db, "Usuarios", user.uid);

    // Guardar los datos del usuario en Firestore
    await setDoc(userRef, {
      email: user.email, // Guardar el email
      tipoUsuario: tipoUsuario.value, // Guardar el tipo de usuario
      creadoEn: new Date() // Guardar la fecha de creación
    });

    // Mensaje de éxito
    successMessage.value = "Usuario registrado con éxito";

    // Redirigir a otra página después de registrarse (como un dashboard)
    router.replace("/dashboard");

  } catch (error) {
    // Manejar errores
    console.error("Error en el registro:", error);
    errorMessage.value = "❌ Error en el registro";

    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage.value = "❌ El correo ya está en uso";
        break;
      case "auth/invalid-email":
        errorMessage.value = "❌ Correo electrónico inválido";
        break;
      case "auth/weak-password":
        errorMessage.value = "❌ La contraseña es demasiado débil";
        break;
      case "auth/too-many-requests":
        errorMessage.value = "⚠ Demasiados intentos. Intenta más tarde.";
        break;
      default:
        errorMessage.value = "❌ Error desconocido. Intenta más tarde.";
    }
  }
};
</script>

<template>
  <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
    <div class="flex flex-col items-center justify-center w-full">
      <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
        <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
          <div class="text-center mb-8">
            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Registro de Usuario</div>
            <span class="text-muted-color font-medium">Crea una cuenta</span>
          </div>

          <!-- Formulario de registro -->
          <div>
            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
            <InputText id="email1" type="email" placeholder="Email address" class="w-full md:w-[30rem] mb-8" v-model="email" />

            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Contraseña</label>
            <Password id="password1" v-model="password" placeholder="Password" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>

            <label for="tipoUsuario" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Tipo de Usuario</label>
            <select v-model="tipoUsuario" id="tipoUsuario" class="w-full md:w-[30rem] mb-8 p-2 border rounded">
              <option value="User">Usuario</option>
              <option value="Admin">Administrador</option>
            </select>

            <!-- Mostrar mensajes de error y éxito -->
            <p v-if="errorMessage" class="text-red-500 text-center mb-4">{{ errorMessage }}</p>
            <p v-if="successMessage" class="text-green-500 text-center mb-4">{{ successMessage }}</p>

            <!-- Botón para registrar usuario -->
            <Button label="Registrar" class="w-full" @click="handleRegister"></Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pi-eye {
  transform: scale(1.6);
  margin-right: 1rem;
}

.pi-eye-slash {
  transform: scale(1.6);
  margin-right: 1rem;
}
</style>
