const winston = require('../utils/winston');
const service = {};

service.listar = async (conn, centro_codigo_sap, almacen_codigo_sap) => {
    try {
        const queryResponse = await conn.query(
            "SELECT codigo_sap, nombre \
            FROM dino.tarea_planificacion \
            WHERE centro_codigo_sap = $1 \
            AND almacen_codigo_sap = $2 ORDER BY codigo_sap",
            [centro_codigo_sap, almacen_codigo_sap]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en areaPlanificacionService.listar, " + error.stack;
        throw error;
    }
};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap from dino.tarea_planificacion",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en areaPlanificacionService.listarParaValidar, ");
        throw error;
    }
};

module.exports = service;