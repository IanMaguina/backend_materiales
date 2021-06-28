const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap from dino.tgrupo_estadistica_mat",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en grupoEstadisticaMatService.listarParaValidar, ");
        throw error;
    }
}

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.tgrupo_estadistica_mat", []);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en grupoEstadisticaMatService.listarTodo, " + error.stack;
        throw error;
    }
}

module.exports = service;