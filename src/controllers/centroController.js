const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const centroService = require('../services/centroService');
const centroController = {};

centroController.listar = async(req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Centros."
        };

        let { codigo_sociedad } = req.query;
        const centroServiceRes = await centroService.listar(postgresConn, codigo_sociedad);
        
        if(centroServiceRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = centroServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en centroController.listar,", error);
        res.status(500).send(error);
    }
};

module.exports = centroController;