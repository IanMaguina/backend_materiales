const vistaPortalService = {};

vistaPortalService.listar = async (conn, id_escenario_nivel3, id_rol, id_tipo_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT rcvp.id_vista_portal, vp.nombre nombre_vista, rcvp.regla_vista, \
            cv.id id_campo_vista, cv.nombre nombre_campo, rcvp.regla_campo, \
            rcvp.orden orden_campo, cv.tipo_objeto, rcvp.valor_defecto, cv.tabla_maestra, \
            cv.tipo_dato, cv.longitud, cv.etiqueta, cv.codigo_interno, rcvp.campo_visible, \
            REPLACE(SPLIT_PART(CAST (cv.longitud AS text), '.', 2),'0','') longitud_decimal \
            FROM dino.treglas_campo_vista_portal rcvp \
            INNER JOIN dino.tvista_portal vp ON vp.id = rcvp.id_vista_portal \
            INNER JOIN dino.tcampo_vista cv ON cv.id = rcvp.id_campo_vista \
            WHERE rcvp.id_escenario_nivel3 = $1 \
            AND rcvp.activo = true \
            AND rcvp.campo_visible = true \
            AND rcvp.id_rol = $2 \
            AND rcvp.id_tipo_solicitud = $3 \
            ORDER BY rcvp.id_vista_portal, rcvp.orden", [id_escenario_nivel3, id_rol, id_tipo_solicitud]);

        return queryResponse.rows;        
    } catch (error) {
        error.stack = "\nError en vistaPortalService.listar, " + error.stack;
        throw error;
    }
    
};

vistaPortalService.listarPorSolicitud = async (conn, id_solicitud, id_rol) => {
    try {
        const queryResponse = await conn.query(
            "SELECT cv.codigo_interno \
            FROM dino.tsolicitud s \
            INNER JOIN dino.tescenario_nivel3 e3 ON e3.id = s.id_escenario_nivel3 \
            INNER JOIN dino.treglas_campo_vista_portal rcvp ON rcvp.id_escenario_nivel3 = s.id_escenario_nivel3 \
            INNER JOIN dino.tcampo_vista cv ON cv.id = rcvp.id_campo_vista \
            WHERE s.id = $1 AND rcvp.activo = true AND rcvp.activo = true AND rcvp.id_rol = $2 \
            ORDER BY rcvp.id_vista_portal, rcvp.orden", [id_solicitud, id_rol]);

        return queryResponse.rows;        
    } catch (error) {
        error.stack = "\nError en vistaPortalService.listarPorSolicitud, " + error.stack;
        throw error;
    }
    
};

vistaPortalService.listarParaEnviarSAP = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT DISTINCT vp.id, vp.nombre, rcvp.regla_vista \
            FROM dino.tsolicitud s \
            INNER JOIN dino.treglas_campo_vista_portal rcvp ON rcvp.id_escenario_nivel3 = s.id_escenario_nivel3 \
            AND rcvp.id_tipo_solicitud = s.id_tipo_solicitud \
            INNER JOIN dino.tvista_portal vp ON vp.id = rcvp.id_vista_portal \
            INNER JOIN dino.tcampo_vista cv ON cv.id = rcvp.id_campo_vista \
            WHERE s.id = $1 \
            AND rcvp.activo = true \
			AND (rcvp.campo_visible = true OR \
				 (rcvp.campo_visible = false AND COALESCE(rcvp.valor_defecto, '') <> '')) \
            ORDER BY vp.nombre ", [id_solicitud]);

        return queryResponse.rows;        
    } catch (error) {
        error.stack = "\nError en vistaPortalService.listarParaEnviarSAP, " + error.stack;
        throw error;
    }
    
};

module.exports = vistaPortalService;