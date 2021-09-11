const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const estadoSolicitudService = require('../services/estadoSolicitudService');
const controller = {};

controller.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Estados de Solicitud."
        };

        const listaRes = await estadoSolicitudService.listarTodo(postgresConn);
        if(listaRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = listaRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en estadoSolicitudController.listarTodo,",error);
        res.status(500).send(error);
    }
}

module.exports = controller;