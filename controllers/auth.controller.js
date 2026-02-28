import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const authController = {
    login: async (req, res) => {
        try {
            // 1. Recibimos usuario y contraseña
            const { username, password } = req.body;

            // 2. Buscamos al usuario en la base de datos
            const [users] = await db.execute('SELECT * FROM usuarios WHERE username = ?', [username]);
            
            if (users.length === 0) {
                return res.status(401).json({ message: "Usuario no encontrado" });
            }

            const usuario = users[0];

            // 3. Comparamos la contraseña (encriptada vs texto plano)
            const passwordEsCorrecta = await bcrypt.compare(password, usuario.password);

            if (!passwordEsCorrecta) {
                return res.status(401).json({ message: "Contraseña incorrecta" });
            }

            // 4. Generamos el Token
            const token = jwt.sign(
                { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre }, 
                process.env.JWT_SECRET || 'PALABRA_SECRETA_SUPER_SEGURA', 
                { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
            );

            // 5. RESPONDEMOS AL FRONTEND (¡Aquí estaba el problema!)
            res.json({
                message: "Bienvenido",
                token: token,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    username: usuario.username,
                    rol: usuario.rol // <--- ¡ESTO ES LO QUE TE FALTABA!
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error en el servidor" });
        }
    }
    register: async (req, res) => {
        try {
            const { nombre, username, password, rol } = req.body;

            // Validar campos requeridos
            if (!nombre || !username || !password || !rol) {
                return res.status(400).json({
                    message: "Todos los campos son requeridos (nombre, username, password, rol)"
                });
            }

            // Validar que el rol sea válido
            if (!['admin', 'cajero'].includes(rol)) {
                return res.status(400).json({
                    message: "El rol debe ser 'admin' o 'cajero'"
                });
            }

            // Verificar que el username no exista
            const [existingUsers] = await db.execute(
                'SELECT id FROM usuarios WHERE username = ?',
                [username]
            );

            if (existingUsers.length > 0) {
                return res.status(409).json({
                    message: "El nombre de usuario ya existe"
                });
            }

            // Encriptar password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insertar usuario en la base de datos
            const [result] = await db.execute(
                'INSERT INTO usuarios (nombre, username, password, rol, activo) VALUES (?, ?, ?, ?, 1)',
                [nombre, username, hashedPassword, rol]
            );

            // Obtener el usuario creado
            const [newUser] = await db.execute(
                'SELECT id, nombre, username, rol, activo FROM usuarios WHERE id = ?',
                [result.insertId]
            );

            res.status(201).json({
                message: "Usuario creado exitosamente",
                usuario: newUser[0]
            });

        } catch (error) {
            console.error('Error al registrar usuario:', error);
            res.status(500).json({ message: "Error en el servidor" });
        }
    },

    register: async (req, res) => {
        try {
            const { nombre, username, password, rol } = req.body;

            // Validar campos requeridos
            if (!nombre || !username || !password || !rol) {
                return res.status(400).json({ 
                    message: "Todos los campos son requeridos (nombre, username, password, rol)" 
                });
            }

            // Validar que el rol sea válido
            if (!['admin', 'cajero'].includes(rol)) {
                return res.status(400).json({ 
                    message: "El rol debe ser 'admin' o 'cajero'" 
                });
            }

            // Verificar que el username no exista
            const [existingUsers] = await db.execute(
                'SELECT id FROM usuarios WHERE username = ?', 
                [username]
            );

            if (existingUsers.length > 0) {
                return res.status(409).json({ 
                    message: "El nombre de usuario ya existe" 
                });
            }

            // Encriptar password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insertar usuario en la base de datos
            const [result] = await db.execute(
                'INSERT INTO usuarios (nombre, username, password, rol, activo) VALUES (?, ?, ?, ?, 1)',
                [nombre, username, hashedPassword, rol]
            );

            // Obtener el usuario creado
            const [newUser] = await db.execute(
                'SELECT id, nombre, username, rol, activo FROM usuarios WHERE id = ?',
                [result.insertId]
            );

            res.status(201).json({
                message: "Usuario creado exitosamente",
                usuario: newUser[0]
            });

        } catch (error) {
            console.error('Error al registrar usuario:', error);
            res.status(500).json({ message: "Error en el servidor" });
        }
    }
};

export default authController;