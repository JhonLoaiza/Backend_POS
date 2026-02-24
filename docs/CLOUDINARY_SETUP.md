# Configuración de Cloudinary para SmartPOS

## Resumen

SmartPOS puede usar dos métodos para almacenar imágenes de productos:

1. **Almacenamiento Local** (por defecto) - Las imágenes se guardan en `Backend_Tienda/uploads/`
2. **Cloudinary** (opcional) - Las imágenes se suben a la nube de Cloudinary

## Estado Actual

✅ **Almacenamiento local configurado y funcionando**

El sistema actualmente usa almacenamiento local porque las credenciales de Cloudinary no están configuradas. Esto es perfecto para desarrollo y pruebas locales.

---

## ¿Por qué usar Cloudinary?

### Ventajas
- ✅ Optimización automática de imágenes (reduce tamaño sin perder calidad)
- ✅ CDN global (carga rápida desde cualquier ubicación)
- ✅ Transformaciones on-the-fly (redimensionar, recortar, etc.)
- ✅ No consume espacio en tu servidor
- ✅ Backups automáticos

### Desventajas
- ❌ Requiere cuenta (gratis hasta 25GB/mes)
- ❌ Dependencia de servicio externo
- ❌ Requiere conexión a internet

---

## Cuándo Configurar Cloudinary

**Para desarrollo local:** No es necesario, usa almacenamiento local.

**Para producción:** Recomendado configurar Cloudinary antes del deploy.

---

## Cómo Configurar Cloudinary

### Paso 1: Crear Cuenta Gratuita

1. Ve a https://cloudinary.com/users/register/free
2. Completa el registro
3. Verifica tu email

### Paso 2: Obtener Credenciales

1. Inicia sesión en Cloudinary
2. Ve al Dashboard
3. Encontrarás tus credenciales en la sección "Account Details":
   - **Cloud Name** (ej: `dxyz123abc`)
   - **API Key** (ej: `123456789012345`)
   - **API Secret** (ej: `abcdefghijklmnopqrstuvwxyz123`)

### Paso 3: Configurar Variables de Entorno

Edita tu archivo `.env` y agrega las credenciales:

```bash
# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui
```

### Paso 4: Reiniciar Servidor

```bash
# Detener el servidor (Ctrl+C)
# Iniciar de nuevo
node index.js
```

Deberías ver este mensaje:
```
✅ Cloudinary configurado - usando almacenamiento en la nube
```

---

## Verificar Configuración

### Almacenamiento Local (actual)
```
⚠️  Cloudinary no configurado - usando almacenamiento local
   Para usar Cloudinary, configura las variables en .env:
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
```

### Cloudinary Configurado
```
✅ Cloudinary configurado - usando almacenamiento en la nube
```

---

## Migrar Imágenes Existentes

Si ya tienes imágenes en `uploads/` y quieres migrarlas a Cloudinary:

### Opción 1: Manual
1. Sube las imágenes manualmente desde el dashboard de Cloudinary
2. Actualiza las URLs en la base de datos

### Opción 2: Script (futuro)
Crear un script de migración que:
1. Lea todas las imágenes de `uploads/`
2. Las suba a Cloudinary
3. Actualice las URLs en la base de datos

---

## Límites del Plan Gratuito

Cloudinary ofrece un plan gratuito generoso:

- ✅ 25 GB de almacenamiento
- ✅ 25 GB de ancho de banda/mes
- ✅ 25,000 transformaciones/mes
- ✅ Todas las funciones básicas

Para SmartPOS con 3-5 clientes beta, esto es más que suficiente.

---

## Optimizaciones Configuradas

Cuando uses Cloudinary, SmartPOS aplica estas optimizaciones automáticamente:

1. **Formato automático** - Convierte a WebP cuando el navegador lo soporta
2. **Calidad automática** - Reduce calidad sin que se note visualmente
3. **Redimensionamiento** - Limita ancho máximo a 800px (suficiente para productos)

Esto ahorra créditos y mejora la velocidad de carga.

---

## Troubleshooting

### Error: "Must supply api_key"

**Causa:** Cloudinary no está configurado correctamente.

**Solución:** 
1. Verifica que las 3 variables estén en `.env`
2. Verifica que no tengan espacios extra
3. Reinicia el servidor

### Las imágenes no se ven después de configurar Cloudinary

**Causa:** Las URLs antiguas apuntan a `localhost/uploads/`

**Solución:**
- Las nuevas imágenes usarán Cloudinary automáticamente
- Las imágenes antiguas seguirán funcionando desde `uploads/`

---

## Para Producción (Railway)

Cuando hagas deploy en Railway:

1. Ve a tu proyecto en Railway
2. Selecciona el servicio del backend
3. Ve a "Variables"
4. Agrega las 3 variables de Cloudinary
5. Railway reiniciará automáticamente

---

## Conclusión

**Para ahora:** Sigue usando almacenamiento local, funciona perfectamente.

**Para producción:** Configura Cloudinary antes del deploy siguiendo esta guía.

---

**Última actualización:** 2025-01-26  
**Versión:** 1.0.0
