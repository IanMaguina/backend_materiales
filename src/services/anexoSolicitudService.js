const anexoSolicitudService = {};

anexoSolicitudService.crear = async (conn, anexoSolicitud) => {
    try {
        const queryResponse = await conn.query("INSERT INTO dino.tanexo_solicitud (id_solicitud, ruta_anexo, nombre) VALUES($1, $2, $3) RETURNING id"
        ,[anexoSolicitud.id_solicitud, anexoSolicitud.ruta_anexo, anexoSolicitud.nombre]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en anexoSolicitudService.crear, "+error.stack;
        throw error;
    }
}

anexoSolicitudService.crearxRol = async (conn, anexoSolicitud) => {
    try {
        const queryResponse = await conn.query("INSERT INTO dino.tanexo_solicitud (id_solicitud, ruta_anexo, nombre, id_rol, etiqueta) VALUES($1, $2, $3, $4, $5) RETURNING id"
        ,[anexoSolicitud.id_solicitud, anexoSolicitud.ruta_anexo, anexoSolicitud.nombre, anexoSolicitud.id_rol, anexoSolicitud.etiqueta]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en anexoSolicitudService.crear, "+error.stack;
        throw error;
    }
}

anexoSolicitudService.buscarPorIdSolicitud = async (conn, id_solicitud) => {
    try {
        //const queryResponse = await conn.query("select * from dino.tanexo_solicitud where id_solicitud=$1", [id_solicitud]);

        const queryResponse = await conn.query("select anexo.id, anexo.id_solicitud, anexo.nombre, anexo.etiqueta, anexo.ruta_anexo, \
        anexo.id_rol, rol.nombre nombre_rol  \
        from dino.tanexo_solicitud anexo \
        JOIN dino.trol rol ON anexo.id_rol =rol.id \
        where id_solicitud=$1", [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en anexoSolicitudService.buscarPorIdSolicitud, "+error.stack;
        throw error;
    }
}

anexoSolicitudService.borrarPorIdSolicitud = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query("DELETE FROM dino.tanexo_solicitud where id_solicitud=$1", [id_solicitud]);
        if(queryResponse && queryResponse.rowCount == 1){
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en anexoSolicitudService.buscarPorIdSolicitud, "+error.stack;
        throw error;
    }
}

anexoSolicitudService.borrarPorIdAnexoSolicitud = async (conn, id_anexo_solicitud) => {
    try {
        const queryResponse = await conn.query("DELETE FROM dino.tanexo_solicitud where id=$1", [id_anexo_solicitud]);
        if(queryResponse && queryResponse.rowCount == 1){
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en anexoSolicitudService.buscarPorIdSolicitud, "+error.stack;
        throw error;
    }
}

module.exports = anexoSolicitudService;