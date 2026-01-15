import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'tu-clave-secreta-deberia-ser-muy-larga-y-segura';

const usuarioService = {

    // 1. LISTAR (Solo usuarios activos)
    listar: async () => {
        const query = 'SELECT id, nombre, username, rol, creado_en FROM usuarios WHERE activo = 1 ORDER BY id DESC';
        const [rows] = await db.execute(query);
        return rows;
    },

    // 2. CREAR (Usado por usuarioController.crear)
    crear: async (datos) => {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(datos.password, salt);
        
        const query = 'INSERT INTO usuarios (nombre, username, password, rol) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(query, [datos.nombre, datos.username, hashPassword, datos.rol]);
        
        return result.insertId;
    },

    // 3. ELIMINAR / BAJA LÓGICA (Corregido)
    eliminar: async (id) => {
        // NOTA: Aquí NO usamos req ni res. Solo recibimos el ID.
        // Usamos 'db.execute' en lugar de 'pool.query' para ser consistentes.
        const sql = "UPDATE usuarios SET activo = 0 WHERE id = ?";
        const [result] = await db.execute(sql, [id]);
        
        // Devolvemos el objeto result para que el controlador sepa si afectó a alguna fila
        return result; 
    },

    // 4. REGISTRAR (Parecido a crear, usado por handleRegistro)
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

    // 5. LOGIN (Con seguridad extra)
    login: async (username, password) => {
        // AGREGADO: 'AND activo = 1'. Si el usuario fue borrado, no debe poder entrar.
        const [rows] = await db.execute('SELECT * FROM usuarios WHERE username = ? AND activo = 1', [username]);
        
        if (rows.length === 0) {
            throw new Error('Credenciales inválidas');
        }

        const usuario = rows[0];
        const esMatch = await bcrypt.compare(password, usuario.password);
        
        if (!esMatch) {
            throw new Error('Credenciales inválidas');
        }

        const payload = { id: usuario.id, rol: usuario.rol };
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

export default usuarioService;