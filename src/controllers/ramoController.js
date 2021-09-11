const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const ramoService = require('../services/ramoService');
const ramoController = {};

ramoController.listarTodo = async(req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Ramos."
        };

        const ramoServiceRes = await ramoService.listarTodo(postgresConn);
        
        if(ramoServiceRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = ramoServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en ramoController.listar,",error);
        res.status(500).send(error);
    }
};

module.exports = ramoController;