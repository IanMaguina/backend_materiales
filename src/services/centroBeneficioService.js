const winston = require('../utils/winston');
const service = {};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap, nombre from dino.tcentro_beneficio ORDER BY codigo_sap",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en centroBeneficioService.listarTodo, ");
        throw error;
    }
};

service.listarPorSociedad = async (conn, codigo_sociedad) => {
    try {
        const queryResponse = await conn.query("select codigo_sap, nombre from dino.tcentro_beneficio \
        where codigo_sociedad = $1 OR codigo_sociedad ='GH00' OR codigo_sociedad ='XXXX' ORDER BY codigo_sap",[codigo_sociedad]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en centroBeneficioService.listarPorSociedad, ");
        throw error;
    }
};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap from dino.tcentro_beneficio",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en centroBeneficioService.listarParaValidar, ");
        throw error;
    }
};

module.exports = service;