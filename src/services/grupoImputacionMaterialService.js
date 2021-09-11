const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap, nombre from dino.tgrupo_imputacion_material",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en grupoImputacionMaterialService.listarParaValidar, ");
        throw error;
    }
}

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.tgrupo_imputacion_material ORDER BY codigo_sap", []);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en grupoImputacionMaterialService.listarTodo, " + error.stack;
        throw error;
    }
}

module.exports = service;