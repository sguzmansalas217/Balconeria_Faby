<template>
  <div class="home-container">

    <!-- Logo centrado arriba -->
    <section class="hero">
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="Logo MAGUZSA" class="logo-img" />
      </div>
    </section>

    <!-- Franja con eslogan y botón -->
    <div class="cta-bottom">
      <div class="cta-container">
        <p class="slogan">
          Ven y cotiza con nosotros, los líderes en estructuras metálicas
        </p>
        <button class="cta-btn" @click="showDialog = true">Solicita tu cotización aquí</button>
      </div>
    </div>

    <!-- Galería mejorada -->
    <section class="gallery">
      <div class="gallery-inner">
        <div class="gallery-item">
          <img src="@/assets/estructura1.png" alt="Estructura metálica 1" />
          <div class="gallery-caption">Estructuras industriales</div>
        </div>
        <div class="gallery-item">
          <img src="@/assets/estructura2.png" alt="Estructura metálica 2" />
          <div class="gallery-caption">Proyectos residenciales</div>
        </div>
        <div class="gallery-item">
          <img src="@/assets/estructura3.png" alt="Estructura metálica 3" />
          <div class="gallery-caption">Diseño y montaje</div>
        </div>
      </div>
    </section>

    <!-- Quiénes somos -->
    <section class="descripcion">
      <div class="descripcion-container">
        <h2>¿Quiénes somos?</h2>
        <p>
          Somos una empresa dedicada a la fabricación de estructuras metálicas, escaleras, portones, barandales, balcones personalizados y soluciones industriales en acero. Nos especializamos en diseño, construcción y montaje de proyectos tanto residenciales como industriales.
        </p>
        <p>
          Nuestro equipo de expertos trabaja con materiales de alta calidad para garantizar resistencia, durabilidad y estética. Ofrecemos soluciones a medida para naves industriales, cubiertas, estructuras, mezzanines, y mucho más.
        </p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="contacto-footer">
      <div class="contacto-container">
        <h3>Contáctanos</h3>
        <p><strong>Teléfono:</strong> 449 180 17 69 &nbsp;/&nbsp; 449 197 11 54</p>
        <p><strong>Email:</strong> herreriaguzsa@outlook.es</p>
        <p><strong>Dirección:</strong> Parque industrial Cobalto, Blvd. a Zacatecas Km. 9, Trojes de Alonso</p>
        <p class="copy">© 2025 MAGUZSA. Todos los derechos reservados.</p>
      </div>
    </footer>

    <!-- Modal de cotización mejorado -->
    <transition name="fade">
      <div class="modal-overlay" v-if="showDialog" @click.self="cerrarModal">
        <div class="modal">

          <!-- Éxito -->
          <div v-if="enviado" class="msg-exito">
            <div class="exito-icon">✓</div>
            <h3>¡Solicitud enviada!</h3>
            <p>Gracias, <strong>{{ form.nombre }}</strong>. Nos pondremos en contacto contigo pronto.</p>
            <button class="btn-submit" @click="cerrarModal">Cerrar</button>
          </div>

          <!-- Formulario -->
          <template v-else>
            <button class="modal-close" @click="cerrarModal">✕</button>
            <div class="modal-header-strip"></div>
            <h3 class="modal-title">Solicitar Cotización</h3>
            <p class="modal-sub">Completa el formulario y te contactamos en menos de 24 horas.</p>

            <form @submit.prevent="enviarFormulario" class="modal-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Nombre</label>
                  <input type="text" v-model="form.nombre" placeholder="Tu nombre completo" required :disabled="enviando" />
                </div>
                <div class="form-group">
                  <label>Teléfono</label>
                  <input type="tel" v-model="form.telefono" placeholder="449 000 0000" required :disabled="enviando" />
                </div>
              </div>
              <div class="form-group">
                <label>Correo electrónico</label>
                <input type="email" v-model="form.correo" placeholder="tu@correo.com" required :disabled="enviando" />
              </div>
              <div class="form-group">
                <label>¿Qué necesitas cotizar?</label>
                <textarea v-model="form.comentario" placeholder="Describe tu proyecto..." rows="4" required :disabled="enviando"></textarea>
              </div>

              <p v-if="errorMsg" class="msg-error">⚠ {{ errorMsg }}</p>

              <div class="modal-buttons">
                <button type="button" class="btn-cancel" @click="cerrarModal" :disabled="enviando">Cancelar</button>
                <button type="submit" class="btn-submit" :disabled="enviando">
                  {{ enviando ? 'Enviando...' : 'Enviar solicitud' }}
                </button>
              </div>
            </form>
          </template>

        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import { cotizacionApi } from '@/service/api';

export default {
  name: 'Home',
  data() {
    return {
      showDialog: false,
      enviando: false,
      enviado: false,
      errorMsg: '',
      form: { nombre: '', correo: '', telefono: '', comentario: '' }
    };
  },
  methods: {
    cerrarModal() {
      this.showDialog = false;
      this.enviado = false;
      this.errorMsg = '';
      this.form = { nombre: '', correo: '', telefono: '', comentario: '' };
    },
    async enviarFormulario() {
      this.enviando = true;
      this.errorMsg = '';
      try {
        await cotizacionApi.enviar(this.form);
        this.enviado = true;
      } catch (err) {
        this.errorMsg = err.response?.data?.error || 'Error al enviar. Intenta de nuevo o llámanos directamente.';
      } finally {
        this.enviando = false;
      }
    }
  }
};
</script>

<style scoped>
* { box-sizing: border-box; }

.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Segoe UI', system-ui, Arial, sans-serif;
}

/* ── HERO / LOGO ─────────────────────── */
.hero {
  width: 100%;
  min-height: 240px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e8edf2;
}

.logo-img {
  max-width: 340px;
  width: 75%;
  height: auto;
}

/* ── CTA FRANJA ──────────────────────── */
.cta-bottom {
  width: 100%;
  background: linear-gradient(to right, #004AAD, #0072c6 60%, #e8f0fb);
  padding: 56px 24px;
}

.cta-container {
  max-width: 1100px;
  margin: 0 auto;
  text-align: center;
}

.slogan {
  font-size: 1.65rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 24px;
  line-height: 1.4;
  text-shadow: 0 1px 4px rgba(0,0,0,0.15);
}

.cta-btn {
  background: #FBB034;
  color: #002a5e;
  border: none;
  padding: 14px 32px;
  font-weight: 800;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.25s, transform 0.2s;
  letter-spacing: 0.01em;
}
.cta-btn:hover {
  background: #ffc72c;
  transform: translateY(-2px);
}

/* ── GALERÍA ─────────────────────────── */
.gallery {
  width: 100%;
  padding: 60px 32px;
  background: #f7f9fc;
}

.gallery-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.gallery-item {
  flex: 1 1 280px;
  max-width: 360px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;
  background: #000;
}

.gallery-item:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 36px rgba(0,0,0,0.18);
}

.gallery-item img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  display: block;
  transition: opacity 0.3s;
}

.gallery-item:hover img {
  opacity: 0.85;
}

.gallery-caption {
  background: #004AAD;
  color: #fff;
  text-align: center;
  padding: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* ── QUIÉNES SOMOS ───────────────────── */
.descripcion {
  width: 100%;
  padding: 72px 32px;
  background: #fff;
}

.descripcion-container {
  max-width: 860px;
  margin: 0 auto;
  text-align: center;
}

.descripcion h2 {
  color: #004AAD;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 24px;
  position: relative;
  display: inline-block;
}

.descripcion h2::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  background: #FBB034;
  margin: 12px auto 0;
  border-radius: 2px;
}

.descripcion p {
  font-size: 1rem;
  color: #4a5568;
  line-height: 1.85;
  margin-bottom: 16px;
}

/* ── FOOTER ──────────────────────────── */
.contacto-footer {
  background-color: #004AAD;
  color: #fff;
  padding: 40px 24px;
  text-align: center;
  width: 100%;
}

.contacto-container {
  max-width: 1100px;
  margin: 0 auto;
}

.contacto-container h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #FBB034;
  margin-bottom: 16px;
}

.contacto-container p {
  font-size: 0.95rem;
  margin: 8px 0;
  color: rgba(255,255,255,0.9);
}

.copy {
  margin-top: 24px;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.5);
}

/* ── MODAL ───────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,20,60,0.55);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: #fff;
  border-radius: 14px;
  width: 100%;
  max-width: 520px;
  position: relative;
  box-shadow: 0 24px 64px rgba(0,0,0,0.2);
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header-strip {
  height: 5px;
  background: linear-gradient(to right, #004AAD, #FBB034);
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  background: #f1f5f9;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
  color: #64748b;
  z-index: 2;
  transition: background 0.2s;
}
.modal-close:hover { background: #e2e8f0; }

.modal-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #002a5e;
  padding: 24px 28px 4px;
}

.modal-sub {
  font-size: 0.85rem;
  color: #64748b;
  padding: 0 28px 20px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 28px 28px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #002a5e;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.form-group input,
.form-group textarea {
  padding: 10px 13px;
  border: 1.5px solid #dde3ec;
  border-radius: 7px;
  font-size: 0.93rem;
  color: #1a1a2e;
  font-family: inherit;
  background: #fafbff;
  transition: border-color 0.2s, box-shadow 0.2s;
  resize: none;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #004AAD;
  box-shadow: 0 0 0 3px rgba(0,74,173,0.1);
  background: #fff;
}

.form-group input:disabled,
.form-group textarea:disabled { opacity: 0.55; cursor: not-allowed; }

.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.btn-cancel {
  flex: 1;
  padding: 11px;
  border: 1.5px solid #dde3ec;
  border-radius: 7px;
  background: #fff;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel:hover { background: #f8fafc; }
.btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-submit {
  flex: 2;
  padding: 11px;
  border: none;
  border-radius: 7px;
  background: #004AAD;
  color: #fff;
  font-size: 0.93rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.btn-submit:hover { background: #003a8c; transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.msg-error {
  color: #dc2626;
  font-size: 0.85rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 7px;
  padding: 10px 13px;
  margin: 0;
}

/* Éxito */
.msg-exito {
  text-align: center;
  padding: 48px 28px;
}

.exito-icon {
  width: 60px;
  height: 60px;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 900;
  margin: 0 auto 20px;
}

.msg-exito h3 {
  font-size: 1.3rem;
  font-weight: 800;
  color: #002a5e;
  margin-bottom: 10px;
}

.msg-exito p {
  font-size: 0.93rem;
  color: #64748b;
  margin-bottom: 0;
}

.msg-exito .btn-submit {
  display: inline-block;
  margin-top: 24px;
  flex: none;
  width: auto;
  padding: 11px 32px;
}

/* Fade */
.fade-enter-active, .fade-leave-active { transition: opacity 0.22s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── RESPONSIVE ──────────────────────── */
@media (max-width: 1024px) {
  .slogan { font-size: 1.4rem; }
  .gallery-item { max-width: 45%; }
}

@media (max-width: 768px) {
  .cta-bottom { padding: 40px 16px; }
  .slogan { font-size: 1.15rem; }
  .cta-btn { width: 100%; font-size: 0.95rem; padding: 13px; }
  .gallery { padding: 40px 16px; }
  .gallery-inner { flex-direction: column; align-items: center; }
  .gallery-item { max-width: 100%; flex: none; width: 100%; }
  .descripcion { padding: 48px 16px; }
  .descripcion h2 { font-size: 1.6rem; }
  .contacto-footer { padding: 28px 16px; }
  .form-row { grid-template-columns: 1fr; }
  .modal-buttons { flex-direction: column-reverse; }
  .modal-title { padding: 20px 20px 4px; }
  .modal-sub { padding: 0 20px 16px; }
  .modal-form { padding: 0 20px 20px; }
}
</style>
