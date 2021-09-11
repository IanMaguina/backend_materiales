const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const sociedadService = require('../services/sociedadService');
const sociedadController = {};

sociedadController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Sociedades."
        };
        const sociedadServiceRes = await sociedadService.listarTodo(postgresConn);
        //winston.info("sociedadServiceRes: "+JSON.stringify(sociedadServiceRes));
        if(sociedadServiceRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = sociedadServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en sociedadController.listarTodo,",error);
        res.status(500).send(error);
    }
}; 

sociedadController.listar = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Sociedades."
        };

        let { id_escenario_nivel3 } = req.query;

        const sociedadServiceRes = await sociedadService.listar(postgresConn, id_escenario_nivel3);
        
        if(sociedadServiceRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = sociedadServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en sociedadController.listar,", error);
        res.status(500).send(error);
    }
}; 

module.exports = sociedadController;