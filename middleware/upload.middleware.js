import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.resolve(__dirname, '../uploads/');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Sanitizar el nombre del archivo para prevenir path traversal
        const sanitizedName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, Date.now() + path.extname(sanitizedName));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo imágenes son permitidas'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

export default upload;