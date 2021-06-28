const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap from dino.tcalculo_tamano_lote",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en calculoTamanoLoteService.listarParaValidar, ");
        throw error;
    }
}

module.exports = service;