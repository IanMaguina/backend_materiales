
const postgresConn = require('../connections/postgres');
const constantes = require('../utils/constantes');
const winston = require('../utils/winston');
const escenarioNievl1Service = require('../services/escenarioNivel1Service');
const escenarioNivel1Controller = {};

escenarioNivel1Controller.listarPorIdSociedad = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Escenarios de Nivel 1."
        };
        let { id_sociedad } = req.query;
        winston.info("id_sociedad: "+id_sociedad);
        if(!id_sociedad || id_sociedad == constantes.emptyString){
            response.resultado = 0;
            response.mensaje = "El campo id_sociedad no tiene un valor válido. Tipo de dato : '"+(typeof id_sociedad)+"', valor = "+id_sociedad;
            res.status(200).json(response);
            return;
        }
        const escenarioNivel1ServiceRes = await escenarioNievl1Service.listarPorIdSociedad(postgresConn,id_sociedad);
        if(escenarioNivel1ServiceRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = escenarioNivel1ServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en escenarioNivel1Controller.listarPorIdSociedad,", error);
        res.status(500).send(error);
    }
}

module.exports = escenarioNivel1Controller;