import db from '../config/db.js'; // <- Nota el .js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Clave secreta para JWT
const JWT_SECRET = 'tu-clave-secreta-deberia-ser-muy-larga-y-segura';

const usuarioService = {
    // Crear nuevo usuario (Encriptando contraseña)
  crear: async (datos) => {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(datos.password, salt);

        // --- AQUÍ ESTABA EL ERROR: CAMBIAMOS EMAIL POR USERNAME ---
        const query = 'INSERT INTO usuarios (nombre, username, password, rol) VALUES (?, ?, ?, ?)';
        
        // Y AQUÍ TAMBIÉN PASAMOS datos.username
        const [result] = await db.execute(query, [datos.nombre, datos.username, hashPassword, datos.rol]);
        
        return result.insertId;
    },

    // Listar todos (sin mostrar la contraseña por seguridad)
    listar: async () => {
        const query = 'SELECT id, nombre, username, rol, creado_en FROM usuarios ORDER BY id DESC';
        const [rows] = await db.execute(query);
        return rows;
    },

    // Eliminar usuario
    eliminar: async (id) => {
        const query = 'DELETE FROM usuarios WHERE id = ?';
        const [result] = await db.execute(query, [id]);
        return result;
    },
    /**
     * R-4.2: Registra un nuevo usuario (Admin o Cajero)
     */
    registrar: async (nombre, username, password, rol) => {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        try {
            const [result] = await db.execute(
                'INSERT INTO usuarios (nombre, username, password, rol) VALUES (?, ?, ?, ?)',
                [nombre, username, passwordHash, rol]
            );
            return { id: result.insertId, username, rol };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('El nombre de usuario ya existe');
            }
            throw error;
        }
    },

    /**
     * R-4.1: Proceso de Login
     */
    login: async (username, password) => {
        const [rows] = await db.execute('SELECT * FROM usuarios WHERE username = ?', [username]);
        if (rows.length === 0) {
            throw new Error('Credenciales inválidas');
        }

        const usuario = rows[0];
        const esMatch = await bcrypt.compare(password, usuario.password);
        if (!esMatch) {
            throw new Error('Credenciales inválidas');
        }

        const payload = {
            id: usuario.id,
            rol: usuario.rol
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        return {
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        };
    }
};

export default usuarioService; // Usamos "export default"