const perfilUsuarioService = {};

perfilUsuarioService.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.tperfil_usuario",[])
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en perfilUsuarioService.listarTodo, "+error.stack;
        throw error;
    }
}

perfilUsuarioService.listarPerfilesPendientesPorIdUsuario = async (conn, id_usuario) => {
    try {
        const queryResponse = await conn.query("select * from dino.tperfil_usuario perfil_usu"
        +" where perfil_usu.id not in (select distinct usu_perfil.id_perfil_usuario"
        +" from dino.tusuario usuario"
        +" join dino.tusuario_perfil usu_perfil on usu_perfil.id_usuario=usuario.id"
        +" where usuario.id=$1)"
        ,[id_usuario]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en perfilUsuarioService.listarPerfilesPendientesPorIdUsuario, "+error.stack;
        throw error;
    }
}

perfilUsuarioService.listarPorIdUsuario = async (conn, id_usuario) => {
    try {
        const queryResponse = await conn.query("select perfil_usu.* from dino.tusuario usuario"
        +" join dino.tusuario_perfil usu_perfil on usuario.id=usu_perfil.id_usuario"
        +" join dino.tperfil_usuario perfil_usu on perfil_usu.id=usu_perfil.id_perfil_usuario"
        +" where usuario.id=$1"
        ,[id_usuario]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en perfilUsuarioService.listarPorIdUsuario, "+error.stack;
        throw error;
    }
}

module.exports = perfilUsuarioService;