const winston = require('../utils/winston');
const service = {};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("select id_partida_arancelaria, codigo_sap, nombre from dino.tpartida_arancelaria", []);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en partidaArancelariaService.listarTodo, ");
        throw error;
    }
}

service.listarPorCodigo = async (conn, codigo) => {
    try {
        
        const queryResponse = await conn.query(
            "select id_partida_arancelaria, codigo_sap, nombre \
            from dino.tpartida_arancelaria where codigo_sap like '"+ codigo + "%'",
            []);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en partidaArancelariaService.listarPorCodigo, ");
        throw error;
    }
}

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap from dino.tpartida_arancelaria", []);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en partidaArancelariaService.listarParaValidar, ");
        throw error;
    }
}

module.exports = service;