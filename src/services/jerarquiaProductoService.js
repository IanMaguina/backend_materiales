const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap, nombre from dino.tjerarquia_producto",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en jerarquiaProductoService.listarParaValidar, ");
        throw error;
    }
}

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("select * from dino.tjerarquia_producto ORDER BY codigo_sap",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en jerarquiaProductoService.listarTodo, " + error.stack;
        throw error;
    }
}

module.exports = service;