import usuarioService from '../services/usuario.service.js';

const usuarioController = {
    
    // --- CREAR USUARIO ---
    crear: async (req, res) => {
        try {
            console.log("Recibido:", req.body);
            const { nombre, username, password, rol } = req.body;
            
            if (!nombre || !username || !password || !rol) {
                return res.status(400).json({ message: "Faltan datos" });
            }

            const nuevoId = await usuarioService.crear({ nombre, username, password, rol });
            res.status(201).json({ message: "Usuario creado exitosamente", id: nuevoId });

        } catch (error) {
            console.error(error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "El username ya existe" });
            }
            res.status(500).json({ message: "Error interno" });
        }
    },

    // --- LISTAR USUARIOS ---
    listar: async (req, res) => {
        try {
            const usuarios = await usuarioService.listar();
            res.json(usuarios);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener usuarios" });
        }
    },

    // --- ELIMINAR USUARIO (Baja Lógica) ---
    eliminar: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Llamamos al servicio. Ahora sí devuelve el objeto 'result' correctamente.
            const result = await usuarioService.eliminar(id);

            // Verificamos si realmente se actualizó algo
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            // 204: Éxito sin contenido
            return res.sendStatus(204);
            
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },
    
    // --- HANDLERS ADICIONALES (Login/Registro) ---
    handleRegistro: async (req, res) => {
        try {
            const { nombre, username, password, rol } = req.body;
            if (!nombre || !username || !password || !rol) {
                return res.status(400).json({ message: 'Faltan campos requeridos' });
            }
            const nuevoUsuario = await usuarioService.registrar(nombre, username, password, rol);
            res.status(201).json({ message: 'Usuario registrado exitosamente', usuario: nuevoUsuario });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    handleLogin: async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
            }
            const data = await usuarioService.login(username, password);
            res.status(200).json(data);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
};

export default usuarioController;