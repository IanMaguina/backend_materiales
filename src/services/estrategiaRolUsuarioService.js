const winston = require('../utils/winston');
const Rol = require('../domain/rol');
const EstrategiaRol = require('../domain/estrategiaRol');
const Usuario = require('../domain/usuario');
const EstrategiaRolUsuario = require('../domain/estrategiaRolUsuario');
const estrategiaRolUsuarioService = {};

function extractEstrategiaRolUsuarioFromResponse(aRow){
    const rol = new Rol();
    rol.id = aRow.rol_id;
    rol.nombre = aRow.rol_nombre;
    const estrategiaRol = new EstrategiaRol();
    estrategiaRol.id = aRow.id_estrategia_rol;
    estrategiaRol.orden = aRow.estrategia_rol_orden;
    estrategiaRol.rol = rol;
    estrategiaRol.activo = aRow.estrategia_rol_activo;
    const usuario = new Usuario();
    usuario.id = aRow.id_usuario;
    usuario.usuario = aRow.usuario_usuario;
    usuario.nombre = aRow.usuario_nombre;
    const estrategiaRolUsuario = new EstrategiaRolUsuario();
    estrategiaRolUsuario.activo = aRow.activo;
    estrategiaRolUsuario.estrategia_rol = estrategiaRol;
    estrategiaRolUsuario.usuario = usuario;
    return estrategiaRolUsuario;
}

estrategiaRolUsuarioService.listarPorIdEstrategia = async (conn, id_estrategia) => {
    try {
        const queryResponse = await conn.query(
        "SELECT est_rol_usu.*, est_rol.orden as estrategia_rol_orden, est_rol.activo as estrategia_rol_activo"
        +", rol.id as rol_id, rol.nombre as rol_nombre, usuario.usuario as usuario_usuario, usuario.nombre as usuario_nombre"
        +" FROM dino.testrategia_rol_usuario est_rol_usu"
        +" join dino.testrategia_rol est_rol on est_rol.id=est_rol_usu.id_estrategia_rol"
        +" join dino.trol rol on rol.id=est_rol.id_rol"
        +" join dino.tusuario usuario on usuario.id=est_rol_usu.id_usuario"
        +" where est_rol.id_estrategia=$1 and est_rol_usu.activo is not null"
        +" order by est_rol.orden"
        ,[id_estrategia]);
        let response = [];
        for(let i=0;i < queryResponse.rows.length;i++){
            response.push(extractEstrategiaRolUsuarioFromResponse(queryResponse.rows[i]));
        }
        return response;
    } catch (error) {
        error.stack = "\nError en estrategiaRolUsuarioService.listarPorIdEstrategiaRol" + error.stack;
        throw error;
    }
}

estrategiaRolUsuarioService.crear = async (conn, estrategiaRolUsuario) => {
    try {
        const queryResponse = await conn.query("INSERT INTO dino.testrategia_rol_usuario (id_usuario, id_estrategia_rol, activo) VALUES($1, $2, $3) RETURNING id_usuario"
        ,[estrategiaRolUsuario.usuario.id, estrategiaRolUsuario.estrategia_rol.id, estrategiaRolUsuario.activo]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en estrategiaRolUsuarioService.crear, "+error.stack;
        throw error;
    }
}

estrategiaRolUsuarioService.listarPorIdEstrategiaRol = async (conn, id_estrategia_rol) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.testrategia_rol_usuario est_rol_usu where est_rol_usu.id_estrategia_rol=$1",[id_estrategia_rol]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en estrategiaRolUsuarioService.listarPorIdEstrategiaRol, "+error.stack;
        throw error;
    }
}

estrategiaRolUsuarioService.listarSoloEstrategiaRolUsuarioPorIdEstrategia = async (conn, id_estrategia) => {
    try {
        const queryResponse = await conn.query("SELECT est_rol_usu.* FROM dino.testrategia est"
        +" join dino.testrategia_rol est_rol on est_rol.id_estrategia=est.id"
        +" join dino.testrategia_rol_usuario est_rol_usu on est_rol_usu.id_estrategia_rol=est_rol.id"
        +" where est.id=$1"
        ,[id_estrategia]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en estrategiaRolUsuarioService.listarSoloEstrategiaRolUsuarioPorIdEstrategia, "+error.stack;
        throw error;
    }
}

estrategiaRolUsuarioService.listarEstrategiaRolUsuarioYEstrategiaRolPorIdEstrategia = async (conn, id_estrategia) => {
    try {
        const queryResponse = await conn.query("SELECT est_rol_usu.*, est_rol.orden as estrategia_rol_orden, est_rol.activo as estrategia_rol_activo"
        +", est_rol.id_rol, est_rol.id_estrategia"
        +" FROM dino.testrategia_rol est_rol"
        +" join dino.testrategia_rol_usuario est_rol_usu on est_rol_usu.id_estrategia_rol=est_rol.id"
        +" where est_rol.id_estrategia=$1 and est_rol.activo=true;"
        ,[id_estrategia]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en estrategiaRolUsuarioService.listarEstrategiaRolUsuarioYEstrategiaRolPorIdEstrategia, "+error.stack;
        throw error;
    }
}

estrategiaRolUsuarioService.actualizarActivo = async (conn, estrategiaRolUsuario) => {
    try {
        const queryResponse = await conn.query("UPDATE dino.testrategia_rol_usuario SET activo=$1 WHERE id_estrategia_rol=$2 and id_usuario=$3"
        ,[estrategiaRolUsuario.activo, estrategiaRolUsuario.estrategia_rol.id, estrategiaRolUsuario.usuario.id]);
        if(queryResponse && queryResponse.rowCount == 1){
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en estrategiaRolUsuarioService.actualizarActivo, " + error.stack;
        throw error;
    }
}

estrategiaRolUsuarioService.borrar = async (conn, estrategiaRolUsuario) => {
    try {
        const queryResponse = await conn.query("DELETE FROM dino.testrategia_rol_usuario WHERE id_estrategia_rol=$1 and id_usuario=$2"
        ,[estrategiaRolUsuario.estrategia_rol.id, estrategiaRolUsuario.usuario.id]);
        if(queryResponse && queryResponse.rowCount == 1){
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en estrategiaRolUsuarioService.borrar, " + error.stack;
        throw error;
    }
}

estrategiaRolUsuarioService.buscarPorId = async (conn, id_estrategia_rol, id_usuario) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.testrategia_rol_usuario est_rol_usu where est_rol_usu.id_estrategia_rol=$1 and est_rol_usu.id_usuario=$2"
        ,[id_estrategia_rol, id_usuario]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en estrategiaRolUsuarioService.buscarPorId, " + error.stack;
        throw error;
    }
}

estrategiaRolUsuarioService.listarRolYUsuarioPorIdEscenarioNivel3YIdTipoSolicitud =  async (conn, id_escenario_nivel3, id_tipo_solicitud) => {
    try {
        const queryResponse = await conn.query("SELECT est_rol_usu.id_usuario, usu.nombre as nombre_usuario, usu.usuario as correo_usuario, est_rol.orden, est_rol.id_rol, rol.nombre as nombre_rol"
        +", est_rol.aprobar_enviar_correo, est_rol.rechazar_enviar_correo"
        +" FROM dino.testrategia estrategia join dino.testrategia_rol est_rol on estrategia.id=est_rol.id_estrategia"
        +" join dino.testrategia_rol_usuario est_rol_usu on est_rol.id=est_rol_usu.id_estrategia_rol"
        +" join dino.tusuario usu on usu.id=est_rol_usu.id_usuario"
        +" join dino.trol rol on rol.id=est_rol.id_rol"
        +" where estrategia.id_escenario_nivel3=$1 and estrategia.id_tipo_solicitud=$2"
        +" and est_rol.activo=true and est_rol_usu.activo=true order by est_rol.orden"
        , [id_escenario_nivel3, id_tipo_solicitud]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en estrategiaRolUsuarioService.listarRolYUsuarioPorIdEscenarioNivel3YIdTipoSolicitud, " + error.stack;
        throw error;
    }
}

module.exports = estrategiaRolUsuarioService;