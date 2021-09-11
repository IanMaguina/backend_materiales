const winston = require('../utils/winston');
const service = {};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap, nombre, codigo_sociedad from dino.torganizacion_ventas",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en organizacionVentaService.listarTodo, ");
        throw error;
    }
};

service.listarPorSociedad = async (conn, codigo_sociedad) => {
    try {
        const queryResponse = await conn.query("select codigo_sap, nombre, codigo_sociedad from dino.torganizacion_ventas WHERE codigo_sociedad = $1",[codigo_sociedad]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en organizacionVentaService.listarPorSociedad, ");
        throw error;
    }
};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap from dino.torganizacion_ventas",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en organizacionVentaService.listarParaValidar, ");
        throw error;
    }
}

module.exports = service;