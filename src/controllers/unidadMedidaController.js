const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const unidadMedidaService = require('../services/unidadMedidaService');
const unidadMedidaController = {};

unidadMedidaController.listarTodo = async(req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Unidades de medida."
        };

        const unidadMedidaServiceRes = await unidadMedidaService.listarTodo(postgresConn);
        
        if(unidadMedidaServiceRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = unidadMedidaServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en unidadMedidaController.listar,",error);
        res.status(500).send(error);
    }
};

module.exports = unidadMedidaController;