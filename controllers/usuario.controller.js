import usuarioService from '../services/usuario.service.js'; // <- Nota el .js

const usuarioController = {
    crear: async (req, res) => {
        try {
            console.log("Recibido:", req.body); // Esto ya vimos que funciona

            // --- AQUÍ ESTÁ EL CAMBIO IMPORTANTE ---
            // Asegúrate de que diga 'username', NO 'email'
            const { nombre, username, password, rol } = req.body;
            
            // Validamos que 'username' exista. Si aquí decías !email, por eso fallaba.
            if (!nombre || !username || !password || !rol) {
                return res.status(400).json({ message: "Faltan datos" });
            }

            // Enviamos 'username' al servicio
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

    listar: async (req, res) => {
        try {
            const usuarios = await usuarioService.listar();
            res.json(usuarios);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener usuarios" });
        }
    },

    eliminar: async (req, res) => {
        try {
            const { id } = req.params;
            await usuarioService.eliminar(id);
            res.json({ message: "Usuario eliminado" });
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar" });
        }
    },
    
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

export default usuarioController; // Usamos "export default"