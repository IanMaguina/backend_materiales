const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const organizacionVentaService = require('../services/organizacionVentaService');
const constantes = require('../utils/constantes');
const controller = {};

controller.listarTodo = async(req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Organizaciones de Venta."
        };

        const organizacionVentaServiceRes = await organizacionVentaService.listarTodo(postgresConn);
        
        if(organizacionVentaServiceRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = organizacionVentaServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en organizacionVentaController.listarTodo,",error);
        res.status(500).send(error);
    }
};

controller.listarPorSociedad = async(req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Organizaciones de Venta."
        };

        const { codigo_sociedad } = req.query;

        if (!codigo_sociedad || codigo_sociedad == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo codigo_sociedad no tiene un valor válido. Tipo de dato : '" + (typeof codigo_sociedad) + "', valor = " + codigo_sociedad;
            res.status(200).json(response);
            return;
        }

        const organizacionVentaServiceRes = await organizacionVentaService.listarPorSociedad(postgresConn, codigo_sociedad);
        
        if(organizacionVentaServiceRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = organizacionVentaServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en organizacionVentaController.listarPorSociedad,",error);
        res.status(500).send(error);
    }
};

module.exports = controller;