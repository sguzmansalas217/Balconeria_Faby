#!/bin/bash
# Script de despliegue en Digital Ocean
# Ejecutar en el servidor: bash deploy.sh
set -e

echo "================================================="
echo "  Despliegue BalconeriaFaby → Digital Ocean"
echo "================================================="

# 1. Cargar variables de entorno de producción
if [ ! -f .env.production ]; then
  echo "❌ ERROR: Falta el archivo .env.production"
  echo "   Copia .env.production.example a .env.production y edítalo"
  exit 1
fi
export $(grep -v '^#' .env.production | xargs)

# 2. Verificar que existe el archivo Firebase Admin Key
if [ ! -f backend/firebase-admin-key.json ]; then
  echo "❌ ERROR: Falta backend/firebase-admin-key.json"
  echo "   Descárgalo desde Firebase Console > Configuración > Cuentas de servicio"
  exit 1
fi

echo ""
echo "📦 Construyendo imágenes Docker..."
docker compose -f docker-compose.prod.yml --env-file .env.production build

echo ""
echo "🗄️  Iniciando PostgreSQL..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d postgres

echo ""
echo "⏳ Esperando que PostgreSQL esté listo..."
sleep 5

echo ""
echo "🔧 Creando tablas en PostgreSQL..."
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend node src/db/migrate.js

echo ""
echo "🚀 Iniciando todos los servicios..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

echo ""
echo "✅ Despliegue completado!"
echo "   Frontend: https://$DOMAIN"
echo "   Backend:  http://backend:3001 (interno)"
echo ""
echo "   Para ver logs:  docker compose -f docker-compose.prod.yml logs -f"
echo "   Para detener:   docker compose -f docker-compose.prod.yml down"
