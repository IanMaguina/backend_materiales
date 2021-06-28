const postgresConn = require('../connections/postgres');
const constantes = require('../utils/constantes');
const winston = require('../utils/winston');
const almacenService = require('../services/almacenService');
const almacenController = {};

almacenController.listar = async(req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Almacenes."
        };

        let { centro_codigo_sap } = req.query;
        
        if(!centro_codigo_sap || centro_codigo_sap == constantes.emptyString){
            response.resultado = 0;
            response.mensaje = "El campo centro_codigo_sap no tiene un valor válido. Tipo de dato : '" + (typeof centro_codigo_sap)+"', valor = " + centro_codigo_sap;
            res.status(200).json(response);
            return;
        }

        const almacenServiceRes = await almacenService.listar(postgresConn, centro_codigo_sap);
        
        if(almacenServiceRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = almacenServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en almacenController.listar", error);
        res.status(500).send(error);
    }
};

module.exports = almacenController;