const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap from dino.ttipo_mrp_caract_plani",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en tipoMrpCaractPlaniService.listarParaValidar, ");
        throw error;
    }
}

module.exports = service;