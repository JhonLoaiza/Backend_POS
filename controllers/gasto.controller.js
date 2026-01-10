import gastoService from '../services/gasto.service.js';

const gastoController = {
    crear: async (req, res) => {
        try {
            const { monto, descripcion } = req.body;
            if (!monto || !descripcion) {
                return res.status(400).json({ message: "Faltan datos (monto o descripción)" });
            }
            const id = await gastoService.registrar(monto, descripcion);
            res.status(201).json({ message: "Gasto registrado", id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al registrar gasto" });
        }
    },
    listarHoy: async (req, res) => {
        try {
            const gastos = await gastoService.obtenerHoy();
            res.json(gastos);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener gastos" });
        }
    }
};

export default gastoController;