const service = {};

service.listar = async (conn, id_escenario_nivel3, id_rol, id_tipo_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT cv.id id_campo_vista , cv.nombre nombre_campo, \
            rcvp.regla_campo, rcvp.orden orden_campo, cv.tipo_objeto, \
            rcvp.valor_defecto, cv.tabla_maestra, \
            cv.tipo_dato, cv.longitud, cv.etiqueta , cv.codigo_interno, \
            REPLACE(SPLIT_PART(CAST (cv.longitud AS text), '.', 2),'0','') longitud_decimal \
            FROM dino.treglas_campo_vista_portal rcvp \
            INNER JOIN dino.tcampo_vista cv ON cv.id = rcvp.id_campo_vista \
            WHERE rcvp.id_escenario_nivel3 = $1 AND rcvp.activo = true \
            AND rcvp.id_rol = $2 \
            AND rcvp.id_tipo_solicitud = $3 \
            AND rcvp.campo_visible = true \
            ORDER BY rcvp.orden", 
            [id_escenario_nivel3, id_rol, id_tipo_solicitud]);
            //ORDER BY rcvp.id_vista_portal, rcvp.orden", 
        return queryResponse.rows;        
    } catch (error) {
        error.stack = "\nError en campoService.listar, " + error.stack;
        throw error;
    }    
};

service.listarDiccionarioDeNombres = async (conn, id_escenario_nivel3, id_rol, id_tipo_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT cv.nombre \
            FROM dino.treglas_campo_vista_portal rcvp \
            INNER JOIN dino.tcampo_vista cv ON cv.id = rcvp.id_campo_vista \
            WHERE rcvp.id_escenario_nivel3 = $1 \
            AND rcvp.activo = true \
            AND rcvp.id_rol = $2 \
            AND rcvp.id_tipo_solicitud = $3 \
            AND rcvp.campo_visible = true \
            ORDER BY rcvp.id_vista_portal, rcvp.orden", 
            [id_escenario_nivel3, id_rol, id_tipo_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en campoService.listarDiccionarioDeNombres, " + error.stack;
        throw error;
    }
    
};

service.listarValoresPorDefecto = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT DISTINCT rcvp.id_campo_vista, cv.codigo_interno, rcvp.valor_defecto \
            FROM dino.tsolicitud s \
            INNER JOIN dino.treglas_campo_vista_portal rcvp ON rcvp.id_escenario_nivel3 = s.id_escenario_nivel3 AND rcvp.id_tipo_solicitud = s.id_tipo_solicitud \
            INNER JOIN dino.tcampo_vista cv ON cv.id = rcvp.id_campo_vista \
            WHERE s.id = $1 AND rcvp.Activo = true AND rcvp.valor_defecto IS NOT NULL AND rcvp.valor_defecto <> '' \
            ORDER BY rcvp.id_campo_vista",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en campoService.listarValoresPorDefecto, " + error.stack;
        throw error;
    }
    
};

service.listarParaValidar = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT DISTINCT rcvp.id_campo_vista, cv.codigo_interno, rcvp.valor_defecto \
            FROM dino.tsolicitud s \
            INNER JOIN dino.treglas_campo_vista_portal rcvp ON rcvp.id_escenario_nivel3 = s.id_escenario_nivel3 AND rcvp.id_tipo_solicitud = s.id_tipo_solicitud \
            INNER JOIN dino.tcampo_vista cv ON cv.id = rcvp.id_campo_vista \
            WHERE s.id = $1 AND rcvp.Activo = true \
            ORDER BY rcvp.id_campo_vista",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en campoService.listarParaValidar, " + error.stack;
        throw error;
    }
    
};

service.listarCamposVisibles = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT c.codigo_interno \
            FROM dino.tsolicitud s \
            INNER JOIN dino.treglas_campo_vista_portal rcvp ON rcvp.id_escenario_nivel3 = s.id_escenario_nivel3 AND rcvp.id_tipo_solicitud = s.id_tipo_solicitud \
            INNER JOIN dino.tcampo_vista c ON c.id = rcvp.id_campo_vista \
            WHERE s.id = $1 AND rcvp.activo = true AND rcvp.campo_visible = true \
            ORDER BY rcvp.id_campo_vista",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en campoService.listarValoresPorDefecto, " + error.stack;
        throw error;
    }
    
};

service.listarCamposDecimales = async (conn) => {
    try {
        const queryResponse = await conn.query(
            "SELECT codigo_interno, SPLIT_PART(TRUNC(longitud, 1)::VARCHAR, '.', 2) \"decimals\" \
            FROM dino.tcampo_vista WHERE tipo_dato = 'NUM' AND tipo_ingreso = 'Individual'",
            []);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en campoService.listarCamposDecimales, " + error.stack;
        throw error;
    }
    
};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query(
            "SELECT cv.* \
            FROM dino.tcampo_vista cv \
            ORDER BY cv.id", 
            []);

        return queryResponse.rows;        
    } catch (error) {
        error.stack = "\nError en campoService.listarTodo, " + error.stack;
        throw error;
    }    
};

module.exports = service;