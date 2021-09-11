const winston = require('../utils/winston');
const service = {};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.ttipo_material",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en tipoMaterialService.listarTodo, ");
        throw error;
    }
};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT codigo_sap FROM dino.ttipo_material",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en tipoMaterialService.listarParaValidar, ");
        throw error;
    }
}

module.exports = service;