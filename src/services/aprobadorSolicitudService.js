const service = {};

service.obtenerFechaActual = async (conn) => {
    try {
        const queryResponse = await conn.query("select now()::timestamp as fecha", []);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en aprobadorSolicitudService.obtenerFechaActual, " + error.stack;
        throw error;
    }
};

service.crearFlujo = async (conn, aprobadorSolicitud) => {
    try {
        // para fecha_ingreso
        let queryFechaIngreso = null;
        if (aprobadorSolicitud.fecha_ingreso) {
            queryFechaIngreso = "TO_TIMESTAMP($16, 'YYYY-MM-DD HH24:MI:SS')";
        } else {
            queryFechaIngreso = "$16";
        }
        console.log("queryFechaIngreso: " + queryFechaIngreso);
        const queryResponse = await conn.query("INSERT INTO dino.taprobador_solicitud (id_solicitud, orden, id_usuario_aprobador, id_rol, aprobar_enviar_correo, rechazar_enviar_correo, esta_aqui"
            + ",nombre_usuario_aprobador, correo_usuario, nombre_rol, id_estado, nombre_estado, id_usuario_real, nombre_usuario_real, correo_usuario_real"
            + ",fecha_ingreso, tipo, estado_completado"
            + ") VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15"
            + ", " + queryFechaIngreso + ", 'F', false) RETURNING id"
            , [aprobadorSolicitud.solicitud.id, aprobadorSolicitud.orden, aprobadorSolicitud.id_usuario_aprobador, aprobadorSolicitud.id_rol
                , aprobadorSolicitud.aprobar_enviar_correo, aprobadorSolicitud.rechazar_enviar_correo, aprobadorSolicitud.esta_aqui
                , aprobadorSolicitud.nombre_usuario_aprobador, aprobadorSolicitud.correo_usuario, aprobadorSolicitud.nombre_rol, aprobadorSolicitud.id_estado, aprobadorSolicitud.nombre_estado
                , aprobadorSolicitud.id_usuario_real, aprobadorSolicitud.nombre_usuario_real, aprobadorSolicitud.correo_usuario_real
                , aprobadorSolicitud.fecha_ingreso]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en aprobadorSolicitudService.crearFlujo, " + error.stack;
        throw error;
    }
};

service.crearSeguimiento = async (conn, aprobadorSolicitud) => {
    try {
        // para fecha_ingreso
        let queryFechaIngreso = null;
        if (aprobadorSolicitud.fecha_ingreso) {
            queryFechaIngreso = "TO_TIMESTAMP($9, 'YYYY-MM-DD HH24:MI:SS')";
        } else {
            queryFechaIngreso = "$9";
        }
        console.log("queryFechaIngreso: " + queryFechaIngreso);
        const queryResponse = await conn.query(
            "INSERT INTO dino.taprobador_solicitud (id_solicitud, id_estado_real, nombre_estado_real, id_rol_real, nombre_rol_real"
            + ", id_usuario_real, nombre_usuario_real, correo_usuario_real,fecha_ingreso, motivo, id_motivo_rechazo, nombre_motivo_rechazo, tipo"
            + ") VALUES($1, $2, $3, $4, $5, $6, $7, $8, " + queryFechaIngreso + ", $10, $11, $12, 'S') RETURNING id"
            , [aprobadorSolicitud.solicitud.id, aprobadorSolicitud.id_estado_real, aprobadorSolicitud.nombre_estado_real, aprobadorSolicitud.id_rol_real, aprobadorSolicitud.nombre_rol_real
                , aprobadorSolicitud.id_usuario_real, aprobadorSolicitud.nombre_usuario_real, aprobadorSolicitud.correo_usuario_real, aprobadorSolicitud.fecha_ingreso, aprobadorSolicitud.motivo
                , aprobadorSolicitud.id_motivo_rechazo, aprobadorSolicitud.nombre_motivo_rechazo
            ]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en aprobadorSolicitudService.crearSeguimiento, " + error.stack;
        throw error;
    }
};

service.obtenerNotificador = async (conn, id_solicitud, id_rol) => {
    try {
        const queryResponse = await conn.query(
            "SELECT orden, aprobar_enviar_correo, rechazar_enviar_correo \
    FROM dino.taprobador_solicitud t \
    WHERE t.id_solicitud = $1 AND id_rol = $2", [id_solicitud, id_rol]);

        if (queryResponse.rows.length > 0) {
            return queryResponse.rows[0];
        } else {
            return null;
        }
    } catch (error) {
        error.stack = "\nError en aprobadorSolicitudService.obtenerPorIdRol, " + error.stack;
        throw error;
    }
};

service.obtenerDestinatarios = async (conn, id_solicitud, orden) => {
    try {
        const queryResponse = await conn.query(
            "SELECT u.usuario \
            FROM dino.taprobador_solicitud t \
            INNER JOIN dino.tusuario u ON u.id = t.id_usuario_aprobador AND u.activo = true \
            WHERE t.id_solicitud = $1 AND orden = $2", [id_solicitud, orden]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en aprobadorSolicitudService.obtenerPorIdRol, " + error.stack;
        throw error;
    }
};

service.listarPorIdSolicitudOrdenadoPorOrden = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.taprobador_solicitud WHERE id_solicitud=$1 ORDER BY orden", [id_solicitud]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en aprobadorSolicitudService.listarPorIdSolicitudOrdenadoPorOrden, " + error.stack;
        throw error;
    }
};

service.listarFlujoPorIdSolicitudOrdenadoPorOrden = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.taprobador_solicitud WHERE id_solicitud=$1 AND tipo='F' ORDER BY orden", [id_solicitud]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en aprobadorSolicitudService.listarFlujoPorIdSolicitudOrdenadoPorOrden, " + error.stack;
        throw error;
    }
};

service.listarSeguimientoPorIdSolicitudOrdenadoPorId = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.taprobador_solicitud WHERE id_solicitud=$1 AND tipo='S' ORDER BY id", [id_solicitud]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en aprobadorSolicitudService.listarSeguimientoPorIdSolicitudOrdenadoPorId, " + error.stack;
        throw error;
    }
};

service.actualizarEstaAqui = async (conn, esta_aqui, id_solicitud, id_rol, orden) => {
    try {
        const queryResponse = await conn.query("UPDATE dino.taprobador_solicitud SET esta_aqui=$1 WHERE id_solicitud=$2 and id_rol=$3 and orden=$4",
            [esta_aqui, id_solicitud, id_rol, orden]);
        //console.log("queryResponse: ", queryResponse);
        if (queryResponse && queryResponse.rowCount == 1) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en aprobadorSolicitudService.actualizarEstaAqui, " + error.stack;
        throw error;
    }
};

service.actualizarEstaAquiPorId = async (conn, esta_aqui, id) => {
    try {
        const queryResponse = await conn.query("UPDATE dino.taprobador_solicitud SET esta_aqui=$1 WHERE id=$2",
            [esta_aqui, id]);
        console.log("actualizarEstaAquiPorId, queryResponse.rowCount:", queryResponse.rowCount);
        if (queryResponse && queryResponse.rowCount == 1) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en aprobadorSolicitudService.actualizarEstaAquiPorId, " + error.stack;
        throw error;
    }
};

service.blanquearAprobacionesSuperiores = async (conn, id_solicitud, id) => {
    try {console.log(id_solicitud);
        console.log(id);
        const queryResponse = await conn.query(
            "UPDATE dino.taprobador_solicitud SET \
            fecha_ingreso = null, fecha_salida = null, estado_completado = false, id_estado_real=null, \
            nombre_estado_real = null, id_rol_real = null, nombre_rol_real = null, id_usuario_real = null, \
            nombre_usuario_real = null, correo_usuario_real = null, motivo = null, duracion = null \
            WHERE id_solicitud = $1 AND id > $2 AND tipo = 'F'",
            [id_solicitud, id]);
            console.log("blanquearFechasSuperiores, queryResponse.rowCount:", queryResponse.rowCount);
        if (queryResponse && queryResponse.rowCount == 1) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en aprobadorSolicitudService.blanquearFechasSuperiores, " + error.stack;
        throw error;
    }
};

service.actualizarFlujo = async (conn, aprobadorSolicitud) => {
    try {
        // para fecha_ingreso
        let queryFechaIngreso = null;
        if (aprobadorSolicitud.fecha_ingreso) {
            queryFechaIngreso = "TO_TIMESTAMP($8, 'YYYY-MM-DD HH24:MI:SS')";
        } else {
            queryFechaIngreso = "$8";
        }
        console.log("queryFechaIngreso: " + queryFechaIngreso);
        // fecha_salida
        let queryFechaSalida = null;
        if (aprobadorSolicitud.fecha_salida) {
            queryFechaSalida = "TO_TIMESTAMP($9, 'YYYY-MM-DD HH24:MI:SS')";
        } else {
            queryFechaSalida = "$9";
        }
        console.log("queryFechaSalida: " + queryFechaSalida);
        const queryResponse = await conn.query("UPDATE dino.taprobador_solicitud SET id_estado_real=$1, nombre_estado_real=$2, id_rol_real=$3, nombre_rol_real=$4"
            + ", id_usuario_real=$5, nombre_usuario_real=$6, correo_usuario_real=$7, fecha_ingreso=" + queryFechaIngreso
            + ", fecha_salida=" + queryFechaSalida + ", estado_completado=$10, motivo=$11, duracion=$12"
            + " WHERE id=$13"
            , [aprobadorSolicitud.id_estado_real, aprobadorSolicitud.nombre_estado_real, aprobadorSolicitud.id_rol_real, aprobadorSolicitud.nombre_rol_real
                , aprobadorSolicitud.id_usuario_real, aprobadorSolicitud.nombre_usuario_real, aprobadorSolicitud.correo_usuario_real, aprobadorSolicitud.fecha_ingreso
                , aprobadorSolicitud.fecha_salida, aprobadorSolicitud.estado_completado, aprobadorSolicitud.motivo, aprobadorSolicitud.duracion
                , aprobadorSolicitud.id]);
        console.log("queryResponse.rowCount:", queryResponse.rowCount);
        if (queryResponse && queryResponse.rowCount == 1) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en aprobadorSolicitudService.actualizarFlujo, " + error.stack;
        throw error;
    }
};

service.actualizarSeguimiento = async (conn, aprobadorSolicitud) => {
    try {
        // fecha_salida
        let queryFechaSalida = null;
        if (aprobadorSolicitud.fecha_salida) {
            queryFechaSalida = "TO_TIMESTAMP($1, 'YYYY-MM-DD HH24:MI:SS')";
        } else {
            queryFechaSalida = "$1";
        }
        console.log("queryFechaSalida: " + queryFechaSalida);
        const queryResponse = await conn.query("UPDATE dino.taprobador_solicitud SET fecha_salida=" + queryFechaSalida + ", duracion=$2"
            + " WHERE id=$3"
            , [aprobadorSolicitud.fecha_salida, aprobadorSolicitud.duracion, aprobadorSolicitud.id]);
        if (queryResponse && queryResponse.rowCount == 1) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en aprobadorSolicitudService.actualizarSeguimiento, " + error.stack;
        throw error;
    }
};

service.listarParaValidar = async (conn, id_solicitud, id_usuario) => {
    try {
        const queryResponse = await conn.query(
            "SELECT id_usuario_aprobador, fecha_ingreso, fecha_salida \
            FROM dino.taprobador_solicitud \
            WHERE id_solicitud = $1 AND tipo = 'F' AND id_usuario_aprobador = $2 \
            AND fecha_ingreso IS NOT null AND fecha_salida IS null",
            [id_solicitud, id_usuario]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en aprobadorSolicitudService.listarPorDenominacion. Details: " + error.stack;
        throw error;
    }
};

service.listarParaNotificarRespuestaSAP = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT correo_usuario correo FROM dino.taprobador_solicitud \
            WHERE id_solicitud = $1 AND tipo = 'F' \
            UNION \
            SELECT ec.correo FROM dino.tsolicitud s \
            INNER JOIN dino.testrategia e ON e.id_escenario_nivel3 = s.id_escenario_nivel3 \
            AND e.id_tipo_solicitud = s.id_tipo_solicitud \
            INNER JOIN dino.testrategia_correo ec ON ec.id_estrategia = e.id \
            WHERE s.id = $1", [id_solicitud]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en aprobadorSolicitudService.listarParaNotificarRespuestaSAP, " + error.stack
        throw error;
    }
}

module.exports = service;