const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap, centro_codigo_sap from dino.tgrupo_planif_necesidades",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en grupoPlanifNecesidadesService.listarParaValidar, ");
        throw error;
    }
}

module.exports = service;