const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap from dino.tplanf_neces_mixtas",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en clase planfNecesMixtasService.listarParaValidar, ");
        throw error;
    }
};

module.exports = service;