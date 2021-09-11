const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select id_grupo_material1, codigo_sap, nombre from dino.tgrupo_material1",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en grupoMaterial1Service.listarParaValidar, ");
        throw error;
    }
}

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("select * from dino.tgrupo_material1",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en grupoMaterial1Service.listarTodo, " + error.stack;
        throw error;
    }
}

module.exports = service;