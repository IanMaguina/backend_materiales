const motivoRechazoService = {};

motivoRechazoService.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("select * from dino.tmotivo_rechazo order by id",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en motivoRechazoService.listarTodo, " + error.stack;
        throw error;
    }
}

motivoRechazoService.buscarPorId = async (conn, id) => {
    try {
        const queryResponse = await conn.query("select * from dino.tmotivo_rechazo where id=$1",[id]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en motivoRechazoService.buscarPorId, " + error.stack;
        throw error;
    }
}

module.exports = motivoRechazoService;