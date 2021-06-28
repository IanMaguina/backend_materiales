const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const claseInspeccionService = require('../services/claseInspeccionService');
const claseInspeccionController = {};

claseInspeccionController.listarTodo = async(req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Clase Inspeccion."
        };

        const claseInspeccionServiceRes = await claseInspeccionService.listarTodo(postgresConn);
        
        if(claseInspeccionServiceRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = claseInspeccionServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en claseInspeccionController.listarTodo,",error);
        res.status(500).send(error);
    }
};

module.exports = claseInspeccionController;