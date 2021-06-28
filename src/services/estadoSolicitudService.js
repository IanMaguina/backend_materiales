const estadoSolicitudService = {};

estadoSolicitudService.buscarPorIdRol = async (conn, id_rol) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.testado_solicitud WHERE id_rol=$1",[id_rol]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en estadoSolicitudService.buscarPorIdRol, " + error.stack;
        throw error;
    }
}

estadoSolicitudService.listarTodo  = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT id, nombre, id_rol FROM dino.testado_solicitud order by id",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en estadoSolicitudService.listarTodo, " + error.stack;
        throw error;
    }
}

estadoSolicitudService.buscarPorId = async (conn, id) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.testado_solicitud WHERE id=$1",[id]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en estadoSolicitudService.buscarPorId, " + error.stack;
        throw error;
    }
}

module.exports = estadoSolicitudService;