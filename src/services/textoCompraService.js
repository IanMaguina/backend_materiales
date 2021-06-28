const service = {};

service.listarPorSolicitud = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT tc.id_material_solicitud, tc.id_texto_compra, tc.texto, tc.error \
            FROM dino.ttexto_compras tc \
            WHERE id_material_solicitud IN (select id from dino.tmaterial_solicitud where id_solicitud = $1) \
            ORDER BY tc.id_material_solicitud, tc.id_texto_compra",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en textoCompraService.listarPorSolicitud, " + error.stack;
        throw error;
    }
};

service.crear = async (conn, id_material_solicitud, texto, error) => {
    try {
        const queryResponse = await conn.query(
            "INSERT INTO dino.ttexto_compras \
            (id_material_solicitud, texto, error) \
            VALUES($1, $2, $3)", [id_material_solicitud, texto, error]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en textoCompraService.crear, " + error.stack;
        throw error;
    }
};

service.eliminarPorMaterial = async (conn, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "DELETE FROM dino.ttexto_compras \
            WHERE id_material_solicitud = $1",
            [id_material_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en textoCompraService.eliminarPorMaterial. Details: " + error.stack;
        throw error;
    }
};

module.exports = service;