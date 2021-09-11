const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap from dino.tindicador_periodo",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en clase Inspeccion indicadorPeriodo.listarParaValidar, ");
        throw error;
    }
};

module.exports = service;