const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap, centro_codigo_sap from dino.taprovis_especial",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en aprovisEspecialService.listarParaValidar, ");
        throw error;
    }
}

module.exports = service;