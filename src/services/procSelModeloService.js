const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap from dino.tproc_sel_modelo",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en procSelModeloService.listarParaValidar, " + error.stack;
        throw error;
    }
}

module.exports = service;