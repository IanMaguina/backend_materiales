const equivalenciaMaterialService = {};

equivalenciaMaterialService.agregarEquivalenciaMaterialxRol = async (conn, equivalenciaMaterial) => {
    try {
        const queryResponse = await conn.query("INSERT INTO dino.tequivalencia_material (id_material_solicitud, valor1, unidad_medida1,valor2, unidad_medida2, id_rol) VALUES($1, $2, $3, $4, $5, $6) RETURNING id"
        ,[equivalenciaMaterial.id_material_solicitud, equivalenciaMaterial.valor1, equivalenciaMaterial.unidad_medida1, equivalenciaMaterial.valor2 ,  equivalenciaMaterial.unidad_medida2, equivalenciaMaterial.id_rol]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en equivalenciaMaterialService.crear, "+error.stack;
        throw error;
    }
}

equivalenciaMaterialService.borrarPorIdEquivalenciaMaterial = async (conn, id_equivalencia_material) => {
    try {
        const queryResponse = await conn.query("DELETE FROM dino.tequivalencia_material where id=$1", [id_equivalencia_material]);
        if(queryResponse && queryResponse.rowCount == 1){
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en equivalencia.borrarPorIdEquivalenciaMaterial, "+error.stack;
        throw error;
    }
}

equivalenciaMaterialService.buscarPorIdMaterialSolicitud = async (conn, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query("select * from dino.tequivalencia_material where id_material_solicitud=$1", [id_material_solicitud]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en equivalenciaMaterialService.buscarPorIdMaterialSolicitud, "+error.stack;
        throw error;
    }
}

equivalenciaMaterialService.listarParaEnviarSAP = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "select em.id, em.id_material_solicitud, em.valor1, em.unidad_medida1, em.valor2, em.unidad_medida2, ms.ampliacion \
            from dino.tsolicitud s \
            inner join dino.tmaterial_solicitud ms on ms.id_solicitud = s.id \
            inner join dino.tequivalencia_material em on em.id_material_solicitud = ms.id \
            where s.id = $1", [id_solicitud]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en equivalenciaMaterialService.listarParaEnviarSAP, "+error.stack;
        throw error;
    }
}

module.exports = equivalenciaMaterialService;