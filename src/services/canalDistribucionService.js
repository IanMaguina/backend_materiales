const winston = require('../utils/winston');
const service = {};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("select id_canal_distribucion, codigo_sap, nombre from dino.tcanal_distribucion",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en canalDistribucionService.listarTodo, ");
        throw error;
    }
};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap from dino.tcanal_distribucion",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en canalDistribucionService.listarParaValidar, ");
        throw error;
    }
}

module.exports = service;