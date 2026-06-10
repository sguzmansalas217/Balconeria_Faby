<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

import AppConfigurator from './AppConfigurator.vue';
import AppPerfile from './AppPerfile.vue';

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
const mostrarPerfil = ref(false);
const route = useRoute();
const { userName, role } = useAuth();

watch(route, () => {
  mostrarPerfil.value = false;
});
</script>

<template>
  <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
        <i class="pi pi-bars"></i>
      </button>
      <router-link to="/" class="layout-topbar-logo">
        <span style="white-space: nowrap; display: inline-block;">Sistema de captura</span>
      </router-link>
      <router-link to="/" class="btn-home-web" title="Ir a la página web">
        <i class="pi pi-home"></i>
        <span>Página web</span>
      </router-link>
    </div>
<!-- CENTRO -->
    <div class="flex-1 flex justify-center items-center">
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
        <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
          <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
        </button>

        <!-- Configuración -->
        <div class="relative">
          <button
            type="button"
            class="layout-topbar-action layout-topbar-action-highlight"
            v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
          >
            <i class="pi pi-palette"></i>
          </button>
          <AppConfigurator />
        </div>
      </div>

      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">
          <button type="button" class="layout-topbar-action">
            <i class="pi pi-calendar"></i>
            <span>Calendar</span>
          </button>
          <button type="button" class="layout-topbar-action">
            <i class="pi pi-inbox"></i>
            <span>Messages</span>
          </button>
        </div>
      </div>

      <!-- Usuario -->
      <div class="relative">
        <button
          type="button"
          class="layout-topbar-action layout-topbar-action-highlight user-btn"
          @click="mostrarPerfil = !mostrarPerfil"
        >
          <i class="pi pi-user"></i>
          <span class="user-info">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role" :class="role === 'Admin' ? 'role-admin' : 'role-user'">{{ role }}</span>
          </span>
        </button>

        <!-- Menú flotante de perfil -->
        <div
          v-if="mostrarPerfil"
          class="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg z-50"
        >
          <AppPerfile />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-home-web {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 16px;
  padding: 6px 14px;
  background: #004AAD;
  color: #fff;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, transform 0.15s;
  white-space: nowrap;
}

.btn-home-web:hover {
  background: #003a8c;
  transform: translateY(-1px);
}

.btn-home-web i {
  font-size: 0.85rem;
}

.user-btn { display: inline-flex; align-items: center; gap: 8px; }
.user-info { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2; }
.user-name { font-size: 0.78rem; font-weight: 600; color: inherit; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.user-role { font-size: 0.65rem; font-weight: 700; padding: 1px 6px; border-radius: 10px; }
.role-admin { background: #FBB034; color: #002a5e; }
.role-user  { background: #dbeafe; color: #1d4ed8; }

@media (max-width: 640px) {
  .btn-home-web span { display: none; }
  .btn-home-web { padding: 6px 10px; }
  .user-info { display: none; }
}
</style>
