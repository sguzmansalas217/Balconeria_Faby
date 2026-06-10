<template>
  <div class="clientes-container">

    <!-- Encabezado -->
    <section class="page-header">
      <h2>Clientes</h2>
      <div class="title-bar"></div>
      <p class="sub">Empresas e instituciones que han confiado en nosotros</p>
    </section>

    <!-- Grid de logos -->
    <section class="logos-section">
      <div class="logos-grid">
        <div class="logo-card" v-for="(c, i) in clientesLogos" :key="i">
          <img :src="c.img" :alt="c.nombre" />
        </div>
      </div>
    </section>

    <!-- Lista de nombres -->
    <section class="lista-section">
      <h3>Nuestros principales clientes</h3>
      <div class="lista-grid">
        <div class="lista-item" v-for="(nombre, i) in clientesNombres" :key="i">
          <span class="lista-check">✔</span>
          {{ nombre }}
        </div>
      </div>
    </section>

  </div>
</template>

<script>
import emporium          from '@/assets/clientes/emporium.png';
import interXterior      from '@/assets/clientes/interXterior.png';
import arqduo            from '@/assets/clientes/arqduo.png';
import Aguascalientes    from '@/assets/clientes/Aguascalientes.png';
import Aeme              from '@/assets/clientes/Aeme.png';
import Alba              from '@/assets/clientes/Alba.png';
import municipio         from '@/assets/clientes/municipioAguascalientes.png';

export default {
  name: 'Clientes',
  data() {
    return {
      clientesLogos: [
        { img: emporium,       nombre: 'Grupo Emporium' },
        { img: interXterior,   nombre: 'InterXterior' },
        { img: arqduo,         nombre: 'Arqduo Constructora' },
        { img: Aguascalientes, nombre: 'Gobierno de Aguascalientes' },
        { img: Aeme,           nombre: 'Aeme Arquitectos' },
        { img: Alba,           nombre: 'Construcciones de Alba' },
        { img: municipio,      nombre: 'Municipio de Aguascalientes' },
      ],
      clientesNombres: [
        'Grupo Emporium',
        'Construcciones Caruzo',
        'Arqduo',
        'InterXterior Constructora',
        'Grupo Constructor Sajar S.A de C.V',
        'Construcciones OZR',
        'Gobierno del Estado de Aguascalientes',
        'Aeme Arquitectos',
        'Construcciones de Alba',
        'Municipio de Aguascalientes',
      ],
    };
  },
};
</script>

<style scoped>
* { box-sizing: border-box; }

.clientes-container {
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

/* ── LOGOS ───────────────────────────── */
.logos-section {
  width: 100%;
  padding: 72px 32px;
  background: #f7f9fc;
}

.logos-grid {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;
  justify-items: center;
  align-items: center;
}

.logo-card {
  background: #fff;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  padding: 24px 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.25s, transform 0.25s;
}

.logo-card:hover {
  box-shadow: 0 8px 24px rgba(0,74,173,0.1);
  transform: translateY(-3px);
}

.logo-card img {
  max-width: 120px;
  max-height: 80px;
  object-fit: contain;
  filter: grayscale(30%);
  transition: filter 0.25s;
}

.logo-card:hover img {
  filter: grayscale(0%);
}

/* ── LISTA ───────────────────────────── */
.lista-section {
  width: 100%;
  padding: 72px 32px;
  background: #fff;
  text-align: center;
}

.lista-section h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #004AAD;
  margin-bottom: 8px;
}

.lista-section h3::after {
  content: '';
  display: block;
  width: 44px;
  height: 3px;
  background: #FBB034;
  border-radius: 2px;
  margin: 10px auto 40px;
}

.lista-grid {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
  text-align: left;
}

.lista-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  color: #334155;
  background: #f7f9fc;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
}

.lista-check {
  background: #004AAD;
  color: #fff;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
}

/* ── RESPONSIVE ──────────────────────── */
@media (max-width: 768px) {
  .page-header { padding: 48px 16px 36px; }
  .page-header h2 { font-size: 1.7rem; }
  .logos-section { padding: 48px 16px; }
  .logos-grid { grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 16px; }
  .lista-section { padding: 48px 16px; }
  .lista-grid { grid-template-columns: 1fr; }
}
</style>
