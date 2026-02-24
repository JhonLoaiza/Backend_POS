import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verificar si Cloudinary está configurado
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

let upload;

if (isCloudinaryConfigured()) {
  // Usar Cloudinary si está configurado
  console.log('✅ Cloudinary configurado - usando almacenamiento en la nube');
  
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
      format: 'auto',
      quality: 'auto',
      transformation: [{ width: 800, crop: "limit" }]
    }
  });

  upload = multer({ storage: storage });
} else {
  // Usar almacenamiento local como fallback
  console.log('⚠️  Cloudinary no configurado - usando almacenamiento local');
  console.log('   Para usar Cloudinary, configura las variables en .env:');
  console.log('   - CLOUDINARY_CLOUD_NAME');
  console.log('   - CLOUDINARY_API_KEY');
  console.log('   - CLOUDINARY_API_SECRET');
  
  const localStorage = multer.diskStorage({
    destination: function (_req, _file, cb) {
      const uploadPath = path.resolve('uploads/');
      cb(null, uploadPath);
    },
    filename: function (_req, file, cb) {
      const sanitizedName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
      cb(null, Date.now() + path.extname(sanitizedName));
    }
  });

  const fileFilter = (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo imágenes son permitidas'), false);
    }
  };

  upload = multer({ 
    storage: localStorage, 
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB límite
  });
}

export default upload;