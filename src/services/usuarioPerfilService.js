const usuarioPerfilService = {};

usuarioPerfilService.crear = async (conn, id_usuario, id_perfil_usuario) => {
    try {
        const queryResponse = await conn.query("INSERT INTO dino.tusuario_perfil (id_usuario, id_perfil_usuario) VALUES($1, $2) RETURNING id_usuario"
        ,[id_usuario, id_perfil_usuario]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en usuarioPerfilService.crear, "+error.stack;
        throw error;
    }
}

usuarioPerfilService.buscar = async (conn, id_usuario, id_perfil_usuario) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.tusuario_perfil WHERE id_usuario=$1 AND id_perfil_usuario=$2"
        ,[id_usuario, id_perfil_usuario]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en usuarioPerfilService.crear, "+error.stack;
        throw error;
    }
}

usuarioPerfilService.borrar = async (conn, id_usuario, id_perfil_usuario) => {
    try {
        const queryResponse = await conn.query("DELETE FROM dino.tusuario_perfil WHERE id_usuario=$1 AND id_perfil_usuario=$2"
        ,[id_usuario, id_perfil_usuario]);
        if(queryResponse && queryResponse.rowCount == 1){
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en usuarioPerfilService.borrar, "+error.stack;
        throw error;
    }
}

module.exports = usuarioPerfilService;