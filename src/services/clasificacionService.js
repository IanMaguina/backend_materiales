const winston = require('../utils/winston');
const service = {};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("select id_clasificacion, codigo_sap, nombre \
        from dino.tclasificacion ORDER BY codigo_sap",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en clasificacionService.listarTodo, ");
        throw error;
    }
}

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select id_clasificacion, codigo_sap from dino.tclasificacion",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en clasificacionService.listarParaValidar, ");
        throw error;
    }
}

module.exports = service;