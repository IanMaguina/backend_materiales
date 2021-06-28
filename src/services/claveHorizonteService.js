const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap, centro_codigo_sap from dino.tclave_horizonte",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en clase claveHorizonte.listarParaValidar, ");
        throw error;
    }
};

module.exports = service;