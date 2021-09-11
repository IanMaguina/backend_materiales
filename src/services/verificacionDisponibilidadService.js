const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap from dino.tverificacion_disponibilidad",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en verificacion disponibilidad Service.listarParaValidar, ");
        throw error;
    }
}

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("select * from dino.tverificacion_disponibilidad",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en verificacion disponibilidad Service.listarTodo, " + error.stack;
        throw error;
    }
}

module.exports = service;