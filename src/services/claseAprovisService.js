const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap from dino.tclase_aprovis",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en clase Inspeccion claseAprovisService.listarParaValidar, ");
        throw error;
    }
};

module.exports = service;