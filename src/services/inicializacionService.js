const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap from dino.tinicializacion",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en inicializacionService.listarParaValidar, " + error.stack;
        throw error;
    }
}

module.exports = service;