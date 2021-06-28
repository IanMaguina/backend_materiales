const service = {};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.tresponsable_control_produccion ORDER BY codigo_sap",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en responsableControlProduccionService.listarTodo, " + error.stack;
        throw error;
    }
};

service.listarPorCentro = async (conn, centro_codigo_sap) => {
    try {
        const queryResponse = await conn.query("SELECT * \
        FROM dino.tresponsable_control_produccion WHERE centro_codigo_sap = $1 ORDER BY codigo_sap",[centro_codigo_sap]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en responsableControlProduccionService.listarPorCentro, " + error.stack;
        throw error;
    }
}

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT id, codigo_sap, centro_codigo_sap FROM dino.tresponsable_control_produccion",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en responsableControlProduccionService.listarParaValidar, " + error.stack;
        throw error;
    }
};

module.exports = service;