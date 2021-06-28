const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const grupoCompraService = require('../services/grupoCompraService');
const grupoCompraController = {};

grupoCompraController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Grupo Compra."
        };

        const listaRes = await grupoCompraService.listarTodo(postgresConn);
        if(listaRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = listaRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en grupoCompraController.listarTodo,",error);
        res.status(500).send(error);
    }
}

module.exports = grupoCompraController;