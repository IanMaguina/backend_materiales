const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const clasificacionService = require('../services/clasificacionService');
const clasificacionController = {};

clasificacionController.listarTodo = async(req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Clasificaciones."
        };

        const clasificacionServiceRes = await clasificacionService.listarTodo(postgresConn);
        
        if(clasificacionServiceRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = clasificacionServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en clasificacionController.listarTodo,",error);
        res.status(500).send(error);
    }
};

module.exports = clasificacionController;