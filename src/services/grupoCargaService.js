const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select id_grupo_carga, codigo_sap, nombre from dino.tgrupo_carga",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en grupoCargaService.listarParaValidar, ");
        throw error;
    }
}

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("select * from dino.tgrupo_carga order by id_grupo_carga",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en grupoCargaService.listarTodo, " + error.stack;
        throw error;
    }
}

module.exports = service;