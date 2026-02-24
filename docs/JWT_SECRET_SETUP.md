# Configuración de JWT_SECRET

## ¿Qué es JWT_SECRET?

JWT_SECRET es la clave secreta utilizada para firmar y verificar tokens de autenticación JWT (JSON Web Tokens). Es **CRÍTICO** para la seguridad del sistema.

## ¿Por qué 256 bits?

- **Seguridad**: 256 bits (64 caracteres hex) proporciona seguridad criptográfica robusta
- **Estándar**: Es el mínimo recomendado por OWASP y estándares de seguridad
- **Protección**: Hace prácticamente imposible ataques de fuerza bruta

## Cómo Generar un JWT_SECRET

### Opción 1: Usando Node.js (Recomendado)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Esto generará algo como:
```
a7f3d8e2b9c4f1a6e8d3b7c2f9a4e1d8c6b3f7a2e9d4c1b8f6a3e7d2c9b4f1a6
```

### Opción 2: Usando el módulo jwt.config.js

```javascript
import { generateJWTSecret } from './config/jwt.config.js';

console.log(generateJWTSecret());
```

### Opción 3: Online (Solo para desarrollo, NO para producción)

Puedes usar generadores online, pero **NUNCA** uses estos secrets en producción.

## Configuración

### 1. Desarrollo Local

1. Copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Genera un JWT_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. Copia el resultado y reemplaza el valor en `.env`:
   ```bash
   JWT_SECRET=tu_secret_generado_aqui
   ```

### 2. Producción (Railway)

1. Ve a tu proyecto en Railway
2. Selecciona el servicio del backend
3. Ve a la pestaña "Variables"
4. Agrega una nueva variable:
   - **Nombre**: `JWT_SECRET`
   - **Valor**: El secret generado (64 caracteres)
5. Guarda y redeploy

## Validación

El sistema valida automáticamente el JWT_SECRET al iniciar:

- ✅ Si el secret es válido (≥64 caracteres), el servidor inicia normalmente
- ❌ Si el secret falta o es muy corto, el servidor falla con error claro

### Ejemplo de error:

```
Error: JWT_SECRET debe tener al menos 256 bits (64 caracteres).
Longitud actual: 32 caracteres.
Genera uno nuevo con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Seguridad

### ✅ HACER:
- Generar un secret único para cada entorno (dev, staging, prod)
- Usar al menos 256 bits (64 caracteres hex)
- Guardar el secret en variables de entorno
- Rotar el secret periódicamente (cada 6-12 meses)
- Usar secrets diferentes para desarrollo y producción

### ❌ NO HACER:
- Hardcodear el secret en el código
- Commitear el secret a Git
- Compartir el secret por email o chat
- Usar el mismo secret en múltiples proyectos
- Usar secrets cortos o predecibles

## Rotación de JWT_SECRET

Si necesitas cambiar el JWT_SECRET (por seguridad o compromiso):

1. Genera un nuevo secret
2. Actualiza la variable de entorno
3. Redeploy el backend
4. **IMPORTANTE**: Todos los usuarios deberán hacer login nuevamente

## Troubleshooting

### Error: "JWT_SECRET no está configurado"

**Solución**: Agrega JWT_SECRET a tu archivo `.env` o variables de entorno de Railway.

### Error: "JWT_SECRET debe tener al menos 256 bits"

**Solución**: Tu secret es muy corto. Genera uno nuevo con el comando recomendado.

### Los usuarios no pueden hacer login después de cambiar el secret

**Esperado**: Esto es normal. Todos los tokens anteriores se invalidan cuando cambias el secret. Los usuarios deben hacer login nuevamente.

## Referencias

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)

---

**Última actualización**: 15 de febrero de 2026
