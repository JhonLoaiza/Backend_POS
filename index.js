import express from 'express';
import cors from 'cors';
import './config/db.js'; // Conexión a base de datos 
import usuarioRoutes from './routes/usuario.routes.js';
import productoRoutes from './routes/producto.routes.js';
import ventaRoutes from './routes/venta.routes.js';
import reporteRoutes from './routes/reporte.routes.js';
import compraRoutes from './routes/compra.routes.js';
import gastoController from './controllers/gasto.controller.js';
import gastoRoutes from './routes/gasto.routes.js';
import authRoutes from './routes/auth.routes.js';
import cierreCajaRoutes from './routes/cierreCaja.routes.js';
import mermaRoutes from './routes/merma.routes.js';


const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de CORS
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            process.env.FRONTEND_URL,
            'https://sistema-pos-frontend.vercel.app',
            'https://sistema-smartpos-git-develop-jhon-loaizas-projects.vercel.app'
        ].filter(Boolean); // Eliminar valores undefined
        
        // Permitir requests sin origin (como Postman, curl, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS bloqueado para origen:', origin);
            callback(null, true); // En desarrollo, permitir todos
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Manejar preflight requests explícitamente
app.options('*', cors(corsOptions));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        routes: {
            auth: '/api/auth/login',
            productos: '/api/productos',
            ventas: '/api/ventas'
        }
    });
});

// --- ESTA LÍNEA ES CRÍTICA ---
app.use('/uploads', express.static('uploads'));
// -----------------------------
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/compras', compraRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cierres-caja', cierreCajaRoutes);
app.use('/api/mermas', mermaRoutes);


app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});