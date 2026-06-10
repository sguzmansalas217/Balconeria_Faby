# Despliegue en Digital Ocean

## Datos del servidor
- **IP:** 165.232.59.88
- **Dominio:** www.maguzsa.com / sistema.maguzsa.com
- **Acceso:** Consola web de Digital Ocean (puerto 22 bloqueado en red corporativa)
- **Código en servidor:** `/opt/balconeria/`
- **Repositorio GitHub:** https://github.com/sguzmansalas217/Balconeria_Faby

---

## 1. Subir cambios locales a GitHub

Desde PowerShell en `C:\MES\VUEJS\BalconeriaFaby`:

```powershell
git add .
git commit -m "descripcion del cambio"
git push origin main
```

---

## 2. Aplicar cambios en el servidor

Entrar a la consola: **cloud.digitalocean.com → Droplets → balconeriafaby → Console**

```bash
cd /opt/balconeria
git pull origin main
```

### Solo backend cambió (rutas, lógica, etc.)
```bash
docker compose -f docker-compose.prod.yml up -d --build backend
```

### Solo frontend cambió (vistas Vue, estilos, etc.)
```bash
docker compose -f docker-compose.prod.yml up -d --build frontend
```

### Ambos cambiaron
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 3. Ejecutar migraciones nuevas de base de datos

Solo cuando se agreguen nuevas tablas o columnas:

```bash
docker exec balconeria_backend node src/db/migrate_costos.js
docker exec balconeria_backend node src/db/migrate_asistencias.js
```

---

## 4. Ver estado de los contenedores

```bash
docker ps
```

Deben aparecer los 3 contenedores en estado **Up**:
- `balconeria_db` — PostgreSQL (healthy)
- `balconeria_backend` — Node.js API (puerto 3001)
- `balconeria_frontend` — Nginx + Vue (puertos 80 y 443)

---

## 5. Ver logs si algo falla

```bash
docker logs balconeria_frontend
docker logs balconeria_backend
docker logs balconeria_db
```

---

## 6. Reiniciar un contenedor

```bash
docker restart balconeria_backend
docker restart balconeria_frontend
```

---

## 7. Renovar certificado SSL

El certificado vence el **2026-09-08** y se renueva automáticamente. Si hay que renovarlo manualmente:

```bash
docker stop balconeria_frontend
certbot certonly --standalone -d maguzsa.com -d www.maguzsa.com -d sistema.maguzsa.com --expand
docker start balconeria_frontend
docker exec balconeria_frontend nginx -s reload
```

---

## 8. Variables de entorno (.env)

El archivo `.env` está en `/opt/balconeria/.env` y `/opt/balconeria/backend/.env`.  
**No está en GitHub** (ignorado por .gitignore).

Si se pierde, las variables necesarias son:
```
DB_HOST=postgres
DB_PORT=5432
DB_NAME=balconeria_db
DB_USER=postgres
DB_PASSWORD=Dany170293
PORT=3001
JWT_SECRET=GUSS930217HASZLR08
NODE_ENV=production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=sguzmansalas217@gmail.com
EMAIL_PASS=tcqznisaunraxhpa
EMAIL_DESTINO=herreriaguzsa@outlook.es
ANTHROPIC_API_KEY=ver_en_servidor_en_/opt/balconeria/.env
ALLOWED_ORIGINS=https://www.maguzsa.com
VITE_API_URL=https://www.maguzsa.com
```

---

## 9. Problemas comunes

| Problema | Causa | Solución |
|---|---|---|
| Puerto 80 ocupado | nginx nativo del servidor corriendo | `systemctl stop nginx && systemctl disable nginx` |
| DB unhealthy | health check mal configurado | `sed -i 's/pg_isready -U \${DB_USER}/pg_isready -U postgres/' docker-compose.prod.yml` |
| SSL "Not secure" | caché del navegador | `Ctrl+Shift+R` o abrir en incógnito |
| Frontend no arranca | certificado no encontrado | Verificar que `/etc/letsencrypt` esté montado en el compose |
| Variables no cargadas | .env no copiado al directorio raíz | `cp backend/.env .env` |
