const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const canalDistribucionService = require('../services/canalDistribucionService');
const canalDistribucionController = {};

canalDistribucionController.listarTodo = async(req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Canales de Distribución."
        };

        const canalDistribucionServiceRes = await canalDistribucionService.listarTodo(postgresConn);
        
        if(canalDistribucionServiceRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = canalDistribucionServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en canalDistribucionController.listarTodo,",error);
        res.status(500).send(error);
    }
};

module.exports = canalDistribucionController;