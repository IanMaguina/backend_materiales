const service = {};

service.crear = async (conn, id_material_solicitud, id_modelo_pronostico, modelo_pronostico_borrador, error) => {
    try {
        const queryResponse = await conn.query(
            "INSERT INTO dino.tmodelo_pronostico_material_solicitud \
            (id_material_solicitud, id_modelo_pronostico, modelo_pronostico_borrador, error) \
            VALUES($1, $2, $3, $4)", [id_material_solicitud, id_modelo_pronostico, modelo_pronostico_borrador, error]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en modeloPronosticoMaterialService.crear, " + error.stack;
        throw error;
    }
};

service.eliminarPorMaterial = async (conn, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "DELETE FROM dino.tmodelo_pronostico_material_solicitud \
            WHERE id_material_solicitud = $1",
            [id_material_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en modeloPronosticoMaterialService.eliminarPorMaterial. Details: " + error.stack;
        throw error;
    }
};

service.listarPorSolicitud = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT mpm.id_material_solicitud, mpm.id_modelo_pronostico, mpm.modelo_pronostico_borrador, mpm.error, mp.nombre \
            FROM dino.tmodelo_pronostico_material_solicitud mpm \
            LEFT JOIN dino.tmodelo_pronostico mp ON mp.id_modelo_pronostico = mpm.id_modelo_pronostico  \
            WHERE id_material_solicitud IN (select id from dino.tmaterial_solicitud where id_solicitud = $1) \
            ORDER BY mpm.id_material_solicitud, mp.codigo_sap",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en modeloPronosticoMaterialService.listarPorSolicitud, " + error.stack;
        throw error;
    }
};

service.eliminarPorSolicitud = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "DELETE FROM dino.tmodelo_pronostico_material_solicitud \
            WHERE id_material_solicitud IN (SELECT id FROM dino.tmaterial_solicitud WHERE id_solicitud = $1)",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en modeloPronosticoMaterialService.eliminarPorSolicitud. Details: " + error.stack;
        throw error;
    }
};

module.exports = service;