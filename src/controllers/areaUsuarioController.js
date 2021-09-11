const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const areaUsuarioService = require('../services/areaUsuarioService');
const areaUsuarioController = {};

areaUsuarioController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Areas de Usuario."
        };
        const areaUsuarioServiceRes = await areaUsuarioService.listarTodo(postgresConn);
        if(areaUsuarioServiceRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = areaUsuarioServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en areaUsuarioController.listarTodo,",error);
        res.status(500).send(error);
    }
}

module.exports = areaUsuarioController;