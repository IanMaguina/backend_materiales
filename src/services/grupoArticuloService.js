const winston = require('../utils/winston');
const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select id_grupo_articulo, codigo_sap, nombre from dino.tgrupo_articulo",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en grupoArticulo.listarParaValidar, ");
        throw error;
    }
}

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("select * from dino.tgrupo_articulo order by codigo_sap",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en grupoArticuloService.listarTodo, " + error.stack;
        throw error;
    }
}

module.exports = service;