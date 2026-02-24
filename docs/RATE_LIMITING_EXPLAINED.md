# 🛡️ Rate Limiting - Explicación

## ¿Qué es?
Límite de requests HTTP por IP. Como un guardia que cuenta entradas.

## Configuración
- Ventana: 15 minutos
- Máximo: 100 requests por IP
- Almacenamiento: Memoria

## Ejemplos

### Usuario Normal ✅
```
15 minutos: 20 requests
Resultado: TODO FUNCIONA (20 < 100)
```

### Ataque ❌
```
1 segundo: 101 requests
Resultado: Request 101+ BLOQUEADO
```

## Cómo Aplicarlo

```javascript
// Backend_Tienda/index.js
const rateLimiter = require('./middleware/rateLimiter.middleware');
app.use(rateLimiter); // Antes de las rutas
```

## Respuesta al Exceder

```json
HTTP 429 Too Many Requests
{
  "error": "Demasiadas peticiones",
  "intentaEn": "2025-01-26T15:30:00Z"
}
```
