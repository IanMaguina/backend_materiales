const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const grupoTransporteService = require('../services/grupoTransporteService');
const grupoTransporteController = {};

grupoTransporteController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Grupo Transporte."
        };

        const listaRes = await grupoTransporteService.listarTodo(postgresConn);
        if(listaRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = listaRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en grupoTransporteController.listarTodo,",error);
        res.status(500).send(error);
    }
}

module.exports = grupoTransporteController;