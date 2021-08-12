const service = {};

service.crear = async (conn, id_material_solicitud, grupo_planif_necesidades, grupo_planif_necesidades_borrador, error) => {
    try {
        const queryResponse = await conn.query(
            "INSERT INTO dino.tgrupo_planif_necesidades_material_solicitud \
            (id_material_solicitud, grupo_planif_necesidades, grupo_planif_necesidades_borrador, error) \
            VALUES($1, $2, $3, $4)", [id_material_solicitud, grupo_planif_necesidades, grupo_planif_necesidades_borrador, error]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en grupoPlanifNecesidadesMaterialService.crear, " + error.stack;
        throw error;
    }
};

service.eliminarPorMaterial = async (conn, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "DELETE FROM dino.tgrupo_planif_necesidades_material_solicitud \
            WHERE id_material_solicitud = $1",
            [id_material_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en grupoPlanifNecesidadesMaterialService.eliminarPorMaterial. Details: " + error.stack;
        throw error;
    }
};

service.listarPorSolicitud = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT gpnm.id_material_solicitud, gpnm.grupo_planif_necesidades, gpnm.grupo_planif_necesidades_borrador, gpnm.error, gpn.nombre \
            FROM dino.tgrupo_planif_necesidades_material_solicitud gpnm \
            LEFT JOIN dino.tgrupo_planif_necesidades gpn ON gpn.codigo_sap = gpnm.grupo_planif_necesidades  \
            WHERE id_material_solicitud IN (select id from dino.tmaterial_solicitud where id_solicitud = $1) \
            ORDER BY gpnm.id_material_solicitud, gpnm.grupo_planif_necesidades",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en grupoPlanifNecesidadesMaterialService.listarPorSolicitud, " + error.stack;
        throw error;
    }
};

service.eliminarPorSolicitud = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "DELETE FROM dino.tgrupo_planif_necesidades_material_solicitud \
            WHERE id_material_solicitud IN (SELECT id FROM dino.tmaterial_solicitud WHERE id_solicitud = $1)",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en grupoPlanifNecesidadesMaterialService.eliminarPorSolicitud. Details: " + error.stack;
        throw error;
    }
};

module.exports = service;