const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const responsableControlProduccionService = require('../services/responsableControlProduccionService');
const constantes = require('../utils/constantes');
const controller = {};

controller.listarTodo = async(req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Responsable Control Produccion."
        };

        const listaRes = await responsableControlProduccionService.listarTodo(postgresConn);
        if(listaRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = listaRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en responsableControlProduccionController.listarTodo,",error);
        res.status(500).send(error);
    }
};

controller.listarPorCentro = async(req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Responsable Control Produccion."
        };

        const { centro_codigo_sap } = req.query;

        if (!centro_codigo_sap || centro_codigo_sap == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo centro_codigo_sap no tiene un valor válido. Tipo de dato : '" + (typeof centro_codigo_sap) + "', valor = " + centro_codigo_sap;
            res.status(200).json(response);
            return;
        }

        const listaRes = await responsableControlProduccionService.listarPorCentro(postgresConn, centro_codigo_sap);
        if(listaRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = listaRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en responsableControlProduccionController.listarPorCentro,",error);
        res.status(500).send(error);
    }
};

module.exports = controller;