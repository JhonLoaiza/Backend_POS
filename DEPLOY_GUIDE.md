# 🚀 Guía de Deploy - SmartPOS Backend

## Requisitos Previos

- [ ] Cuenta en TiDB Cloud (base de datos)
- [ ] Cuenta en Render.com (backend)
- [ ] Cuenta en Cloudinary (imágenes)
- [ ] Repositorio Git (GitHub/GitLab)

---

## PASO 1: Configurar Base de Datos en TiDB

### 1.1 Crear Cluster en TiDB Cloud

1. Ve a https://tidbcloud.com
2. Crea un nuevo cluster (plan gratuito disponible)
3. Selecciona región: **US West (Oregon)** (más cercano a Render)
4. Espera 5-10 minutos a que se cree

### 1.2 Obtener Credenciales de Conexión

En el dashboard de TiDB, copia:
```
Host: gateway01.us-west-2.prod.aws.tidbcloud.com
Port: 4000
User: tu_usuario
Password: tu_password
Database: smartpos_prod
```

### 1.3 Crear la Base de Datos

Conéctate a TiDB y ejecuta:

```sql
CREATE DATABASE IF NOT EXISTS smartpos_prod;
USE smartpos_prod;
```

### 1.4 Ejecutar Migraciones

Copia y ejecuta el contenido de estos archivos en orden:

1. `migrations/001_create_mermas_table.sql`
2. `migrations/004_create_cierres_caja_table.sql`
3. Todas las demás tablas necesarias

**Tablas principales:**
- usuarios
- productos
- ventas
- detalles_venta
- compras
- gastos
- mermas
- cierres_caja

---

## PASO 2: Configurar Cloudinary

### 2.1 Crear Cuenta

1. Ve a https://cloudinary.com
2. Regístrate (plan gratuito: 25GB storage)
3. Ve al Dashboard

### 2.2 Obtener Credenciales

Copia estos valores:
```
Cloud Name: tu_cloud_name
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz
```

---

## PASO 3: Generar JWT Secret

Ejecuta este comando en tu terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado (64 caracteres). Ejemplo:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

## PASO 4: Deploy en Render

### 4.1 Preparar Repositorio Git

```bash
cd Backend_Tienda
git init
git add .
git commit -m "Initial commit - SmartPOS Backend"
git remote add origin https://github.com/tu-usuario/smartpos-backend.git
git push -u origin main
```

### 4.2 Crear Web Service en Render

1. Ve a https://render.com
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name:** smartpos-backend
   - **Region:** Oregon (USA West)
   - **Branch:** main
   - **Root Directory:** Backend_Tienda
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

### 4.3 Configurar Variables de Entorno

En Render, ve a "Environment" y agrega:

```
NODE_ENV=production
PORT=5000

DB_HOST=gateway01.us-west-2.prod.aws.tidbcloud.com
DB_USER=tu_usuario_tidb
DB_PASSWORD=tu_password_tidb
DB_NAME=smartpos_prod
DB_PORT=4000

JWT_SECRET=tu_jwt_secret_generado_64_caracteres
JWT_EXPIRES_IN=8h

CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

FRONTEND_URL=https://tu-frontend.vercel.app
```

### 4.4 Deploy

1. Click en "Create Web Service"
2. Espera 5-10 minutos
3. Tu backend estará en: `https://smartpos-backend.onrender.com`

---

## PASO 5: Verificar Deployment

### 5.1 Health Check

Abre en tu navegador:
```
https://smartpos-backend.onrender.com/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2026-02-23T..."
}
```

### 5.2 Probar Conexión a BD

Revisa los logs en Render. Deberías ver:
```
✅ Conectado a la Base de Datos
Servidor corriendo en el puerto 5000
```

### 5.3 Probar Endpoint de Login

```bash
curl -X POST https://smartpos-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

---

## PASO 6: Crear Usuario Admin Inicial

Conéctate a TiDB y ejecuta:

```sql
USE smartpos_prod;

-- Insertar usuario admin (password: admin123)
INSERT INTO usuarios (nombre, email, password, rol, activo) 
VALUES (
  'Administrador',
  'admin@tuempresa.com',
  '$2a$10$rH8qXKzVQEjKZJ5YvZvZxOxKxKxKxKxKxKxKxKxKxKxKxKxKxKxKx',
  'admin',
  1
);
```

**IMPORTANTE:** Cambia la contraseña después del primer login.

---

## PASO 7: Configurar CORS

El backend ya está configurado para aceptar requests desde tu frontend.

Verifica en `Backend_Tienda/config/cors.config.js` que `FRONTEND_URL` esté correcta.

---

## PASO 8: Monitoreo y Logs

### Ver Logs en Tiempo Real

En Render dashboard:
1. Ve a tu servicio
2. Click en "Logs"
3. Verás todos los logs en tiempo real

### Configurar Alertas

En Render:
1. Settings → Notifications
2. Agrega tu email
3. Activa alertas de:
   - Deploy failed
   - Service down
   - High memory usage

---

## PASO 9: Backup de Base de Datos

### Backup Manual

En TiDB Cloud:
1. Ve a tu cluster
2. Click en "Backup"
3. "Create Backup"

### Backup Automático

TiDB Cloud hace backups automáticos diarios en el plan gratuito.

---

## PASO 10: Actualizar Frontend

En tu frontend, actualiza la URL del API:

```javascript
// frontend/src/config/api.config.js
export const API_BASE_URL = 'https://smartpos-backend.onrender.com/api';
```

---

## 🔒 Checklist de Seguridad

Antes de lanzar a producción:

- [ ] JWT_SECRET es único y de 64 caracteres
- [ ] Contraseñas de BD son fuertes
- [ ] NODE_ENV=production está configurado
- [ ] Rate limiting está activo
- [ ] CORS está configurado correctamente
- [ ] Cloudinary está configurado (no usar uploads locales)
- [ ] Backups automáticos están activos
- [ ] Logs están funcionando
- [ ] Health check responde correctamente

---

## 🐛 Troubleshooting

### Error: Cannot connect to database

**Solución:**
1. Verifica que TiDB cluster esté activo
2. Revisa credenciales en variables de entorno
3. Verifica que el puerto sea 4000
4. Chequea que la IP de Render esté permitida en TiDB

### Error: JWT_SECRET too short

**Solución:**
1. Genera un nuevo secret con el comando
2. Debe tener exactamente 64 caracteres
3. Actualiza en variables de entorno de Render

### Error: CORS blocked

**Solución:**
1. Verifica FRONTEND_URL en variables de entorno
2. Debe incluir https:// y sin slash final
3. Redeploy el backend

### Service keeps crashing

**Solución:**
1. Revisa logs en Render
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate que el puerto sea 5000
4. Verifica que npm start funcione localmente

---

## 📊 Costos Estimados

### Plan Gratuito (Recomendado para empezar)

- **TiDB Cloud:** Gratis (5GB storage, 1 cluster)
- **Render:** Gratis (750 horas/mes, duerme después de 15 min inactividad)
- **Cloudinary:** Gratis (25GB storage, 25GB bandwidth)

**Total:** $0/mes

### Plan Pagado (Para producción seria)

- **TiDB Cloud:** $0.02/hora (~$15/mes)
- **Render:** $7/mes (siempre activo, más recursos)
- **Cloudinary:** $0/mes (plan gratuito suficiente)

**Total:** ~$22/mes

---

## 🚀 Próximos Pasos

1. [ ] Deploy del frontend en Vercel
2. [ ] Configurar dominio personalizado
3. [ ] Configurar SSL (automático en Render)
4. [ ] Integrar Sentry para monitoreo de errores
5. [ ] Configurar CI/CD con GitHub Actions

---

**Última actualización:** 2026-02-23
**Versión:** 1.0.0
