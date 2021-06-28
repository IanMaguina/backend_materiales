const winston = require('../utils/winston');

const estrategiaRolService = {};

estrategiaRolService.crear = async (conn, estrategiaRol) => {
    try {
        const queryResponse = await conn.query("INSERT INTO dino.testrategia_rol (orden, id_rol, id_estrategia, activo) VALUES($1, $2, $3, $4) RETURNING id",
        [estrategiaRol.orden, estrategiaRol.rol.id, estrategiaRol.estrategia.id, estrategiaRol.activo]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en estrategiaRolService.crear, "+error.stack;
        throw error;
    }
}

estrategiaRolService.listarPorIdRolYIdEstrategiaYOrden = async (conn, id_rol, id_estrategia, orden) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.testrategia_rol est_rol where est_rol.id_rol=$1 and est_rol.id_estrategia=$2 and est_rol.orden=$3",[id_rol,id_estrategia, orden]);
        return queryResponse.rows;
    } catch (error) {
        //winston.info("Error en estrategiaRolService.listarPorIdRolYIdEstrategiaYOrden, ");
        error.stack = "\nError en estrategiaRolService.listarPorIdRolYIdEstrategiaYOrden, "
        throw error;
    }
}

estrategiaRolService.listarUsuariosActivosPorId = async (conn, id) => {
    try {
        const queryResponse = await conn.query("SELECT usuario.id, usuario.usuario, usuario.nombre FROM dino.testrategia_rol est_rol"
        +" join dino.testrategia_rol_usuario est_rol_usu on est_rol_usu.id_estrategia_rol=est_rol.id"
        +" join dino.tusuario usuario on usuario.id=est_rol_usu.id_usuario"
        +" where est_rol_usu.activo=true and est_rol.id=$1",[id]);
        return queryResponse.rows;
    } catch (error) {
        //winston.info("Error en estrategiaRolService.listarUsuariosActivosPorId, ");
        error.stack = "\nError en estrategiaRolService.listarUsuariosActivosPorId, " + error.stack;
        throw error;
    }
}

estrategiaRolService.actualizarActivo = async (conn, estrategiaRol) => {
    try {
        const queryResponse = await conn.query("UPDATE dino.testrategia_rol SET activo=$1 WHERE id=$2",[estrategiaRol.activo, estrategiaRol.id]);
        if(queryResponse && queryResponse.rowCount == 1){
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en estrategiaRolService.actualizarActivo, " + error.stack;
        throw error;
    }
}

estrategiaRolService.actualizar = async (conn, estrategiaRol) => {
    try {
        const queryResponse = await conn.query("UPDATE dino.testrategia_rol SET orden=$1, activo=$2 WHERE id=$3"
        ,[estrategiaRol.orden, estrategiaRol.activo, estrategiaRol.id]);
        if(queryResponse && queryResponse.rowCount == 1){
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en estrategiaRolService.actualizar, " + error.stack;
        throw error;
    }
}

estrategiaRolService.listarPorIdEstrategia = async (conn, id_estrategia) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.testrategia_rol est_rol where est_rol.id_estrategia=$1",[id_estrategia]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en estrategiaRolService.listarPorIdEstrategia, " + error.stack
        throw error;
    }
}

estrategiaRolService.buscarPorId = async (conn, id) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.testrategia_rol est_rol where est_rol.id=$1",[id]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en estrategiaRolService.buscarPorId, " + error.stack
        throw error;
    }
}

module.exports = estrategiaRolService;