const winston = require('../utils/winston');

const service = {};

service.listarNoEstanEnLaListaIds = async (conn, listaIds) => {
    try {
        let whereCondition = "";
        let idsString = "";
        if (listaIds.length > 0) {
            whereCondition = whereCondition + " where rol.id not in (";
            for (let i = 0; i < listaIds.length; i++) {
                idsString = idsString + "$" + (i + 1);
                if ((i + 1) < listaIds.length) {
                    idsString = idsString + ","
                }
            }
            whereCondition = whereCondition + idsString + ")";
        }
        winston.info("idsString:", idsString);
        const queryResponse = await conn.query("SELECT * FROM dino.trol rol" + whereCondition + " order by rol.id", listaIds);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en rolService.listarNoEstanEnLaListaIds, " + error.stack;
        throw error;
    }
}

service.listarRolesActivosDeEstrategiaSinUsuarioExceptoSolicitantePorIdEstrategia = async (conn, id_estrategia) => {
    try {
        const queryResponse = await conn.query("(SELECT est_rol.id, rol.nombre FROM dino.testrategia_rol est_rol join dino.trol rol on est_rol.id_rol=rol.id where est_rol.id_rol in (1,6) and est_rol.id_estrategia=$1 and est_rol.activo=true) UNION"
            + " (SELECT distinct est_rol.id, rol.nombre FROM dino.testrategia_rol est_rol"
            + " join dino.trol rol on est_rol.id_rol=rol.id"
            + " left join dino.testrategia_rol_usuario est_rol_usu on est_rol_usu.id_estrategia_rol=est_rol.id"
            + " where est_rol.id_estrategia=$2 and est_rol.activo=true and est_rol_usu.id_usuario is null order by est_rol.id)"
            , [id_estrategia, id_estrategia]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en rolService.listarRolesDeEstrategiaSinUsuarioExceptoSolicitantePorIdEstrategia, " + error.stack;
        throw error;
    }
}

service.buscarPorNombre = async (conn, rol_nombre) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.trol WHERE nombre=$1", [rol_nombre]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en rolService.buscarPorNombre, " + error.stack;
        throw error;
    }
}

service.buscarPorId = async (conn, id) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.trol WHERE id=$1", [id]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en rolService.buscarPorId, " + error.stack;
        throw error;
    }
}

service.listarRolesAnteriores = async (conn, id_solicitud, orden) => {
    try {
        const queryResponse = await conn.query(
            "select id_rol, nombre_rol from ( SELECT DISTINCT id_rol, nombre_rol, orden \
            FROM dino.taprobador_solicitud \
            WHERE id_solicitud = $1 AND tipo = 'F' \
            AND orden <= $2 AND id_rol <> 2 ) arsa \
            ORDER BY orden", [id_solicitud, orden]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en rolService.buscarRolesAnteriores, " + error.stack;
        throw error;
    }
}

module.exports = service;