const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const tipoMaterialService = require('../services/tipoMaterialService');
const tipoMaterialController = {};

tipoMaterialController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Tipos de Material."
        };
        const tipoMaterialServiceRes = await tipoMaterialService.listarTodo(postgresConn);
        if(tipoMaterialServiceRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = tipoMaterialServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en tipoMaterialController.listarTodo,",error);
        res.status(500).send(error);
    }
}

module.exports = tipoMaterialController;