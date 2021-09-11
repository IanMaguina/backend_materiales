const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap, nombre from dino.tgrupo_compra",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en grupoCompraService.listarParaValidar, ");
        throw error;
    }
}

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("select * from dino.tgrupo_compra",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en grupoCompraService.listarTodo, ");
        throw error;
    }
}


module.exports = service;