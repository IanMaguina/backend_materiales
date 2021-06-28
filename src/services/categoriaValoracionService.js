const service = {};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.tcategoria_valoracion ORDER BY codigo_sap", []);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en categoriaValoracionService.listarTodo, " + error.stack;
        throw error;
    }
};

service.listarPorTipoMaterial = async (conn, tipo_material) => {
    try {
        const queryResponse = await conn.query("SELECT tcv.codigo_sap, tcv.nombre, tm.codigo_sap tipo_material \
        FROM dino.tcategoria_valoracion tcv \
        inner join dino.ttipo_material tm ON tm.referencia_cuenta=tcv.referencia_cuenta \
        where tm.codigo_sap= $1 ORDER BY tcv.codigo_sap", [tipo_material]);
        
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en categoriaValoracionService.listarPorTipoMaterial, " + error.stack;
        throw error;
    }
}

service.listarParaValidar = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT codigo_sap FROM dino.tcategoria_valoracion", []);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en categoriaValoracionService.listarParaValidar, " + error.stack;
        throw error;
    }
};

module.exports = service;