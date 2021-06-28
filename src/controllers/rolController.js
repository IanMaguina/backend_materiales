const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const constantes = require('../utils/constantes');
const rolService = require('../services/rolService');

const controller = {};

controller.listarRolesAnteriores = async(req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Roles."
        };
        
        const { id_solicitud, orden} = req.query;

        if (!id_solicitud || id_solicitud == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no tiene un valor válido. Tipo de dato : '" + (typeof id_solicitud) + "', valor = " + id_solicitud;
            res.status(200).json(response);
            return;
        }

        if (!orden || orden == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo orden no tiene un valor válido. Tipo de dato : '" + (typeof orden) + "', valor = " + orden;
            res.status(200).json(response);
            return;
        }

        const rolServiceRes = await rolService.listarRolesAnteriores(postgresConn, id_solicitud, orden);
        
        if(rolServiceRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = rolServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en rolController.listarRolesAnteriores,",error);
        res.status(500).send(error);
    }
};

module.exports = controller;