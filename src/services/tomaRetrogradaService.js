const service = {};

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT codigo_sap FROM dino.ttoma_retrograda",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en tomaRetrogradaService.listarParaValidar, " + error.stack;
        throw error;
    }
};

module.exports = service;