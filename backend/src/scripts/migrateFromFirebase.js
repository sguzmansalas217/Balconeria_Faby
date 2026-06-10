/**
 * Script de migración: exporta datos de Firebase Firestore e importa a PostgreSQL
 *
 * Este script SÍ usa firebase-admin porque es un script one-time que corre
 * en tu PC local para copiar los datos. El servidor backend en sí NO usa Firebase.
 *
 * INSTRUCCIONES:
 * 1. Instala temporalmente: npm install firebase-admin
 * 2. Coloca el archivo firebase-admin-key.json en backend/
 * 3. Configura el .env con los datos de PostgreSQL
 * 4. Ejecuta: npm run migrate (para crear tablas primero)
 * 5. Ejecuta: npm run seed-from-firebase
 * 6. Cuando termine, puedes desinstalar: npm uninstall firebase-admin
 */
require("dotenv").config();

let admin;
try {
  admin = require("firebase-admin");
} catch (e) {
  console.error("❌ firebase-admin no está instalado.");
  console.error("   Instálalo temporalmente: npm install firebase-admin");
  console.error("   Luego coloca firebase-admin-key.json en backend/");
  process.exit(1);
}

const path = require("path");
const pool = require("../db/pool");

// Inicializar Firebase solo para la migración
const keyPath = path.resolve("./firebase-admin-key.json");
try {
  const serviceAccount = require(keyPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (e) {
  console.error("❌ No se encontró firebase-admin-key.json");
  console.error("   Descárgalo desde Firebase Console > Configuración > Cuentas de servicio");
  process.exit(1);
}

const db = admin.firestore();

function toDate(val) {
  if (!val) return null;
  if (val.toDate) return val.toDate();
  if (val instanceof Date) return val;
  if (val.seconds) return new Date(val.seconds * 1000);
  if (typeof val === "string") return new Date(val);
  return null;
}

async function migrateUsuarios() {
  console.log("\n📦 Migrando usuarios...");
  const snap = await db.collection("usuarios").get();
  let count = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    await pool.query(
      `INSERT INTO usuarios (id, email, name, tipo_usuario, creado_en)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email, name=EXCLUDED.name, tipo_usuario=EXCLUDED.tipo_usuario`,
      [doc.id, d.email, d.name || d.nombre || null, d.tipoUsuario || "User", toDate(d.creadoEn)]
    );
    count++;
  }
  console.log(`   ✅ ${count} usuarios migrados`);
}

async function migrateHerramientas() {
  console.log("\n📦 Migrando herramientas...");
  const snap = await db.collection("herramientas").get();
  let count = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    await pool.query(
      `INSERT INTO herramientas (firebase_id, nombre, codigo, marca, descripcion, disponible, dado_de_baja, usuario_asignado, fecha_asignacion, fecha_retorno, fecha_registro)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (firebase_id) DO UPDATE SET nombre=EXCLUDED.nombre, disponible=EXCLUDED.disponible, usuario_asignado=EXCLUDED.usuario_asignado`,
      [doc.id, d.nombre, d.codigo, d.marca, d.descripcion, d.disponible ?? true, d.dadaDeBaja ?? false,
       d.usuarioAsignado || null, toDate(d.fechaAsignacion), toDate(d.fechaRetorno), toDate(d.fechaRegistro)]
    );
    count++;
  }
  console.log(`   ✅ ${count} herramientas migradas`);
}

async function migrateLogsHerramienta() {
  console.log("\n📦 Migrando logs de herramientas...");
  const snap = await db.collection("logsHerramienta").get();
  let count = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    let herramientaId = null;
    if (d.id || d.herramientaId) {
      const res = await pool.query("SELECT id FROM herramientas WHERE firebase_id=$1", [d.id || d.herramientaId]);
      if (res.rows.length > 0) herramientaId = res.rows[0].id;
    }
    await pool.query(
      `INSERT INTO logs_herramienta (firebase_id, herramienta_id, nombre, codigo, marca, descripcion, accion, disponible, usuario_asignado, realizado_por, fecha_asignacion, fecha_retorno, fecha_regreso, fecha_registro, fecha_log)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (firebase_id) DO NOTHING`,
      [doc.id, herramientaId, d.nombre, d.codigo, d.marca, d.descripcion, d.accion || null,
       d.disponible ?? false, d.usuarioAsignado || null, d.realizadoPor || null,
       toDate(d.fechaAsignacion), toDate(d.fechaRetorno), toDate(d.fechaRegreso), toDate(d.fechaRegistro), toDate(d.fechaLog)]
    );
    count++;
  }
  console.log(`   ✅ ${count} logs de herramienta migrados`);
}

async function migrateMateriales() {
  console.log("\n📦 Migrando materiales...");
  const snap = await db.collection("materiales").get();
  let count = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    await pool.query(
      `INSERT INTO materiales (firebase_id, nombre, descripcion, unidad, disponible, fecha_disposicion, dispuesto_por, fecha_consumo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (firebase_id) DO UPDATE SET disponible=EXCLUDED.disponible, dispuesto_por=EXCLUDED.dispuesto_por`,
      [doc.id, d.nombre, d.descripcion, d.unidad, d.disponible ?? true, toDate(d.fechaDisposicion), d.dispuestoPor || null, toDate(d.fechaConsumo)]
    );
    count++;
  }
  console.log(`   ✅ ${count} materiales migrados`);
}

async function migrateLogsMateriales() {
  console.log("\n📦 Migrando logs de materiales...");
  const snap = await db.collection("logsMateriales").get();
  let count = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    let materialId = null;
    if (d.materialId) {
      const res = await pool.query("SELECT id FROM materiales WHERE firebase_id=$1", [d.materialId]);
      if (res.rows.length > 0) materialId = res.rows[0].id;
    }
    await pool.query(
      `INSERT INTO logs_materiales (firebase_id, material_id, nombre, descripcion, unidad, fecha_disposicion, dispuesto_por, fecha_log)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (firebase_id) DO NOTHING`,
      [doc.id, materialId, d.nombre, d.descripcion, d.unidad, toDate(d.fechaDisposicion), d.dispuestoPor || null, toDate(d.fechaLog)]
    );
    count++;
  }
  console.log(`   ✅ ${count} logs de materiales migrados`);
}

async function migrateFoliosLinea1() {
  console.log("\n📦 Migrando folios línea 1...");
  const snap = await db.collection("foliosLinea1").get();
  let count = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    const utilizado = d.Utilizado === true || d.Utilizado === "SI" ? "SI" : "NO";
    await pool.query(
      `INSERT INTO folios_linea1 (firebase_id, numero_folio, utilizado, cliente_asignado, nombre_login, placa, estado, year, fecha_alta, uso, referencia, referencia2, cantidad_credito)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (firebase_id) DO UPDATE SET utilizado=EXCLUDED.utilizado, cliente_asignado=EXCLUDED.cliente_asignado`,
      [doc.id, d.NumeroFolio, utilizado, d.ClienteAsignado || null, d.NombreLogin || null,
       d.Placa || null, d.Estado || null, d.Year || null, toDate(d.FechaAlta),
       d.Uso || null, d.Referencia || null, d.Referencia2 || null, d.CantidadCredito || null]
    );
    count++;
  }
  console.log(`   ✅ ${count} folios línea 1 migrados`);
}

async function migrateFoliosLinea2() {
  console.log("\n📦 Migrando folios línea 2...");
  const snap = await db.collection("foliosLinea2").get();
  let count = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    const utilizado = d.Utilizado === true || d.Utilizado === "SI" ? "SI" : "NO";
    await pool.query(
      `INSERT INTO folios_linea2 (firebase_id, numero_folio, utilizado, cliente_asignado, nombre_login, placa, estado, year, fecha_alta, uso, referencia, referencia2, cantidad_credito)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (firebase_id) DO UPDATE SET utilizado=EXCLUDED.utilizado, cliente_asignado=EXCLUDED.cliente_asignado`,
      [doc.id, d.NumeroFolio, utilizado, d.ClienteAsignado || null, d.NombreLogin || null,
       d.Placa || null, d.Estado || null, d.Year || null, toDate(d.FechaAlta),
       d.Uso || null, d.Referencia || null, d.Referencia2 || null, d.CantidadCredito || null]
    );
    count++;
  }
  console.log(`   ✅ ${count} folios línea 2 migrados`);
}

async function migrateRegistro() {
  console.log("\n📦 Migrando REGISTRO...");
  const snap = await db.collection("REGISTRO").get();
  let count = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    await pool.query(
      `INSERT INTO registro (firebase_id, fecha_registro, nota, linea, certificado, certificado_ok, placa, combustible, uso, fecha_alta, no_alta, nombre_cliente, estatus_multa, multa, no_serie, costo, cantidad_credito, fecha_pago, referencia, referencia2, year, estado, usuario_actual)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
       ON CONFLICT (firebase_id) DO UPDATE SET placa=EXCLUDED.placa, certificado=EXCLUDED.certificado, nombre_cliente=EXCLUDED.nombre_cliente`,
      [doc.id, toDate(d.FechaRegistro), d.Nota || null, d.Linea || null, d.Certificado || null,
       d.CertificadoOk ?? false, d.Placa || null, d.Combustible || null, d.Uso || null,
       toDate(d.FechaAlta), d.NoAlta || null, d.NombreCliente || null, d.estatusMulta || null,
       d.Multa || null, d.NoSerie || null, d.Costo || null, d.CantidadCredito || null,
       toDate(d.FechaPago), d.Referencia || null, d.Referencia2 || null, d.Year || null,
       d.Estado || null, d.UsuarioActual || null]
    );
    count++;
  }
  console.log(`   ✅ ${count} registros migrados`);
}

async function migrateRegistroFederal() {
  console.log("\n📦 Migrando RegistroFederal...");
  const snap = await db.collection("RegistroFederal").get();
  let count = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    await pool.query(
      `INSERT INTO registro_federal (firebase_id, fecha_registro, nota, linea, certificado, certificado_ok, placa, combustible, uso, fecha_alta, no_alta, nombre_cliente, estatus_multa, multa, no_serie, costo, cantidad_credito, fecha_pago, referencia, referencia2, year, estado, usuario_actual)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
       ON CONFLICT (firebase_id) DO NOTHING`,
      [doc.id, toDate(d.FechaRegistro), d.Nota || null, d.Linea || null, d.Certificado || null,
       d.CertificadoOk ?? false, d.Placa || null, d.Combustible || null, d.Uso || null,
       toDate(d.FechaAlta), d.NoAlta || null, d.NombreCliente || null, d.estatusMulta || null,
       d.Multa || null, d.NoSerie || null, d.Costo || null, d.CantidadCredito || null,
       toDate(d.FechaPago), d.Referencia || null, d.Referencia2 || null, d.Year || null,
       d.Estado || null, d.UsuarioActual || null]
    );
    count++;
  }
  console.log(`   ✅ ${count} registros federales migrados`);
}

async function migrateConfiguraciones() {
  console.log("\n📦 Migrando configuraciones...");
  const snap = await db.collection("Configuraciones").get();
  for (const doc of snap.docs) {
    const d = doc.data();
    await pool.query(
      `UPDATE configuraciones SET owner_gmail=$1, time_cobro=$2, time_verificacion=$3 WHERE clave='principal'`,
      [d.ownerGmail || null, d.timeCobro || null, d.timeVerificacion || null]
    );
  }
  console.log("   ✅ Configuraciones migradas");
}

async function main() {
  console.log("=================================================");
  console.log("  Migración Firebase Firestore → PostgreSQL");
  console.log("  (Script one-time — el backend NO usa Firebase)");
  console.log("=================================================");
  try {
    await migrateUsuarios();
    await migrateHerramientas();
    await migrateLogsHerramienta();
    await migrateMateriales();
    await migrateLogsMateriales();
    await migrateFoliosLinea1();
    await migrateFoliosLinea2();
    await migrateRegistro();
    await migrateRegistroFederal();
    await migrateConfiguraciones();
    console.log("\n✅ Migración completa. Ahora puedes desinstalar firebase-admin del backend.");
  } catch (err) {
    console.error("\n❌ Error durante la migración:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
