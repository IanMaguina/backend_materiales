const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const tipoSolicitudService = require('../services/tipoSolicitudService');
const tipoSolicitudController = {};

tipoSolicitudController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Tipos de Solicitud."
        };
        const tipoSolicitudServiceRes = await tipoSolicitudService.listarTodo(postgresConn);
        if(tipoSolicitudServiceRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = tipoSolicitudServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en tipoSolicitudController.listarTodo,",error);
        res.status(500).send(error);
    }
}

module.exports = tipoSolicitudController;