const winston = require('../utils/winston');
const tipoSolicitudService = {};

tipoSolicitudService.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.ttipo_solicitud",[]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en tipoSolicitudService.listarTodo, ");
        throw error;
    }
}

module.exports = tipoSolicitudService;