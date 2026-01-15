import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Configuración con tus credenciales
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'tienda_pos_productos',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        
        // --- AQUÍ ESTÁ EL TRUCO PARA AHORRAR CRÉDITOS ---
        
        // 1. Convertir a formato ligero automáticamente (ej: WebP)
        format: 'auto', 
        
        // 2. Ajustar calidad automáticamente (reduce peso sin que se note)
        quality: 'auto',

        // 3. Redimensionar si es muy grande (nadie necesita una foto 4K para un icono de 50px)
        // Reducimos a un ancho máximo de 800px (suficiente para ver detalles)
        transformation: [{ width: 800, crop: "limit" }]
    }
});

// 3. Exportamos el middleware 'upload' listo para usar
const upload = multer({ storage: storage });

export default upload;