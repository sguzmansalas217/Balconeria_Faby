const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// POST /api/cotizacion  — ruta PÚBLICA (no requiere JWT)
router.post("/", async (req, res) => {
  const { nombre, correo, telefono, comentario } = req.body;

  if (!nombre || !correo || !telefono || !comentario) {
    return res.status(400).json({ error: "Todos los campos son requeridos" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"MAGUZSA Web" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_DESTINO,
      replyTo: correo,
      subject: `Nueva solicitud de cotización — ${nombre}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#003a6b,#004AAD);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#FBB034">MAGUZSA</p>
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff">Nueva Solicitud de Cotización</h1>
            <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,0.7)">Recibida el ${new Date().toLocaleDateString('es-MX',{day:'2-digit',month:'long',year:'numeric'})}</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#ffffff;padding:36px 40px">
            <p style="margin:0 0 24px;font-size:15px;color:#475569">
              Se ha recibido una nueva solicitud de cotización a través del sitio web. Aquí están los datos del cliente:
            </p>

            <!-- DATOS -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
              <tr style="background:#f8fafc">
                <td style="padding:14px 20px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;width:35%;border-bottom:1px solid #e2e8f0">Nombre</td>
                <td style="padding:14px 20px;font-size:15px;color:#1e293b;font-weight:600;border-bottom:1px solid #e2e8f0">${nombre}</td>
              </tr>
              <tr>
                <td style="padding:14px 20px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;background:#f8fafc;border-bottom:1px solid #e2e8f0">Correo</td>
                <td style="padding:14px 20px;border-bottom:1px solid #e2e8f0"><a href="mailto:${correo}" style="color:#004AAD;font-size:15px;text-decoration:none;font-weight:600">${correo}</a></td>
              </tr>
              <tr style="background:#f8fafc">
                <td style="padding:14px 20px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e2e8f0">Teléfono</td>
                <td style="padding:14px 20px;font-size:15px;color:#1e293b;font-weight:600;border-bottom:1px solid #e2e8f0">${telefono}</td>
              </tr>
              <tr>
                <td style="padding:14px 20px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top">Comentario</td>
                <td style="padding:14px 20px;font-size:15px;color:#1e293b;line-height:1.6">${comentario}</td>
              </tr>
            </table>

            <!-- CTA -->
            <div style="margin-top:28px;text-align:center">
              <a href="mailto:${correo}?subject=Re: Cotización MAGUZSA" style="display:inline-block;background:#004AAD;color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:50px;text-decoration:none">
                Responder al cliente &rarr;
              </a>
            </div>

            <p style="margin-top:24px;font-size:12px;color:#94a3b8;text-align:center">
              Al hacer clic en "Responder al cliente" se abrirá un correo dirigido a <strong>${correo}</strong>
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#001f3f;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center">
            <p style="margin:0;font-size:12px;color:#475569">© 2025 MAGUZSA — Corporativo Maguzsa S.A de C.V</p>
            <p style="margin:6px 0 0;font-size:12px;color:#334155">📞 449 180 17 69 &nbsp;|&nbsp; ✉️ herreriaguzsa@outlook.es</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    res.json({ ok: true, message: "Solicitud enviada correctamente" });

  } catch (err) {
    console.error("❌ Error enviando correo:", err.message);
    res.status(500).json({ error: `Error SMTP: ${err.message}` });
  }
});

module.exports = router;
