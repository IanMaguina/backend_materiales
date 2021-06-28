const service = {};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("select * from dino.tidioma order by id_idioma",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en idiomaService.listarTodo, " + error.stack;
        throw error;
    }
}

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("select codigo_sap from dino.tidioma",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en idiomaService.listarParaValidar, " + error.stack;
        throw error;
    }
}

module.exports = service;