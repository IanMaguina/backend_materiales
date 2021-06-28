const winston = require('../utils/winston');
const service = {};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("select id_ramo, codigo_sap, nombre from dino.tramo",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en ramoService.listarTodo, ");
        throw error;
    }
};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap from dino.tramo",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en ramoService.listarParaValidar, ");
        throw error;
    }
}

module.exports = service;