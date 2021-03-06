const service = {};

service.listarPorMaterial = async (conn, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT cim.id_material_solicitud, cim.id_clase_inspeccion, cim.clase_inspeccion_borrador, cim.error, ci.nombre \
            FROM dino.tclase_inspeccion_material_solicitud cim \
            LEFT JOIN dino.tclase_inspeccion ci ON ci.id_clase_inspeccion = cim.id_clase_inspeccion \
            WHERE id_material_solicitud = $1 \
            ORDER BY cim.id_material_solicitud, cim.id_clase_inspeccion",
            [id_material_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en claseInspeccionMaterialService.listarPorMaterial, " + error.stack;
        throw error;
    }
};

service.listarPorSolicitud = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT cim.id_material_solicitud, cim.id_clase_inspeccion, cim.clase_inspeccion_borrador, cim.error, ci.nombre, ci.codigo_sap \
            FROM dino.tclase_inspeccion_material_solicitud cim \
            LEFT JOIN dino.tclase_inspeccion ci ON ci.id_clase_inspeccion = cim.id_clase_inspeccion \
            WHERE id_material_solicitud IN (select id from dino.tmaterial_solicitud where id_solicitud = $1) \
            ORDER BY cim.id_material_solicitud, cim.id_clase_inspeccion",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en claseInspeccionMaterialService.listarPorSolicitud, " + error.stack;
        throw error;
    }
};

service.crear = async (conn, id_material_solicitud, id_clase_inspeccion, clase_inspeccion_borrador, error) => {
    try {
        const queryResponse = await conn.query(
            "INSERT INTO dino.tclase_inspeccion_material_solicitud \
            (id_material_solicitud, id_clase_inspeccion, clase_inspeccion_borrador, error) \
            VALUES($1, $2, $3, $4)", [id_material_solicitud, id_clase_inspeccion, clase_inspeccion_borrador, error]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en claseInspeccionMaterialService.crear, " + error.stack;
        throw error;
    }
};

service.clonar = async (conn, id_padre, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "INSERT INTO dino.tclase_inspeccion_material_solicitud( \
            id_material_solicitud, id_clase_inspeccion_borrador, clase_inspeccion_borrador, error) \
            SELECT $2, id_clase_inspeccion_borrador, clase_inspeccion_borrador, error \
            FROM dino.tclase_inspeccion_material_solicitud \
            WHERE id_material_solicitud = $1;", [id_padre, id_material_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en claseInspeccionMaterialService.clonar, " + error.stack;
        throw error;
    }
};

service.crearAmpliacion = async (conn, id, id_material_solicitud) => {
    try {
        console.log('claseInspeccionMaterialService.crearAmpliacion');
        console.log('id: ' + id);
        console.log('id_material_solicitud: ' + id_material_solicitud);

        const queryResponse = await conn.query(
            "INSERT INTO dino.tclase_inspeccion_material_solicitud (id_clase_inspeccion, id_material_solicitud, id_clase_inspeccion_borrador, clase_inspeccion_borrador, error) \
            SELECT id_clase_inspeccion, $2, id_clase_inspeccion_borrador, clase_inspeccion_borrador, error \
            FROM dino.tclase_inspeccion_material_solicitud \
            WHERE id_material_solicitud = $1", [id, id_material_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en claseInspeccionMaterialService.crearAmpliacion, " + error.stack;
        throw error;
    }
};

service.eliminarPorSolicitud = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "DELETE FROM dino.tclase_inspeccion_material_solicitud \
            WHERE id_material_solicitud IN (SELECT id FROM dino.tmaterial_solicitud WHERE id_solicitud = $1)",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en claseInspeccionMaterialService.eliminarPorSolicitud. Details: " + error.stack;
        throw error;
    }
};

service.eliminarPorMaterial = async (conn, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "DELETE FROM dino.tclase_inspeccion_material_solicitud \
            WHERE id_material_solicitud = $1",
            [id_material_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en claseInspeccionMaterialService.eliminarPorMaterial. Details: " + error.stack;
        throw error;
    }
};

service.listarParaEnviarSAP = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT cim.id_material_solicitud, ci.codigo_sap \
            FROM dino.tclase_inspeccion_material_solicitud cim \
            LEFT JOIN dino.tclase_inspeccion ci ON ci.id_clase_inspeccion = cim.id_clase_inspeccion \
            WHERE id_material_solicitud IN (select id from dino.tmaterial_solicitud where id_solicitud = $1) \
            AND error = false \
            ORDER BY cim.id_material_solicitud",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en claseInspeccionMaterialService.listarParaEnviarSAP, " + error.stack;
        throw error;
    }
};

module.exports = service;