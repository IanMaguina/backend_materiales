const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select id_modelo_pronostico, codigo_sap from dino.tmodelo_pronostico",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en clase modeloPronosticoService.listarParaValidar, ");
        throw error;
    }
};

module.exports = service;
