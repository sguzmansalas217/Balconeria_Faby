<template>
  <div class="nosotros-container">

    <!-- Encabezado -->
    <section class="page-header">
      <h2>Nosotros</h2>
      <div class="title-bar"></div>
      <p class="sub">Conoce quiénes somos y lo que nos define</p>
    </section>

    <!-- Contenido principal -->
    <section class="content-section">
      <div class="content-inner">
        <div class="text-block">
          <p>
            Somos una empresa especializada en la <strong>fabricación y montaje de estructuras metálicas</strong> industriales y residenciales, así como en la manufactura de <strong>racks y andamios personalizados</strong>.
          </p>
          <p>
            Garantizamos calidad, diseño y durabilidad, seleccionando cuidadosamente los materiales para satisfacer las necesidades de cada cliente.
          </p>
          <p>
            Ofrecemos un servicio integral: <strong>diseño, manufactura, supervisión y ejecución de obra</strong>, cumpliendo con la normatividad vigente.
          </p>
          <p>
            Hemos colaborado en proyectos residenciales, comerciales, industriales y gubernamentales, participando en obras emblemáticas como <strong>FICO 13</strong>.
          </p>
          <p>
            Contamos con un equipo de <strong>profesionales altamente capacitados</strong> y la tecnología más avanzada del mercado.
          </p>
        </div>
        <div class="image-block">
          <img src="@/assets/estructura1.png" alt="Estructura metálica MAGUZSA" />
        </div>
      </div>
    </section>

    <!-- Pilares -->
    <section class="pilares-section">
      <h3>Nuestros Pilares</h3>
      <div class="pilares-grid">
        <div class="pilar-card">
          <div class="pilar-icon">✔</div>
          <p>Calidad y precisión en cada proyecto</p>
        </div>
        <div class="pilar-card">
          <div class="pilar-icon">✔</div>
          <p>Innovación en diseño y manufactura</p>
        </div>
        <div class="pilar-card">
          <div class="pilar-icon">✔</div>
          <p>Cumplimiento de normatividad</p>
        </div>
        <div class="pilar-card">
          <div class="pilar-icon">✔</div>
          <p>Experiencia en proyectos industriales, residenciales y gubernamentales</p>
        </div>
      </div>
    </section>

  </div>
</template>

<script>
export default { name: 'Nosotros' };
</script>

<style scoped>
* { box-sizing: border-box; }

.nosotros-container {
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

/* ── CONTENIDO PRINCIPAL ─────────────── */
.content-section {
  width: 100%;
  padding: 72px 32px;
  background: #f7f9fc;
}

.content-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  gap: 56px;
  align-items: center;
  flex-wrap: wrap;
}

.text-block {
  flex: 1 1 55%;
  font-size: 1rem;
  color: #334155;
  line-height: 1.85;
}

.text-block p { margin-bottom: 16px; }

.text-block strong { color: #002a5e; }

.image-block {
  flex: 1 1 35%;
  text-align: center;
}

.image-block img {
  width: 100%;
  max-width: 420px;
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  object-fit: cover;
}

/* ── PILARES ─────────────────────────── */
.pilares-section {
  width: 100%;
  padding: 72px 32px;
  background: #fff;
  text-align: center;
}

.pilares-section h3 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #004AAD;
  margin-bottom: 8px;
}

.pilares-section h3::after {
  content: '';
  display: block;
  width: 44px;
  height: 3px;
  background: #FBB034;
  margin: 10px auto 40px;
  border-radius: 2px;
}

.pilares-grid {
  max-width: 960px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.pilar-card {
  background: #f7f9fc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 28px 20px;
  transition: box-shadow 0.25s, transform 0.25s;
}

.pilar-card:hover {
  box-shadow: 0 8px 24px rgba(0,74,173,0.1);
  transform: translateY(-4px);
}

.pilar-icon {
  width: 44px;
  height: 44px;
  background: #004AAD;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 auto 16px;
}

.pilar-card p {
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.6;
  margin: 0;
}

/* ── RESPONSIVE ──────────────────────── */
@media (max-width: 768px) {
  .page-header { padding: 48px 16px 36px; }
  .page-header h2 { font-size: 1.7rem; }
  .content-section { padding: 48px 16px; }
  .content-inner { flex-direction: column; gap: 32px; }
  .pilares-section { padding: 48px 16px; }
  .pilares-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 480px) {
  .pilares-grid { grid-template-columns: 1fr; }
}
</style>
