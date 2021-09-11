const winston = require('../utils/winston');
const service = {};

service.listar = async (conn, centro_codigo_sap) => {
    try {
        const queryResponse = await conn.query("SELECT codigo_sap, nombre, centro_codigo_sap \
        FROM dino.talmacen WHERE centro_codigo_sap = $1 ORDER BY codigo_sap", [centro_codigo_sap]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en almacenService.listar, ");
        throw error;
    }
};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query(
            "SELECT codigo_sap, nombre, centro_codigo_sap \
            FROM dino.talmacen ORDER BY codigo_sap",
            []);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en almacenService.listar, ");
        throw error;
    }
};

service.listarParaValidar = async (conn) => {    
    try {
        const queryResponse = await conn.query(
            "SELECT codigo_sap, centro_codigo_sap \
            FROM dino.talmacen", []);  

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en almacenService.listarParaValidar, " + error.stack;
        throw error;
    }
};

service.listarParaValidarPorCentro = async (conn, centro_codigo_sap) => {    
    try {
        const queryResponse = await conn.query(
            "SELECT codigo_sap \
            FROM dino.talmacen WHERE centro_codigo_sap = $1 ORDER BY codigo_sap", [centro_codigo_sap]);  

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en almacenService.listarParaValidarPorCentro, " + error.stack;
        throw error;
    }
};

module.exports = service;