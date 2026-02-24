import express from 'express';
import cors from 'cors';
import './config/db.js';
import { validateEnv } from './config/env.config.js';
import { getCorsOptions } from './config/cors.config.js';
import usuarioRoutes from './routes/usuario.routes.js';
import productoRoutes from './routes/producto.routes.js';
import ventaRoutes from './routes/venta.routes.js';
import reporteRoutes from './routes/reporte.routes.js';
import compraRoutes from './routes/compra.routes.js';
import gastoRoutes from './routes/gasto.routes.js';
import authRoutes from './routes/auth.routes.js';
import legalRoutes from './routes/legal.routes.js';
import healthRoutes from './routes/health.routes.js';
import mermaRoutes from './routes/merma.routes.js';
import cierreCajaRoutes from './routes/cierreCaja.routes.js';
import rateLimiter from './middleware/rateLimiter.middleware.js';

// Validar variables de entorno al inicio
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar CORS con opciones de producción
const corsOptions = getCorsOptions();

app.use(cors(corsOptions));
app.use(express.json());

// Aplicar rate limiting a todas las rutas
// Límite: 100 requests por IP cada 15 minutos
app.use(rateLimiter);

// --- ESTA LÍNEA ES CRÍTICA ---
app.use('/uploads', express.static('uploads'));
// -----------------------------

// Health check (antes de otras rutas para monitoreo)
app.use('/', healthRoutes);

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/compras', compraRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/mermas', mermaRoutes);
app.use('/api/cierres-caja', cierreCajaRoutes);
app.use('/legal', legalRoutes);


app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});