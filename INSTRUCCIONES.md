# Instrucciones de Migración y Despliegue

## Estructura del proyecto

```
BalconeriaFaby/
├── backend/                  ← API Node.js + Express + PostgreSQL (NUEVO)
├── SoftwareBalconeria/       ← Frontend Vue.js (modificado)
├── docker-compose.yml        ← Docker para desarrollo local
├── docker-compose.prod.yml   ← Docker para Digital Ocean
└── deploy.sh                 ← Script de despliegue en servidor
```

---

## PASO 1 - Obtener la clave Firebase Admin SDK

El backend necesita verificar los tokens de Firebase Auth.

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Proyecto `balconeriafaby` → Configuración del proyecto (ícono engranaje)
3. Pestaña **Cuentas de servicio**
4. Clic en **Generar nueva clave privada**
5. Guardar el archivo descargado como: `backend/firebase-admin-key.json`

> ⚠️ Este archivo contiene credenciales secretas. Nunca lo subas a Git.

---

## PASO 2 - Configurar variables de entorno del backend

```bash
cd backend
cp .env.example .env
```

Editar `backend/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=balconeria_db
DB_USER=postgres
DB_PASSWORD=balconeria2025
PORT=3001
FIREBASE_PROJECT_ID=balconeriafaby
FIREBASE_ADMIN_KEY_PATH=./firebase-admin-key.json
```

---

## PASO 3 - Desarrollo local (opción A: Docker)

```bash
cd BalconeriaFaby
docker compose up -d
```

Esto levanta:
- PostgreSQL en `localhost:5432`
- Backend en `http://localhost:3001`
- Frontend en `http://localhost:5173`

Primer arranque - crear las tablas:
```bash
docker compose exec backend node src/db/migrate.js
```

---

## PASO 3 - Desarrollo local (opción B: sin Docker)

### PostgreSQL con pgAdmin
1. Abrir pgAdmin
2. Crear base de datos `balconeria_db`
3. Usuario `postgres` con la contraseña que tengas configurada

### Backend
```bash
cd backend
npm install
# Ajusta el .env con tu contraseña de postgres
npm run migrate    # Crea las tablas
npm run dev        # Inicia el servidor en puerto 3001
```

### Frontend
```bash
cd SoftwareBalconeria
npm install
# El .env ya tiene VITE_API_URL=http://localhost:3001
npm run dev
```

---

## PASO 4 - Migrar datos de Firebase a PostgreSQL

Con el backend corriendo y las tablas creadas:

```bash
cd backend
npm run seed-from-firebase
```

Este script:
- Lee todas las colecciones de Firestore
- Las importa a PostgreSQL preservando IDs originales
- Es seguro ejecutarlo múltiples veces (usa ON CONFLICT DO NOTHING)

---

## PASO 5 - Despliegue en Digital Ocean

### Requerimientos en el servidor:
- Docker + Docker Compose instalados
- El dominio ya apunta al servidor (A record en DNS)
- Certbot instalado para SSL

### Obtener certificado SSL (primera vez):
```bash
# En el servidor, antes del deploy
sudo certbot certonly --standalone -d tudominio.com -d www.tudominio.com
```

### Configurar nginx.conf con tu dominio real:
Editar `SoftwareBalconeria/nginx.conf` y reemplazar `tudominio.com` con tu dominio real.

### Copiar archivos al servidor:
```bash
# Desde tu PC local
scp -r BalconeriaFaby/ root@IP_SERVIDOR:/opt/balconeria/
```

### En el servidor:
```bash
cd /opt/balconeria

# Crear archivo de variables de producción
cp .env.production.example .env.production
nano .env.production   # Editar con tus valores reales

# Copiar firebase-admin-key.json al servidor
# (scp backend/firebase-admin-key.json root@IP:/opt/balconeria/backend/)

# Desplegar
bash deploy.sh
```

---

## Arquitectura en producción

```
Internet
   │
   ▼
[nginx :443 HTTPS]
   │
   ├── /          → Vue.js SPA (archivos estáticos)
   └── /api/*     → proxy → [backend :3001]
                                  │
                                  ▼
                           [PostgreSQL :5432]
                           (solo interno, no expuesto)
```

**Login:** sigue usando Firebase Auth (email/password)
**Datos:** PostgreSQL local (ya no Firestore)
**Tokens:** el backend verifica cada request con Firebase Admin SDK

---

## Comandos útiles

```bash
# Ver logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f

# Ver logs solo del backend
docker compose -f docker-compose.prod.yml logs -f backend

# Reiniciar solo el backend
docker compose -f docker-compose.prod.yml restart backend

# Conectarse a PostgreSQL
docker compose exec postgres psql -U postgres -d balconeria_db

# Hacer backup de la base de datos
docker compose exec postgres pg_dump -U postgres balconeria_db > backup.sql
```
