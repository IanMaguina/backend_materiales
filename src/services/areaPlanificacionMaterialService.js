const service = {};

service.listarPorMaterial = async (conn, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT apm.id_material_solicitud, apm.area_planificacion, apm.area_planificacion_borrador, apm.error, ap.nombre \
            FROM dino.tarea_planificacion_material_solicitud apm \
            LEFT JOIN dino.tarea_planificacion ap ON ap.codigo_sap = apm.area_planificacion \
            WHERE id_material_solicitud = $1 \
            ORDER BY apm.id_material_solicitud, apm.area_planificacion",
            [id_material_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en areaPlanificacionMaterialService.listarPorMaterial, " + error.stack;
        throw error;
    }
};

service.listarPorSolicitud = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT apm.id_material_solicitud, apm.area_planificacion, apm.area_planificacion_borrador, apm.error, ap.nombre \
            FROM dino.tarea_planificacion_material_solicitud apm \
            LEFT JOIN dino.tarea_planificacion ap ON ap.codigo_sap = apm.area_planificacion \
            WHERE id_material_solicitud IN (select id from dino.tmaterial_solicitud where id_solicitud = $1) \
            ORDER BY apm.id_material_solicitud, apm.area_planificacion",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en areaPlanificacionMaterialService.listarPorSolicitud, " + error.stack;
        throw error;
    }
};

service.listarParaEnviarSAP = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT apm.id_material_solicitud, apm.area_planificacion, ms.centro_codigo_sap, ms.grupo_planif_necesidades, \
            ms.tipo_mrp_caract_plani, ms.planif_necesidades, ms.calculo_tamano_lote, ms.alm_aprov_ext_pn2_almacen, \
            ms.plaza_entrega_prev, ms.nivel_servicio_pn2, ms.stock_seguridad_pn2, ms.modelo_pronostico, ms.periodo_pasado, \
            ms.periodo_pronostico, ms.limite_alarma \
            FROM dino.tmaterial_solicitud ms \
            INNER JOIN dino.tarea_planificacion_material_solicitud apm ON apm.id_material_solicitud = ms.id \
            WHERE ms.id_solicitud = $1",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en areaPlanificacionMaterialService.listarParaEnviarSAP, " + error.stack;
        throw error;
    }
};

service.crear = async (conn, id_material_solicitud, area_planificacion, area_planificacion_borrador, error) => {
    try {
        const queryResponse = await conn.query(
            "INSERT INTO dino.tarea_planificacion_material_solicitud \
            (id_material_solicitud, area_planificacion, area_planificacion_borrador, error) \
            VALUES($1, $2, $3, $4)", [id_material_solicitud, area_planificacion, area_planificacion_borrador, error]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en areaPlanificacionService.crear, " + error.stack;
        throw error;
    }
};

service.eliminarPorSolicitud = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "DELETE FROM dino.tarea_planificacion_material_solicitud \
            WHERE id_material_solicitud IN (SELECT id FROM dino.tmaterial_solicitud WHERE id_solicitud = $1)",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en areaPlanificacionMaterialService.eliminarPorSolicitud. Details: " + error.stack;
        throw error;
    }
};

service.eliminarPorMaterial = async (conn, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "DELETE FROM dino.tarea_planificacion_material_solicitud \
            WHERE id_material_solicitud = $1",
            [id_material_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en areaPlanificacionMaterialService.eliminarPorMaterial. Details: " + error.stack;
        throw error;
    }
};

module.exports = service;