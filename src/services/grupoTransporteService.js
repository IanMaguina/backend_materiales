const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select id_grupo_transporte, codigo_sap, nombre from dino.tgrupo_transporte",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en grupoTransporteService.listarParaValidar, ");
        throw error;
    }
}

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("select * from dino.tgrupo_transporte order by id_grupo_transporte",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en grupoTransporteService.listarTodo, " + error.stack;
        throw error;
    }
}

module.exports = service;