const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const grupoTipoPosicionService = require('../services/grupoTipoPosicionService');
const grupoTipoPosicionController = {};

grupoTipoPosicionController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Grupo Tipo Posicion."
        };

        const listaRes = await grupoTipoPosicionService.listarTodo(postgresConn);
        if(listaRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = listaRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en grupoTipoPosicionController.listarTodo,",error);
        res.status(500).send(error);
    }
}

module.exports = grupoTipoPosicionController;