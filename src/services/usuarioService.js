const PerfilUsuario = require('../domain/perfilUsuario');
const AreaUsuario = require('../domain/areaUsuario');
const Usuario = require('../domain/usuario');
const usuarioService = {};

function extratUsuarioFromResult(aRow){
    const perfilUsuario = new PerfilUsuario();
    perfilUsuario.id = aRow.id_perfil_usuario;
    perfilUsuario.nombre = aRow.perfil_usuario_nombre;
    const areaUsuario = new AreaUsuario();
    areaUsuario.id = aRow.id_area_usuario;
    areaUsuario.nombre = aRow.area_usuario_nombre;
    const usuario = new Usuario();
    usuario.id = aRow.id;
    usuario.usuario = aRow.usuario;
    usuario.activo = aRow.activo;
    usuario.nombre = aRow.nombre;
    usuario.area_usuario = areaUsuario;
    usuario.perfil_usuario = perfilUsuario;
    return usuario;
}

function extratUsuario2FromResult(aRow){
    const perfilUsuario = new PerfilUsuario();
    //perfilUsuario.id = aRow.id_perfil_usuario;
    perfilUsuario.nombre = aRow.perfil_usuario_nombre;
    const areaUsuario = new AreaUsuario();
    areaUsuario.id = aRow.id_area_usuario;
    areaUsuario.nombre = aRow.area_usuario_nombre;
    const usuario = new Usuario();
    usuario.id = aRow.id;
    usuario.usuario = aRow.usuario;
    usuario.activo = aRow.activo;
    usuario.nombre = aRow.nombre;
    usuario.area_usuario = areaUsuario;
    usuario.perfil_usuario = perfilUsuario;
    return usuario;
}

usuarioService.listarUsuariosQueNoEstanAsignadosAUnaEstrategiaRolPorIdEstrategia = async (conn, id_estrategia) => {
    try {
        const queryResponse = await conn.query("SELECT usuario.id, usuario.usuario, usuario.nombre FROM dino.tusuario usuario where usuario.id not in"
        +"(SELECT est_rol_usu.id_usuario FROM dino.testrategia_rol est_rol"
        +" JOIN dino.testrategia_rol_usuario est_rol_usu on est_rol_usu.id_estrategia_rol=est_rol.id"
        +" WHERE est_rol.id_estrategia=$1 and est_rol_usu.activo=true)",[id_estrategia]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en usuarioService.listarUsuariosQueNoEstanAsignadosAUnaEstrategiaRolPorIdEstrategia, " + error.stack;
        throw error;
    }
}

usuarioService.listarParaEstrategia = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT usuario.id, usuario.usuario, usuario.nombre FROM dino.tusuario usuario",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en usuarioService.listarParaEstrategia, " + error.stack;
        throw error;
    }
}

usuarioService.crear = async (conn, usuario) => {
    try {
        const queryResponse = await conn.query("INSERT INTO dino.tusuario (usuario, nombre, id_area_usuario, activo) VALUES($1, $2, $3, $4) RETURNING id"
        ,[usuario.usuario, usuario.nombre, usuario.area_usuario.id, usuario.activo]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en usuarioService.crear, "+error.stack;
        throw error;
    }
}

usuarioService.buscarPorUsuario = async (conn, usuario) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.tusuario usuario where usuario.usuario=$1",[usuario]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en usuarioService.buscarPorUsuario, "+error.stack;
        throw error;
    }
}

usuarioService.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT usuario.id, usuario.usuario, usuario.nombre, usuario.activo, usuario.id_area_usuario"
        +", area_usu.nombre as area_usuario_nombre"
        +" FROM dino.tusuario usuario"
        //+" join dino.tperfil_usuario perfil_usu on perfil_usu.id=usuario.id_perfil_usuario"
        +" join dino.tarea_usuario area_usu on area_usu.id=usuario.id_area_usuario"
        ,[]);
        let response = [];
        for (let index = 0; index < queryResponse.rows.length; index++) {
            response.push(extratUsuarioFromResult(queryResponse.rows[index]));
        }
        return response;
    } catch (error) {
        error.stack = "\nError en usuarioService.listarTodo, "+error.stack;
        throw error;
    }
}

usuarioService.actualizarActivo = async (conn, usuario) => {
    try {
        const queryResponse = await conn.query("UPDATE dino.tusuario SET activo=$1 WHERE id=$2",[usuario.activo, usuario.id]);
        if(queryResponse && queryResponse.rowCount == 1){
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en usuarioService.actualizarActivo, " + error.stack;
        throw error;
    }
}

usuarioService.listarPorFiltros = async (conn, filtros) => {
    try {
        let queryFinal;
        let selectQuery = "SELECT usuario.id, usuario.usuario, usuario.nombre, usuario.activo, usuario.id_area_usuario"
        +",area_usu.nombre as area_usuario_nombre, string_agg(perfil_usu.nombre,', ' order by perfil_usu.nombre) as perfil_usuario_nombre"
        let fromQuery = " FROM dino.tusuario usuario"
        +" left join dino.tusuario_perfil usu_perfil on usu_perfil.id_usuario=usuario.id"
        +" left join dino.tperfil_usuario perfil_usu on perfil_usu.id=usu_perfil.id_perfil_usuario"
        +" left join dino.tarea_usuario area_usu on area_usu.id=usuario.id_area_usuario";
        let whereCondition = "";
        let queryParameters = [];
        let parameterNames = [];// array donde guardamos si existe o no existe un campo del filtro
        if(filtros.usuario){
            parameterNames.push("usuario");
        }
        if(filtros.nombre){
            parameterNames.push("nombre");
        }
        if(filtros.id_perfil_usuario){
            parameterNames.push("id_perfil_usuario");
        }
        if(filtros.id_area_usuario){
            parameterNames.push("id_area_usuario");
        }

        if(parameterNames.length > 0){
            whereCondition = " WHERE";
        }

        let i=0;
        for(;i < parameterNames.length;){
            if(i > 0){
                whereCondition = whereCondition + " AND"
            }
            if(parameterNames[i] == "usuario"){
                whereCondition = whereCondition + " UPPER(usuario.usuario) like '%'||UPPER($"+(i+1)+")||'%'";
                queryParameters.push(filtros.usuario);
            } else if(parameterNames[i] == "nombre"){
                whereCondition = whereCondition + " UPPER(usuario.nombre) like '%'||UPPER($"+(i+1)+")||'%'";
                queryParameters.push(filtros.nombre);
            } else if(parameterNames[i] == "id_perfil_usuario"){
                whereCondition = whereCondition + " usu_perfil.id_perfil_usuario=$"+(i+1);
                queryParameters.push(filtros.id_perfil_usuario);
            } else if(parameterNames[i] == "id_area_usuario"){
                whereCondition = whereCondition + " usuario.id_area_usuario=$"+(i+1);
                queryParameters.push(filtros.id_area_usuario);
            }
            i = i + 1;
        }
        queryFinal = selectQuery + fromQuery + whereCondition + " group by usuario.id, usuario.usuario, usuario.nombre, usuario.activo, usuario.id_area_usuario, area_usu.nombre";
        const queryResponse = await conn.query(queryFinal, queryParameters);
        const response = [];
        for(let i=0;i < queryResponse.rows.length;i++){
            response.push(extratUsuario2FromResult(queryResponse.rows[i]));
        }
        return response;
    } catch (error) {
        error.stack = "\nError en usuarioService.listarPorFiltros, " + error.stack;
        throw error;
    }
}

usuarioService.actualizar = async (conn, usuarioObj) => {
    try {
        const queryResponse = await conn.query("UPDATE dino.tusuario SET usuario=$1, nombre=$2, id_area_usuario=$3 WHERE id=$4"
        ,[usuarioObj.usuario, usuarioObj.nombre, usuarioObj.area_usuario.id, usuarioObj.id]);
        if(queryResponse && queryResponse.rowCount == 1){
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en usuarioService.actualizar, " + error.stack;
        throw error;
    }
}

usuarioService.listarIdEscenarioYIdTipoSolicitudDeUsuario = async (conn, correo) => {
    try {
        const queryResponse = await conn.query("select est.id_escenario_nivel3, est.id_tipo_solicitud, count(*) as cantidad"
        +" from dino.testrategia_rol_usuario est_rol_usu"
        +" join dino.testrategia_rol est_rol on est_rol.id=est_rol_usu.id_estrategia_rol"
        +" join dino.testrategia est on est.id=est_rol.id_estrategia"
        +" join dino.tusuario usuario on usuario.id=est_rol_usu.id_usuario"
        //+" join dino.tperfil_usuario perfil_usu on perfil_usu.id=usuario.id_perfil_usuario"
        +" join dino.tarea_usuario area_usu on area_usu.id=usuario.id_area_usuario"
        +" join dino.tescenario_nivel3 nivel3 on nivel3.id=est.id_escenario_nivel3"
        +" join dino.ttipo_solicitud tipo_sol on tipo_sol.id=est.id_tipo_solicitud"
        +" join dino.trol rol on rol.id=est_rol.id_rol"
        +" where usuario.usuario=$1 and est_rol.activo=true"
        +" group by est.id_escenario_nivel3, est.id_tipo_solicitud",[correo]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en usuarioService.listarIdEscenarioYIdTipoSolicitudDeUsuario, " + error.stack;
        throw error;
    }
}

usuarioService.listarIdEscenarioYIdTipoSolicitudPorIdUsuario  = async (conn, id_usuario) => {
    try {
        const queryResponse = await conn.query("select est.id_escenario_nivel3, est.id_tipo_solicitud, count(*) as cantidad"
        +" from dino.testrategia_rol_usuario est_rol_usu"
        +" join dino.testrategia_rol est_rol on est_rol.id=est_rol_usu.id_estrategia_rol"
        +" join dino.testrategia est on est.id=est_rol.id_estrategia"
        +" join dino.tusuario usuario on usuario.id=est_rol_usu.id_usuario"
        +" join dino.tarea_usuario area_usu on area_usu.id=usuario.id_area_usuario"
        +" join dino.tescenario_nivel3 nivel3 on nivel3.id=est.id_escenario_nivel3"
        +" join dino.ttipo_solicitud tipo_sol on tipo_sol.id=est.id_tipo_solicitud"
        +" join dino.trol rol on rol.id=est_rol.id_rol"
        +" where usuario.id=$1 and est_rol.activo=true"
        +" group by est.id_escenario_nivel3, est.id_tipo_solicitud",[id_usuario]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en usuarioService.listarIdEscenarioYIdTipoSolicitudPorIdUsuario, " + error.stack;
        throw error;
    }
}

usuarioService.listarSoloUsuarioPorCampoUsuario = async (conn, usuario) => {
    try {
        const queryResponse = await conn.query("select * from dino.tusuario where usuario=$1",[usuario]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en usuarioService.listarSoloUsuarioPorCampoUsuario, " + error.stack;
        throw error;
    }
}

/*
usuarioService.listarIdRolesDeUsuario = async (conn, correo) => {
    try {
        const queryResponse = await conn.query("select est_rol.id_rol, count(*) as cantidad"
        +" from dino.testrategia_rol_usuario est_rol_usu"
        +" join dino.testrategia_rol est_rol on est_rol.id=est_rol_usu.id_estrategia_rol"
        +" join dino.testrategia est on est.id=est_rol.id_estrategia"
        +" join dino.tusuario usuario on usuario.id=est_rol_usu.id_usuario"
        +" join dino.tperfil_usuario perfil_usu on perfil_usu.id=usuario.id_perfil_usuario"
        +" join dino.tarea_usuario area_usu on area_usu.id=usuario.id_area_usuario"
        +" join dino.tescenario_nivel3 nivel3 on nivel3.id=est.id_escenario_nivel3"
        +" join dino.ttipo_solicitud tipo_sol on tipo_sol.id=est.id_tipo_solicitud"
        +" join dino.trol rol on rol.id=est_rol.id_rol"
        +" where usuario.usuario=$1 and est_rol.activo=true"
        +" group by est_rol.id_rol"
        ,[correo]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en usuarioService.listarIdRolesDeUsuario, " + error.stack;
        throw error;
    }
}
*/

/*
usuarioService.listarIdEscenarioNivel3DeUsuario = async (conn, correo) => {
    try {
        const queryResponse = await conn.query("select est.id_escenario_nivel3, count(*) as cantidad"
        +" from dino.testrategia_rol_usuario est_rol_usu"
        +" join dino.testrategia_rol est_rol on est_rol.id=est_rol_usu.id_estrategia_rol"
        +" join dino.testrategia est on est.id=est_rol.id_estrategia"
        +" join dino.tusuario usuario on usuario.id=est_rol_usu.id_usuario"
        +" join dino.tperfil_usuario perfil_usu on perfil_usu.id=usuario.id_perfil_usuario"
        +" join dino.tarea_usuario area_usu on area_usu.id=usuario.id_area_usuario"
        +" join dino.tescenario_nivel3 nivel3 on nivel3.id=est.id_escenario_nivel3"
        +" join dino.ttipo_solicitud tipo_sol on tipo_sol.id=est.id_tipo_solicitud"
        +" join dino.trol rol on rol.id=est_rol.id_rol"
        +" where usuario.usuario=$1 and est_rol.activo=true"
        +" group by est.id_escenario_nivel3"
        ,[correo]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en usuarioService.listarIdEscenarioNivel3DeUsuario, " + error.stack;
        throw error;
    }
}
*/

usuarioService.listarIdTiposSolicitudDeUsuario = async (conn, correo) => {
    try {
        const queryResponse = await conn.query("select est.id_tipo_solicitud, count(*) as cantidad"
        +" from dino.testrategia_rol_usuario est_rol_usu"
        +" join dino.testrategia_rol est_rol on est_rol.id=est_rol_usu.id_estrategia_rol"
        +" join dino.testrategia est on est.id=est_rol.id_estrategia"
        +" join dino.tusuario usuario on usuario.id=est_rol_usu.id_usuario"
        //+" join dino.tperfil_usuario perfil_usu on perfil_usu.id=usuario.id_perfil_usuario"
        +" join dino.tarea_usuario area_usu on area_usu.id=usuario.id_area_usuario"
        +" join dino.tescenario_nivel3 nivel3 on nivel3.id=est.id_escenario_nivel3"
        +" join dino.ttipo_solicitud tipo_sol on tipo_sol.id=est.id_tipo_solicitud"
        +" join dino.trol rol on rol.id=est_rol.id_rol"
        +" where usuario.usuario=$1 and est_rol.activo=true"
        +" group by est.id_tipo_solicitud"
        ,[correo]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en usuarioService.listarIdTiposSolicitudDeUsuario, " + error.stack;
        throw error;
    }
}

usuarioService.listarIdTipoSolicitudYIdRolAgrupadoDeUsuario = async (conn, correo) => {
    try {
        const queryResponse = await conn.query("select est.id_tipo_solicitud, est_rol.id_rol, count(*) as cantidad"
        +" from dino.testrategia_rol_usuario est_rol_usu"
        +" join dino.testrategia_rol est_rol on est_rol.id=est_rol_usu.id_estrategia_rol"
        +" join dino.testrategia est on est.id=est_rol.id_estrategia"
        +" join dino.tusuario usuario on usuario.id=est_rol_usu.id_usuario"
        //+" join dino.tperfil_usuario perfil_usu on perfil_usu.id=usuario.id_perfil_usuario"
        +" join dino.tarea_usuario area_usu on area_usu.id=usuario.id_area_usuario"
        +" join dino.tescenario_nivel3 nivel3 on nivel3.id=est.id_escenario_nivel3"
        +" join dino.ttipo_solicitud tipo_sol on tipo_sol.id=est.id_tipo_solicitud"
        +" join dino.trol rol on rol.id=est_rol.id_rol"
        +" where usuario.usuario=$1 and est_rol.activo=true"
        +" group by est.id_tipo_solicitud, est_rol.id_rol"
        ,[correo]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en usuarioService.listarIdTipoSolicitudYIdRolAgrupadoDeUsuario, " + error.stack;
        throw error;
    }
}

usuarioService.listarDatosEstrategiaDeUsuario = async (conn, correo) => {
    try {
        const queryResponse = await conn.query("select usuario.id, usuario.usuario, usuario.nombre"
        //+", usuario.id_perfil_usuario, perfil_usu.nombre as perfil_usuario_nombre"
        +", usuario.id_area_usuario, area_usu.nombre as area_usuario_nombre"
        +", est.id_escenario_nivel3, nivel3.nombre as escenario_nivel3_nombre"
        +", est.id_tipo_solicitud, tipo_sol.nombre as tipo_solicitud_nombre"
        +", est_rol.id_rol, rol.nombre as rol_nombre"
        +" from dino.testrategia_rol_usuario est_rol_usu"
        +" join dino.testrategia_rol est_rol on est_rol.id=est_rol_usu.id_estrategia_rol"
        +" join dino.testrategia est on est.id=est_rol.id_estrategia"
        +" join dino.tusuario usuario on usuario.id=est_rol_usu.id_usuario"
        //+" join dino.tperfil_usuario perfil_usu on perfil_usu.id=usuario.id_perfil_usuario"
        +" join dino.tarea_usuario area_usu on area_usu.id=usuario.id_area_usuario"
        +" join dino.tescenario_nivel3 nivel3 on nivel3.id=est.id_escenario_nivel3"
        +" join dino.ttipo_solicitud tipo_sol on tipo_sol.id=est.id_tipo_solicitud"
        +" join dino.trol rol on rol.id=est_rol.id_rol"
        +" where usuario.usuario=$1 and est_rol.activo=true",[correo]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en usuarioService.listarDatosEstrategiaDeUsuario, " + error.stack;
        throw error;
    }
}

usuarioService.buscarPorId = async (conn, id) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.tusuario where id=$1",[id]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en usuarioService.buscarPorId, "+error.stack;
        throw error;
    }
}

usuarioService.listarCodigoNivel1UnicoByCorreo = async (conn, correo) => {
    try {
        const queryResponse = await conn.query("select nivel1.codigo, count(*) as cantidad"
        +" from dino.testrategia_rol_usuario est_rol_usu"
        +" join dino.testrategia_rol est_rol on est_rol.id=est_rol_usu.id_estrategia_rol"
        +" join dino.testrategia est on est.id=est_rol.id_estrategia"
        +" join dino.tusuario usuario on usuario.id=est_rol_usu.id_usuario"
        +" join dino.tescenario_nivel3 nivel3 on nivel3.id=est.id_escenario_nivel3"
        +" join dino.tescenario_nivel2 nivel2 on nivel2.id=nivel3.id_escenario_nivel2"
        +" join dino.tescenario_nivel1 nivel1 on nivel1.id=nivel2.id_escenario_nivel1"
        +" where usuario.usuario=$1 and est_rol.activo=true group by nivel1.codigo"
        ,[correo]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en usuarioService.listarCodigoNivel1UnicoByCorreo, "+error.stack;
        throw error;
    }
}

usuarioService.distinctCodigoNivel1YTipoSolicitudByCorreo = async (conn, correo) => {
    try {
        const queryResponse = await conn.query("select distinct nivel1.codigo as nivel1_codigo, est.id_tipo_solicitud, tipo_sol.nombre as tipo_solicitud_nombre"
        +" from dino.testrategia_rol_usuario est_rol_usu"
        +" join dino.testrategia_rol est_rol on est_rol.id=est_rol_usu.id_estrategia_rol"
        +" join dino.testrategia est on est.id=est_rol.id_estrategia"
        +" join dino.tusuario usuario on usuario.id=est_rol_usu.id_usuario"
        +" join dino.tescenario_nivel3 nivel3 on nivel3.id=est.id_escenario_nivel3"
        +" join dino.tescenario_nivel2 nivel2 on nivel2.id=nivel3.id_escenario_nivel2"
        +" join dino.tescenario_nivel1 nivel1 on nivel1.id=nivel2.id_escenario_nivel1"
        +" join dino.ttipo_solicitud tipo_sol on tipo_sol.id=est.id_tipo_solicitud"
        +" where usuario.usuario=$1 and est_rol.activo=true"
        ,[correo]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en usuarioService.distinctCodigoNivel1YTipoSolicitudByCorreo, "+error.stack;
        throw error;
    }
}

usuarioService.listarPerfilesPorCorreo = async (conn, correo) => {
    try {
        const queryResponse = await conn.query("select perfil_usu.* "
        +" from dino.tusuario usuario"
        +" join dino.tusuario_perfil inter on inter.id_usuario=usuario.id"
        +" join dino.tperfil_usuario perfil_usu on perfil_usu.id=inter.id_perfil_usuario"
        +" where usuario.usuario=$1"
        , [correo]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en usuarioService.listarPerfilesPorCorreo, "+error.stack;
        throw error;
    }
}

module.exports = usuarioService;