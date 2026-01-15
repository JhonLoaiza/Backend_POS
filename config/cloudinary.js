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

// 2. Configuración del almacenamiento
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'tienda_pos_productos', // Nombre de la carpeta en Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        // Opcional: transformar imagen a 500px de ancho automáticamente
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

// 3. Exportamos el middleware 'upload' listo para usar
const upload = multer({ storage: storage });

export default upload;