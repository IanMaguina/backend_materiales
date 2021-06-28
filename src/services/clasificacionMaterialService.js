const service = {};

service.listarPorMaterial = async (conn, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT cm.id_material_solicitud, cm.id_clasificacion, cm.clasificacion_borrador, cm.error, c.nombre \
            FROM dino.tclasificacion_material_solicitud cm \
            LEFT JOIN dino.tclasificacion c ON c.id_clasificacion = cm.id_clasificacion \
            WHERE id_material_solicitud = $1 \
            ORDER BY cm.id_material_solicitud, cm.id_clasificacion",            
            [id_material_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en clasificacionMaterialService.listarPorMaterial, " + error.stack;
        throw error;
    }
};

service.listarPorSolicitud = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT cm.id_material_solicitud, cm.id_clasificacion, cm.clasificacion_borrador, cm.error, c.nombre, c.codigo_sap \
            FROM dino.tclasificacion_material_solicitud cm \
            LEFT JOIN dino.tclasificacion c ON c.id_clasificacion = cm.id_clasificacion \
            WHERE id_material_solicitud IN (select id from dino.tmaterial_solicitud where id_solicitud = $1) \
            ORDER BY cm.id_material_solicitud, cm.id_clasificacion",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en clasificacionMaterialService.listarPorSolicitud, " + error.stack;
        throw error;
    }
};

service.crear = async (conn, id_material_solicitud, id_clasificacion, clasificacion_borrador, error) => {
    try {
        const queryResponse = await conn.query(
            "INSERT INTO dino.tclasificacion_material_solicitud \
            (id_material_solicitud, id_clasificacion, clasificacion_borrador, error) \
            VALUES($1, $2, $3, $4)", [id_material_solicitud, id_clasificacion, clasificacion_borrador, error]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en clasificacionMaterialService.crear, " + error.stack;
        throw error;
    }
};

service.eliminarPorSolicitud = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "DELETE FROM dino.tclasificacion_material_solicitud \
            WHERE id_material_solicitud IN (SELECT id FROM dino.tmaterial_solicitud WHERE id_solicitud = $1)",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en clasificacionMaterialService.eliminarPorSolicitud. Details: " + error.stack;
        throw error;
    }
};

service.eliminarPorMaterial = async (conn, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "DELETE FROM dino.tclasificacion_material_solicitud \
            WHERE id_material_solicitud = $1",
            [id_material_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en clasificacionMaterialService.eliminarPorMaterial. Details: " + error.stack;
        throw error;
    }
};

module.exports = service;