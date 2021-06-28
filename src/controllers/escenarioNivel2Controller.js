const postgresConn = require('../connections/postgres');
const constantes = require('../utils/constantes');
const winston = require('../utils/winston');
const escenarioNivel2Service = require('../services/escenarioNivel2Service');
const escenarioNivel2Controller = {};

escenarioNivel2Controller.listarPorIdEscenarioNivel1 = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Escenarios de Nivel 2."
        };
        let { id_escenario_nivel1 } = req.query;
        winston.info("id_escenario_nivel1: "+id_escenario_nivel1);
        if(!id_escenario_nivel1 || id_escenario_nivel1 == constantes.emptyString){
            response.resultado = 0;
            response.mensaje = "El campo id_escenario_nivel1 no tiene un valor válido. Tipo de dato : '"+(typeof id_escenario_nivel1)+"', valor = "+id_escenario_nivel1;
            res.status(200).json(response);
            return;
        }
        const escenarioNivel2ServiceRes = await escenarioNivel2Service.listarPorIdEscenarioNivel1(postgresConn, id_escenario_nivel1);
        if(escenarioNivel2ServiceRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = escenarioNivel2ServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en escenarioNivel2Controller.listarPorIdEscenarioNivel1,",error);
        res.status(500).send(error);
    }
}

module.exports = escenarioNivel2Controller;