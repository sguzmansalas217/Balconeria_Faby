<template>
  <div class="servicios-container">

    <!-- Encabezado -->
    <section class="page-header">
      <h2>Servicios</h2>
      <div class="title-bar"></div>
      <p class="sub">Conoce algunos de nuestros trabajos destacados</p>
    </section>

    <!-- Lista de servicios -->
    <section class="servicios-list">
      <div class="servicio" v-for="(s, i) in servicios" :key="i" :class="{ reverse: i % 2 !== 0 }">
        <div class="servicio-imagenes">
          <div
            v-for="(img, j) in s.imagenes"
            :key="j"
            class="img-wrap"
            @click="abrirModal(img)"
          >
            <img :src="img" :alt="s.titulo" />
            <div class="img-overlay">
              <span>Ver imagen</span>
            </div>
          </div>
        </div>
        <div class="servicio-texto">
          <div class="servicio-num">{{ String(i + 1).padStart(2, '0') }}</div>
          <h3>{{ s.titulo }}</h3>
          <p>{{ s.descripcion }}</p>
        </div>
      </div>
    </section>

    <!-- Texto general -->
    <section class="cierre-section">
      <div class="cierre-inner">
        <p>Cada fabricación y montaje está avalado por personal altamente capacitado y certificado. Somos una empresa con capacidad de crear desde lo más pequeño hasta lograr estructuras monumentales.</p>
        <p>Contamos con el equipo y las herramientas adecuadas que nos permiten desarrollar el diseño y proyecto solicitado en diferentes tipos de edificaciones, logrando excelentes resultados apegados a los requerimientos necesarios.</p>
      </div>
    </section>

    <!-- Lightbox -->
    <transition name="fade">
      <div class="lightbox" v-if="modalVisible" @click="cerrarModal">
        <button class="lightbox-close" @click.stop="cerrarModal">✕</button>
        <img :src="imagenModal" alt="Imagen ampliada" @click.stop />
      </div>
    </transition>

  </div>
</template>

<script>
import andamios from '@/assets/trabajos/andamios.png';
import entrada1 from '@/assets/trabajos/entrada1.png';
import nave1    from '@/assets/trabajos/nave1.png';
import nave2    from '@/assets/trabajos/nave2.png';
import pergola1 from '@/assets/trabajos/pergola1.png';
import pergola2 from '@/assets/trabajos/pergola2.png';
import racks1   from '@/assets/trabajos/racks1.png';

export default {
  name: 'Servicios',
  data() {
    return {
      modalVisible: false,
      imagenModal: '',
      servicios: [
        {
          titulo: 'Pérgolas',
          descripcion: 'Fabricamos y montamos pérgolas con materiales de alta calidad, adaptadas a cada proyecto residencial o comercial. Cada estructura es diseñada para ser funcional y estética.',
          imagenes: [pergola1, pergola2],
        },
        {
          titulo: 'Racks industriales',
          descripcion: 'Diseñamos racks industriales personalizados que maximizan el espacio y garantizan la seguridad de tus productos.',
          imagenes: [racks1],
        },
        {
          titulo: 'Entradas residenciales',
          descripcion: 'Creamos entradas para fraccionamientos residenciales con diseño estético y funcionalidad, adaptadas a cada proyecto.',
          imagenes: [entrada1],
        },
        {
          titulo: 'Naves industriales',
          descripcion: 'Construimos naves industriales adaptadas a las necesidades específicas de cada cliente, cumpliendo normas de seguridad y funcionalidad.',
          imagenes: [nave1, nave2],
        },
        {
          titulo: 'Andamios',
          descripcion: 'Fabricamos andamios de cualquier tipo para trabajar de modo seguro en obra.',
          imagenes: [andamios],
        },
      ],
    };
  },
  methods: {
    abrirModal(img) {
      this.imagenModal = img;
      this.modalVisible = true;
    },
    cerrarModal() {
      this.modalVisible = false;
      this.imagenModal = '';
    },
  },
};
</script>

<style scoped>
* { box-sizing: border-box; }

.servicios-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Segoe UI', system-ui, Arial, sans-serif;
}

/* ── ENCABEZADO ──────────────────────── */
.page-header {
  width: 100%;
  padding: 64px 24px 48px;
  text-align: center;
  background: #fff;
  border-bottom: 1px solid #e8edf2;
}

.page-header h2 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #004AAD;
  margin: 0 0 12px;
}

.title-bar {
  width: 56px;
  height: 4px;
  background: #FBB034;
  border-radius: 2px;
  margin: 0 auto 20px;
}

.sub {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

/* ── SERVICIOS ───────────────────────── */
.servicios-list {
  width: 100%;
  padding: 0;
}

.servicio {
  display: flex;
  align-items: center;
  gap: 56px;
  padding: 72px 64px;
  border-bottom: 1px solid #e8edf2;
  background: #fff;
}

.servicio:nth-child(even) {
  background: #f7f9fc;
}

.servicio.reverse {
  flex-direction: row-reverse;
}

/* Imágenes */
.servicio-imagenes {
  flex: 1 1 50%;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.img-wrap {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: zoom-in;
  flex: 1 1 240px;
  max-width: 340px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s, transform 0.3s;
}

.img-wrap:hover {
  box-shadow: 0 12px 36px rgba(0,0,0,0.18);
  transform: translateY(-4px);
}

.img-wrap img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
  transition: transform 0.4s;
}

.img-wrap:hover img {
  transform: scale(1.04);
}

.img-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,74,173,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.img-wrap:hover .img-overlay {
  opacity: 1;
}

.img-overlay span {
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Texto */
.servicio-texto {
  flex: 1 1 40%;
}

.servicio-num {
  font-size: 3.5rem;
  font-weight: 900;
  color: #e2e8f0;
  line-height: 1;
  margin-bottom: 8px;
  font-family: 'Segoe UI', system-ui, Arial, sans-serif;
}

.servicio-texto h3 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #002a5e;
  margin: 0 0 16px;
  position: relative;
}

.servicio-texto h3::after {
  content: '';
  display: block;
  width: 36px;
  height: 3px;
  background: #FBB034;
  border-radius: 2px;
  margin-top: 10px;
}

.servicio-texto p {
  font-size: 0.98rem;
  color: #475569;
  line-height: 1.8;
  margin: 0;
}

/* ── CIERRE ──────────────────────────── */
.cierre-section {
  width: 100%;
  padding: 72px 32px;
  background: linear-gradient(to right, #004AAD, #0072c6);
}

.cierre-inner {
  max-width: 860px;
  margin: 0 auto;
  text-align: center;
}

.cierre-inner p {
  font-size: 1rem;
  color: rgba(255,255,255,0.9);
  line-height: 1.85;
  margin-bottom: 16px;
}

.cierre-inner p:last-child { margin-bottom: 0; }

/* ── LIGHTBOX ────────────────────────── */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0,10,30,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  cursor: zoom-out;
}

.lightbox img {
  max-width: 90vw;
  max-height: 88vh;
  border-radius: 10px;
  box-shadow: 0 16px 64px rgba(0,0,0,0.5);
  cursor: default;
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 24px;
  background: rgba(255,255,255,0.15);
  border: none;
  color: #fff;
  font-size: 1.1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}
.lightbox-close:hover { background: rgba(255,255,255,0.3); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.22s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── RESPONSIVE ──────────────────────── */
@media (max-width: 1024px) {
  .servicio { padding: 56px 32px; gap: 36px; }
}

@media (max-width: 768px) {
  .page-header { padding: 48px 16px 36px; }
  .page-header h2 { font-size: 1.7rem; }
  .servicio { flex-direction: column !important; padding: 48px 16px; gap: 28px; }
  .servicio-imagenes { width: 100%; }
  .img-wrap { max-width: 100%; }
  .servicio-num { font-size: 2.5rem; }
  .servicio-texto h3 { font-size: 1.35rem; }
  .cierre-section { padding: 48px 16px; }
}
</style>
