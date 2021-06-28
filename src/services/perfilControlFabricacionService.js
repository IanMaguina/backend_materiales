const service = {};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.tperfil_control_fabricacion ORDER BY codigo_sap",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en perfilControlFabricacionService.listarTodo, " + error.stack;
        throw error;
    }
};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT id, codigo_sap, centro_codigo_sap FROM dino.tperfil_control_fabricacion",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en perfilControlFabricacionService.listarParaValidar, " + error.stack;
        throw error;
    }
};

service.listarPorCentro = async (conn, centro_codigo_sap) => {
    try {
        const queryResponse = await conn.query("SELECT * \
        FROM dino.tperfil_control_fabricacion WHERE centro_codigo_sap = $1 ORDER BY codigo_sap",[centro_codigo_sap]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en perfilControlFabricacionService.listarPorCentro, " + error.stack;
        throw error;
    }
};

module.exports = service;