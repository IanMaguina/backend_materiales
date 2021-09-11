const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const perfilUsuarioService = require('../services/perfilUsuarioService');
const perfilUsuarioController = {};

perfilUsuarioController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Perfiles de Usuario."
        };
        const perfilUsuarioServiceRes = await perfilUsuarioService.listarTodo(postgresConn);
        if(perfilUsuarioServiceRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = perfilUsuarioServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en perfilUsuarioController.listarTodo,",error);
        res.status(500).send(error);
    }
}

module.exports = perfilUsuarioController;