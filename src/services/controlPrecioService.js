const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query(
            "select codigo_sap from dino.tcontrol_precio",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en controlPrecioService.listarParaValidar, ");
        throw error;
    }
}

module.exports = service;