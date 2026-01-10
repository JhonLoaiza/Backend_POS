import express from 'express';
import cors from 'cors';
import './config/db.js'; 
import usuarioRoutes from './routes/usuario.routes.js';
import productoRoutes from './routes/producto.routes.js';
import ventaRoutes from './routes/venta.routes.js';
import reporteRoutes from './routes/reporte.routes.js';
import compraRoutes from './routes/compra.routes.js';
import gastoController from './controllers/gasto.controller.js';
import gastoRoutes from './routes/gasto.routes.js';
import authRoutes from './routes/auth.routes.js';


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- ESTA LÍNEA ES CRÍTICA ---
app.use('/uploads', express.static('uploads'));
// -----------------------------
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/compras', compraRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/auth', authRoutes);


app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});