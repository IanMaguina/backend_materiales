const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap from dino.tgrado_optimizacion",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en gradoOptimizacionService.listarParaValidar, " + error.stack;
        throw error;
    }
}

module.exports = service;