<script setup>
import { auth } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { authApi, usuariosApi } from '@/service/api';
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';

const email = ref('');
const nombre = ref('');
const password = ref('');
const confirmPassword = ref('');
const tipoUsuario = ref('User');
const cargando = ref(false);

const usuarios = ref([]);
const toast = useToast();

const limpiarCampos = () => {
  email.value = '';
  nombre.value = '';
  password.value = '';
  confirmPassword.value = '';
  tipoUsuario.value = 'User';
};

const cargarUsuarios = async () => {
  try {
    const { data } = await usuariosApi.getAll();
    usuarios.value = data;
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios', life: 3000 });
  }
};

const handleRegister = async () => {
  if (!email.value || !nombre.value || !password.value || !confirmPassword.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Todos los campos son obligatorios', life: 3000 });
    return;
  }
  if (password.value !== confirmPassword.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Las contraseñas no coinciden', life: 3000 });
    return;
  }

  cargando.value = true;
  try {
    // 1. Crear en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    // 2. Crear en PostgreSQL con rol User por default
    await authApi.getToken(user.uid, user.email, nombre.value);

    // 3. Si el rol seleccionado es Admin, promoverlo
    if (tipoUsuario.value === 'Admin') {
      await authApi.setRole(user.uid, 'Admin');
    }

    toast.add({ severity: 'success', summary: 'Éxito', detail: `Usuario "${nombre.value}" registrado como ${tipoUsuario.value}`, life: 3000 });
    limpiarCampos();
    cargarUsuarios();
  } catch (error) {
    let errorMsg = 'Error en el registro';
    if (error.code === 'auth/email-already-in-use') errorMsg = 'El correo ya está registrado';
    else if (error.code === 'auth/invalid-email') errorMsg = 'Correo electrónico inválido';
    else if (error.code === 'auth/weak-password') errorMsg = 'La contraseña es demasiado débil (mínimo 6 caracteres)';
    toast.add({ severity: 'error', summary: 'Error', detail: errorMsg, life: 4000 });
  } finally {
    cargando.value = false;
  }
};

const cambiarRol = async (usuario) => {
  const nuevoRol = usuario.tipo_usuario === 'Admin' ? 'User' : 'Admin';
  try {
    await authApi.setRole(usuario.id, nuevoRol);
    usuario.tipo_usuario = nuevoRol;
    toast.add({ severity: 'success', summary: 'Rol actualizado', detail: `${usuario.name} → ${nuevoRol}`, life: 3000 });
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el rol', life: 3000 });
  }
};

onMounted(cargarUsuarios);
</script>

<template>
  <div class="erp-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Gestión de Usuarios</h2>
        <p class="page-sub">Crea usuarios y administra sus roles de acceso</p>
      </div>
      <div class="badge-total">{{ usuarios.length }} usuarios</div>
    </div>

    <div class="reg-layout">
      <!-- Formulario nuevo usuario -->
      <div class="form-card">
        <h3 class="section-title"><i class="pi pi-user-plus"></i> Nuevo Usuario</h3>
        <div class="reg-grid">
          <div class="field-group">
            <label class="field-label">Nombre completo</label>
            <input v-model="nombre" type="text" class="field-input" placeholder="Nombre completo" />
          </div>
          <div class="field-group">
            <label class="field-label">Correo electrónico</label>
            <input v-model="email" type="email" class="field-input" placeholder="correo@ejemplo.com" />
          </div>
          <div class="field-group">
            <label class="field-label">Contraseña</label>
            <input v-model="password" type="password" class="field-input" placeholder="Mínimo 6 caracteres" />
          </div>
          <div class="field-group">
            <label class="field-label">Confirmar contraseña</label>
            <input v-model="confirmPassword" type="password" class="field-input" placeholder="Repetir contraseña" />
          </div>
          <div class="field-group" style="grid-column:1/-1">
            <label class="field-label">Rol</label>
            <div class="rol-selector">
              <button class="rol-btn" :class="{ active: tipoUsuario === 'User' }" @click="tipoUsuario = 'User'">
                <i class="pi pi-eye"></i>
                <span class="rol-btn-label">Usuario</span>
                <span class="rol-btn-desc">Solo visualización</span>
              </button>
              <button class="rol-btn" :class="{ active: tipoUsuario === 'Admin' }" @click="tipoUsuario = 'Admin'">
                <i class="pi pi-shield"></i>
                <span class="rol-btn-label">Administrador</span>
                <span class="rol-btn-desc">Acceso total</span>
              </button>
            </div>
          </div>
        </div>
        <div style="margin-top:20px">
          <button class="erp-btn erp-btn-primary" style="width:100%;justify-content:center" @click="handleRegister" :disabled="cargando">
            <i class="pi pi-user-plus"></i> {{ cargando ? 'Registrando...' : 'Registrar Usuario' }}
          </button>
        </div>
      </div>

      <!-- Lista de usuarios existentes -->
      <div class="table-card">
        <div class="table-toolbar" style="padding:16px 18px">
          <span style="font-size:0.85rem;font-weight:700;color:#002a5e">Usuarios registrados</span>
          <span style="font-size:0.78rem;color:#64748b">Clic en el rol para cambiarlo</span>
        </div>
        <table class="erp-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol actual</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuarios" :key="u.id">
              <td class="font-medium">{{ u.name || '—' }}</td>
              <td class="text-muted">{{ u.email }}</td>
              <td>
                <button
                  class="rol-toggle"
                  :class="u.tipo_usuario === 'Admin' ? 'rol-admin' : 'rol-user'"
                  @click="cambiarRol(u)"
                  :title="`Clic para cambiar a ${u.tipo_usuario === 'Admin' ? 'Usuario' : 'Admin'}`"
                >
                  <i :class="u.tipo_usuario === 'Admin' ? 'pi pi-shield' : 'pi pi-eye'"></i>
                  {{ u.tipo_usuario === 'Admin' ? 'Admin' : 'Usuario' }}
                  <i class="pi pi-sync" style="font-size:0.65rem;opacity:0.6"></i>
                </button>
              </td>
            </tr>
            <tr v-if="usuarios.length === 0">
              <td colspan="3" class="empty-row">No hay usuarios registrados</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reg-layout { display:grid; grid-template-columns:420px 1fr; gap:20px; align-items:start; }
.reg-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.section-title { font-size:0.9rem; font-weight:800; color:#002a5e; margin:0 0 18px; display:flex; align-items:center; gap:8px; }

.rol-selector { display:flex; gap:10px; }
.rol-btn {
  flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;
  padding:14px 10px; border:2px solid #e2e8f0; border-radius:10px;
  background:#fafbff; cursor:pointer; transition:all 0.2s; font-family:inherit;
}
.rol-btn:hover { border-color:#004AAD; background:#eff6ff; }
.rol-btn.active { border-color:#004AAD; background:#eff6ff; }
.rol-btn.active .rol-btn-label { color:#004AAD; }
.rol-btn i { font-size:1.3rem; color:#64748b; }
.rol-btn.active i { color:#004AAD; }
.rol-btn-label { font-size:0.82rem; font-weight:700; color:#475569; }
.rol-btn-desc { font-size:0.7rem; color:#94a3b8; }

.rol-toggle {
  display:inline-flex; align-items:center; gap:5px;
  padding:4px 12px; border-radius:20px; border:none; cursor:pointer;
  font-size:0.75rem; font-weight:700; font-family:inherit; transition:opacity 0.2s;
}
.rol-toggle:hover { opacity:0.8; }
.rol-admin { background:#FBB034; color:#002a5e; }
.rol-user  { background:#dbeafe; color:#1d4ed8; }

@media(max-width:900px){
  .reg-layout { grid-template-columns:1fr; }
  .reg-grid { grid-template-columns:1fr; }
}
</style>
