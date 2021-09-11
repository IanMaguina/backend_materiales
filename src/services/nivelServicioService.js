const service = {};

service.crear = async (conn, id_material_solicitud, valor, error) => {
    try {
        const queryResponse = await conn.query(
            "INSERT INTO dino.tnivel_servicio \
            (id_material_solicitud, valor, error) \
            VALUES($1, $2, $3)", [id_material_solicitud, valor, error]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en nivelServicioService.crear, " + error.stack;
        throw error;
    }
};

service.clonar = async (conn, id_padre, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "INSERT INTO dino.tnivel_servicio( \
            id_material_solicitud, valor, error) \
            SELECT $2, valor, error \
	        FROM dino.tnivel_servicio \
            WHERE id_material_solicitud = $1;", [id_padre, id_material_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en nivelServicioService.clonar, " + error.stack;
        throw error;
    }
};

service.eliminarPorMaterial = async (conn, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "DELETE FROM dino.tnivel_servicio \
            WHERE id_material_solicitud = $1",
            [id_material_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en nivelServicioService.eliminarPorMaterial. Details: " + error.stack;
        throw error;
    }
};

service.listarPorSolicitud = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT id_nivel_servicio, id_material_solicitud, valor, error  \
            FROM dino.tnivel_servicio \
            WHERE id_material_solicitud IN (select id from dino.tmaterial_solicitud where id_solicitud = $1) \
            ORDER BY id_material_solicitud, id_nivel_servicio",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en nivelServicioService.listarPorSolicitud, " + error.stack;
        throw error;
    }
};

service.listarParaEnviarSAP = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT id_material_solicitud, valor \
            FROM dino.tmaterial_solicitud ms \
            INNER JOIN dino.tnivel_servicio ns ON ns.id_material_solicitud = ms.id \
            WHERE ms.id_solicitud = $1",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en nivelServicioService.listarParaEnviarSAP, " + error.stack;
        throw error;
    }
};

service.eliminarPorSolicitud = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "DELETE FROM dino.tnivel_servicio \
            WHERE id_material_solicitud IN (SELECT id FROM dino.tmaterial_solicitud WHERE id_solicitud = $1)",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en nivelServicioService.eliminarPorSolicitud. Details: " + error.stack;
        throw error;
    }
};

module.exports = service;