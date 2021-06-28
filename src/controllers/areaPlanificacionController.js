const postgresConn = require('../connections/postgres');
const constantes = require('../utils/constantes');
const winston = require('../utils/winston');
const areaPlanificacionService = require('../services/areaPlanificacionService');
const controller = {};

controller.listar = async(req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Area Planificación."
        };

        let { centro_codigo_sap, almacen_codigo_sap } = req.query;
        
        if(!centro_codigo_sap || centro_codigo_sap == constantes.emptyString){
            response.resultado = 0;
            response.mensaje = "El campo centro_codigo_sap no tiene un valor válido. Tipo de dato : '" + (typeof centro_codigo_sap)+"', valor = " + centro_codigo_sap;
            res.status(200).json(response);
            return;
        }

        if(!almacen_codigo_sap || almacen_codigo_sap == constantes.emptyString){
            response.resultado = 0;
            response.mensaje = "El campo almacen_codigo_sap no tiene un valor válido. Tipo de dato : '" + (typeof almacen_codigo_sap)+"', valor = " + almacen_codigo_sap;
            res.status(200).json(response);
            return;
        }

        const list = await areaPlanificacionService.listar(postgresConn, centro_codigo_sap, almacen_codigo_sap);
        
        if(list){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = list;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en areaPlanificacionController.listar", error);
        res.status(500).send(error);
    }
};

module.exports = controller;