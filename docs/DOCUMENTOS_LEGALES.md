# Documentos Legales - SmartPOS

## 📋 ¿Qué son y por qué son importantes?

Los documentos legales son **OBLIGATORIOS** para operar un SaaS de manera legal y profesional. Protegen tanto a tu negocio como a tus clientes.

---

## 📄 Documentos Implementados

### 1. Términos y Condiciones (`terminos.html`)

**¿Qué es?**
Es el contrato entre SmartPOS y los clientes. Define las reglas del juego.

**¿Qué incluye?**
- Descripción del servicio (qué ofreces)
- Responsabilidades del usuario (mantener credenciales seguras, no hacer cosas ilegales)
- Propiedad de los datos (los datos del cliente son suyos)
- Limitaciones de responsabilidad (qué pasa si algo sale mal)
- Precios y pagos (período beta gratis, luego de pago)
- Cancelación (cómo y cuándo se puede cancelar)
- Soporte técnico (qué incluye y qué no)

**¿Por qué es crítico?**
Sin términos y condiciones, podrías ser responsable por:
- Pérdida de datos del cliente
- Tiempo de inactividad del servicio
- Errores en cálculos o reportes
- Cualquier problema que ocurra

**Ejemplo real:**
Un cliente pierde datos porque no hizo backup. Sin términos, podría demandarte. Con términos que dicen "el cliente es responsable de sus backups", estás protegido.

---

### 2. Política de Privacidad (`privacidad.html`)

**¿Qué es?**
Documento que explica cómo manejas los datos personales de tus clientes.

**¿Qué incluye?**
- Qué datos recopilas (nombre, email, RUT, datos de ventas)
- Para qué los usas (brindar el servicio)
- Con quién los compartes (nadie, excepto proveedores de infraestructura)
- Cómo los proteges (encriptación, JWT, rate limiting)
- Derechos del usuario (acceso, corrección, eliminación)
- Cuánto tiempo los guardas (mientras usen el servicio + 30 días)

**¿Por qué es obligatorio?**
- **Ley chilena:** Ley N° 19.628 sobre Protección de la Vida Privada
- **Ley N° 21.096:** Derechos del Consumidor Digital
- **Confianza:** Los clientes quieren saber que sus datos están seguros

**Ejemplo real:**
Un cliente pregunta: "¿Qué hacen con los datos de mis ventas?". Con la política de privacidad, puedes responder: "Lee nuestra política en /legal/privacidad, ahí está todo explicado".

---

## 🌐 Cómo Acceder a los Documentos

Los documentos están disponibles públicamente (sin necesidad de login):

```
http://localhost:5000/legal/terminos
http://localhost:5000/legal/privacidad
```

En producción:
```
https://api.smartpos.cl/legal/terminos
https://api.smartpos.cl/legal/privacidad
```

---

## 🔧 Implementación Técnica

### Archivos Creados

```
Backend_Tienda/
├── public/
│   └── legal/
│       ├── terminos.html      # Términos y condiciones
│       └── privacidad.html    # Política de privacidad
├── routes/
│   └── legal.routes.js        # Rutas para servir los documentos
└── index.js                   # Registra las rutas /legal/*
```

### Rutas Implementadas

```javascript
// Backend_Tienda/routes/legal.routes.js
router.get('/terminos', (req, res) => {
  // Sirve terminos.html
});

router.get('/privacidad', (req, res) => {
  // Sirve privacidad.html
});
```

---

## 📝 Cómo Usar en el Frontend

### Opción 1: Links en el Footer

```jsx
<footer>
  <a href="http://localhost:5000/legal/terminos" target="_blank">
    Términos y Condiciones
  </a>
  {' | '}
  <a href="http://localhost:5000/legal/privacidad" target="_blank">
    Política de Privacidad
  </a>
</footer>
```

### Opción 2: Checkbox en Registro

```jsx
<label>
  <input type="checkbox" required />
  Acepto los{' '}
  <a href="http://localhost:5000/legal/terminos" target="_blank">
    Términos y Condiciones
  </a>
  {' y la '}
  <a href="http://localhost:5000/legal/privacidad" target="_blank">
    Política de Privacidad
  </a>
</label>
```

---

## ✏️ Personalización Necesaria

Antes de lanzar en producción, **DEBES** actualizar:

1. **Email de contacto:** Cambiar `soporte@smartpos.cl` por tu email real
2. **WhatsApp:** Cambiar `+56 9 XXXX XXXX` por tu número real
3. **Dominio:** Cambiar `smartpos.cl` por tu dominio real

---

## 🚨 Cláusulas Críticas Explicadas

### 1. Limitación de Responsabilidad

```
"SmartPOS no será responsable por pérdida de datos causada por: 
fallas técnicas, errores humanos, ataques cibernéticos..."
```

**¿Por qué?**
Si un cliente pierde datos y no tienes esta cláusula, podría demandarte por daños y perjuicios. Con esta cláusula, estás protegido legalmente.

### 2. Servicio "TAL CUAL"

```
"SmartPOS se proporciona 'TAL CUAL' sin garantías de ningún tipo"
```

**¿Por qué?**
No puedes garantizar que el software nunca tendrá bugs. Esta cláusula te protege de demandas por errores menores.

### 3. Responsabilidad Máxima Limitada

```
"Nuestra responsabilidad máxima está limitada al monto que hayas 
pagado por el servicio en los últimos 3 meses"
```

**¿Por qué?**
Si algo sale muy mal, tu responsabilidad financiera está limitada. Sin esto, podrías ser responsable por millones.

### 4. Propiedad de los Datos

```
"TUS DATOS SON TUYOS. Todos los datos que ingreses en SmartPOS 
son de tu propiedad"
```

**¿Por qué?**
Genera confianza. Los clientes necesitan saber que no vas a vender sus datos o usarlos para competir con ellos.

---

## 📊 Ejemplo de Uso Real

### Escenario 1: Cliente pregunta sobre privacidad

**Cliente:** "¿Qué hacen con los datos de mis ventas?"

**Tú:** "Todos tus datos son tuyos. Solo los almacenamos para brindarte el servicio. Nunca los vendemos ni compartimos. Puedes leer nuestra política completa aquí: https://api.smartpos.cl/legal/privacidad"

### Escenario 2: Cliente pierde datos

**Cliente:** "Perdí todos mis datos, ¡quiero que me los recuperen!"

**Tú:** "Lamento mucho lo ocurrido. Según nuestros términos y condiciones (sección 5), aunque hacemos backups regulares, no garantizamos recuperación de datos. Te recomendamos siempre exportar reportes importantes. ¿Puedo ayudarte a configurar un proceso de backup regular?"

### Escenario 3: Cliente quiere cancelar

**Cliente:** "Quiero cancelar mi cuenta"

**Tú:** "Sin problema. Según nuestros términos (sección 8), puedes cancelar en cualquier momento. ¿Quieres que te enviemos una exportación de tus datos antes de eliminar la cuenta?"

---

## ⚖️ Cumplimiento Legal en Chile

### Leyes Aplicables

1. **Ley N° 19.628** - Protección de la Vida Privada
2. **Ley N° 21.096** - Derechos del Consumidor Digital
3. **Código Civil** - Contratos

---

## ✅ Checklist de Implementación

- [x] Crear archivos HTML (terminos.html, privacidad.html)
- [x] Crear rutas en backend (legal.routes.js)
- [x] Registrar rutas en index.js
- [ ] Personalizar emails de contacto
- [ ] Personalizar números de WhatsApp
- [ ] Personalizar dominio
- [ ] Agregar links en footer del frontend
- [ ] Probar que los documentos cargan correctamente

---

**Última actualización:** 15 de febrero de 2026
