const winston = require('../utils/winston');
const service = {};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("select id_clase_inspeccion, codigo_sap, nombre from dino.tclase_inspeccion",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en clase Inspeccion Service.listarTodo, ");
        throw error;
    }
};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select id_clase_inspeccion, codigo_sap from dino.tclase_inspeccion",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en clase Inspeccion Service.listarParaValidar, ");
        throw error;
    }
};



module.exports = service;