const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const motivoRechazoService = require('../services/motivoRechazoService');
const motivoRechazoController = {};

motivoRechazoController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Motivo Rechazo."
        };

        const listaRes = await motivoRechazoService.listarTodo(postgresConn);
        if(listaRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = listaRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en motivoRechazoController.listarTodo,",error);
        res.status(500).send(error);
    }
}

module.exports = motivoRechazoController;