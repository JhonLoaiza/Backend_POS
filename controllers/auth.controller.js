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
                'PALABRA_SECRETA_SUPER_SEGURA', 
                { expiresIn: '8h' }
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
};

export default authController;