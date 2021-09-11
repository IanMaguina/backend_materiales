const winston = require('../utils/winston');
const service = {};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("select id, codigo_sap, nombre from dino.tunidad_medida order by codigo_sap",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en unidadMedidaService.listarTodo, ");
        throw error;
    }
}

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select id, codigo_sap from dino.tunidad_medida",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en unidadMedidaService.listarParaValidar, ");
        throw error;
    }
}

module.exports = service;