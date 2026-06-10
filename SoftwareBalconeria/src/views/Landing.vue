<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar">
      <!-- Logo -->
      <div class="nav-logo" @click="navigate('Home')" title="Inicio">
        <img src="@/assets/logo.png" alt="MAGUZSA" />
      </div>

      <!-- Botón hamburguesa para móviles -->
      <div class="hamburger" @click="toggleMenu" :class="{ open: menuOpen }">
        <div></div>
        <div></div>
        <div></div>
      </div>

      <ul :class="['nav-links', { 'active': menuOpen }]">
        <li v-for="item in navItems" :key="item.view">
          <a
            href="#"
            :class="{ 'nav-active': currentView === item.view }"
            @click.prevent="item.action ? item.action() : navigate(item.view)"
          >
            {{ item.label }}
          </a>
        </li>
      </ul>
    </nav>

    <!-- Render dinámico -->
    <component :is="currentViewComponent" />
  </div>
</template>

<script>
import Home from '@/components/landing/Home.vue'
import Nosotros from '@/components/landing/Nosotros.vue'
import Servicios from '@/components/landing/Servicios.vue'
import Clientes from '@/components/landing/Clientes.vue'
import Contacto from '@/components/landing/Contacto.vue'

export default {
  data() {
    return {
      currentView: 'Home',
      menuOpen: false,
    }
  },
  components: { Home, Nosotros, Servicios, Clientes, Contacto },
  computed: {
    currentViewComponent() {
      return this.currentView
    },
    navItems() {
      return [
        { view: 'Home',      label: 'Home' },
        { view: 'Nosotros',  label: 'Nosotros' },
        { view: 'Servicios', label: 'Servicios' },
        { view: 'Clientes',  label: 'Clientes' },
        { view: 'Contacto',  label: 'Contacto' },
        { view: 'ERP',       label: 'ERP', action: () => this.goSistema() },
      ]
    }
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen
    },
    navigate(view) {
      this.currentView = view
      this.menuOpen = false
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    goSistema() {
      window.open('https://www.maguzsa.com/login', '_blank')
      this.menuOpen = false
    }
  }
}
</script>

<style scoped>
* { box-sizing: border-box; }

/* ── NAVBAR ──────────────────────────── */
.navbar {
  background: linear-gradient(to right, #002a5e, #004AAD);
  padding: 0 32px;
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 16px rgba(0,0,0,0.18);
}

/* Logo */
.nav-logo {
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 8px 0;
  flex-shrink: 0;
}

.nav-logo img {
  height: 44px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) invert(1);
  transition: opacity 0.2s;
}

.nav-logo:hover img { opacity: 0.85; }

/* Links */
.nav-links {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  margin: 0;
}

.nav-links li a {
  display: inline-block;
  padding: 8px 16px;
  font-size: 0.88rem;
  font-weight: 600;
  color: rgba(255,255,255,0.82);
  text-decoration: none;
  border-radius: 6px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: background 0.2s, color 0.2s;
  font-family: 'Segoe UI', system-ui, Arial, sans-serif;
}

.nav-links li a:hover {
  background: rgba(255,255,255,0.12);
  color: #fff;
}

.nav-links li a.nav-active {
  background: #FBB034;
  color: #002a5e;
}

.nav-links li a.nav-active:hover {
  background: #ffc72c;
  color: #002a5e;
}

/* ERP — botón especial */
.nav-links li:last-child a {
  background: rgba(251,176,52,0.15);
  color: #FBB034;
  border: 1px solid rgba(251,176,52,0.4);
  margin-left: 8px;
}

.nav-links li:last-child a:hover {
  background: #FBB034;
  color: #002a5e;
  border-color: #FBB034;
}

.nav-links li:last-child a.nav-active {
  background: #FBB034;
  color: #002a5e;
  border-color: #FBB034;
}

/* ── HAMBURGUESA ─────────────────────── */
.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
  padding: 4px;
}

.hamburger div {
  width: 24px;
  height: 2.5px;
  background: #FBB034;
  border-radius: 2px;
  transition: transform 0.3s, opacity 0.3s;
}

.hamburger.open div:nth-child(1) { transform: translateY(7.5px) rotate(45deg); }
.hamburger.open div:nth-child(2) { opacity: 0; }
.hamburger.open div:nth-child(3) { transform: translateY(-7.5px) rotate(-45deg); }

/* ── RESPONSIVE ──────────────────────── */
@media (max-width: 768px) {
  .navbar {
    padding: 0 16px;
    flex-wrap: wrap;
    height: auto;
    min-height: 60px;
  }

  .nav-logo img { height: 36px; }

  .hamburger { display: flex; }

  .nav-links {
    position: absolute;
    top: 60px;
    left: 0;
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    background: #002a5e;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s ease;
    gap: 0;
    box-shadow: 0 8px 20px rgba(0,0,0,0.25);
  }

  .nav-links.active { max-height: 420px; }

  .nav-links li a {
    display: block;
    padding: 14px 24px;
    font-size: 0.95rem;
    border-radius: 0;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .nav-links li:last-child a {
    margin-left: 0;
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
}
</style>
