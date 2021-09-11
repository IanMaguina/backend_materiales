const anexoMaterialService = {};

anexoMaterialService.crear = async (conn, anexoMaterial) => {
    try {
        const queryResponse = await conn.query("INSERT INTO dino.tanexo_material (id_material_solicitud, ruta_anexo, nombre) VALUES($1, $2, $3) RETURNING id"
        ,[anexoMaterial.id_material_solicitud, anexoMaterial.ruta_anexo, anexoMaterial.nombre]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en anexoMaterialService.crear, "+error.stack;
        throw error;
    }
}

anexoMaterialService.crearxRol = async (conn, anexoMaterial) => {
    try {
        const queryResponse = await conn.query("INSERT INTO dino.tanexo_material (id_material_solicitud, ruta_anexo, nombre,id_rol, etiqueta) VALUES($1, $2, $3, $4, $5) RETURNING id"
        ,[anexoMaterial.id_material_solicitud, anexoMaterial.ruta_anexo, anexoMaterial.nombre, anexoMaterial.id_rol, anexoMaterial.etiqueta]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en anexoMaterialService.crear, "+error.stack;
        throw error;
    }
}

anexoMaterialService.buscarPorIdMaterialSolicitud = async (conn, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query("select anexo.id, anexo.id_material_solicitud, anexo.nombre, anexo.etiqueta, anexo.ruta_anexo,anexo.id_rol, rol.nombre nombre_rol  \
        from dino.tanexo_material anexo \
        JOIN dino.trol rol ON anexo.id_rol =rol.id \
        where anexo.id_material_solicitud=$1", [id_material_solicitud]);

/*         const queryResponse = await conn.query("select * from dino.tanexo_material \
        where id_material_solicitud=$1", [id_material_solicitud]);
 */        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en anexoMaterialService.buscarPorIdMaterialSolicitud, "+error.stack;
        throw error;
    }
}

anexoMaterialService.borrarPorIdMaterialSolicitud = async (conn, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query("DELETE FROM dino.tanexo_material where id_material_solicitud=$1", [id_material_solicitud]);
        if(queryResponse && queryResponse.rowCount == 1){
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en anexoMaterialService.borrarPorIdMaterialSolicitud, "+error.stack;
        throw error;
    }
}

anexoMaterialService.borrarPorIdAnexoMaterial = async (conn, id_anexo_material) => {
    try {
        const queryResponse = await conn.query("DELETE FROM dino.tanexo_material where id=$1", [id_anexo_material]);
        if(queryResponse && queryResponse.rowCount == 1){
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en anexoMaterialService.borrarPorIdMaterialSolicitud, "+error.stack;
        throw error;
    }
}

anexoMaterialService.listarParaEnviarSAP = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT am.id, am.id_material_solicitud, am.nombre, am.ruta_anexo, ms.ampliacion \
            FROM dino.tanexo_material am \
            INNER JOIN dino.tmaterial_solicitud ms ON ms.id = am.id_material_solicitud \
            WHERE id_material_solicitud IN (select id from dino.tmaterial_solicitud where id_solicitud = $1) \
            ORDER BY am.id_material_solicitud, am.id",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en anexoMaterialService.listarParaEnviarSAP, " + error.stack;
        throw error;
    }
};

module.exports = anexoMaterialService;