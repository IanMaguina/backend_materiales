const winston = require('../utils/winston');
const TipoMaterial = require('../domain/tipoMaterial');
const EscenarioNivel2 = require('../domain/escenarioNivel2');
const EscenarioNivel3 = require('../domain/escenarioNivel3');
const service = {};

function extractEscenarioNivel3FromResponse(aRow) {
    const id = aRow.id ? aRow.id : null;
    const codigo = aRow.codigo ? aRow.codigo : null;
    const nombre = aRow.nombre ? aRow.nombre : null;
    const id_escenario_nivel2 = aRow.id_escenario_nivel2 ? aRow.id_escenario_nivel2 : null;
    const escenario_nivel2_codigo = aRow.escenario_nivel2_codigo ? aRow.escenario_nivel2_codigo : null;
    const escenario_nivel2_nombre = aRow.escenario_nivel2_nombre ? aRow.escenario_nivel2_nombre : null;
    const id_tipo_material = aRow.id_tipo_material ? aRow.id_tipo_material : null;
    const tipo_material = new TipoMaterial();
    tipo_material.id = id_tipo_material;
    tipo_material.codigo_sap = aRow.tipo_material_codigo_sap ? aRow.tipo_material_codigo_sap : null;
    tipo_material.nombre = aRow.tipo_material_nombre ? aRow.tipo_material_nombre : null;
    const escenario_nivel2 = new EscenarioNivel2();
    escenario_nivel2.id = id_escenario_nivel2;
    escenario_nivel2.codigo = escenario_nivel2_codigo;
    escenario_nivel2.nombre = escenario_nivel2_nombre;
    const escenarioNivel3 = new EscenarioNivel3();
    escenarioNivel3.id = id;
    escenarioNivel3.codigo = codigo;
    escenarioNivel3.nombre = nombre;
    escenarioNivel3.escenario_nivel2 = escenario_nivel2;
    escenarioNivel3.tipo_material = tipo_material;
    return escenarioNivel3;
};

service.listarPorIdEscenarioNivel2 = async (conn, id_escenario_nivel2) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.tescenario_nivel3 en3 where en3.id_escenario_nivel2=$1", [id_escenario_nivel2]);
        const response = [];
        for (let i = 0; i < queryResponse.rows.length; i++) {
            response.push(extractEscenarioNivel3FromResponse(queryResponse.rows[i]));
        }
        return response;
    } catch (error) {
        winston.info("Error en escenarioNivel3Service.listarPorIdEscenarioNivel2, ");
        throw error;
    }
};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT en3.id, en3.codigo, en3.nombre, \
        en1.id_sociedad, s.codigo_sap s_codigo_sap, s.nombre s_nombre, \
        en3.id_tipo_material, tm.codigo_sap tm_codigo_sap, tm.nombre tm_nombre, \
        tm.codigo_ramo tm_codigo_ramo, \
        tm.codigo_grupo_articulo tm_codigo_grupo_articulo, \
        tm.codigo_categoria_valoracion tm_codigo_categoria_valoracion \
        FROM dino.tescenario_nivel3 en3 \
        INNER JOIN dino.tescenario_nivel2 en2 ON en2.id = en3.id_escenario_nivel2 \
        INNER JOIN dino.tescenario_nivel1 en1 ON en1.id = en2.id_escenario_nivel1 \
        INNER JOIN dino.tsociedad s ON s.id = en1.id_sociedad \
        INNER JOIN dino.ttipo_material tm ON tm.id = en3.id_tipo_material \
        ORDER BY en3.nombre", []);

        let response = [];
        queryResponse.rows.forEach(element => {
            response.push({
                id: element.id,
                codigo: element.codigo,
                nombre: element.nombre,
                sociedad: {
                    id: element.id_sociedad,
                    codigo_sap: element.s_codigo_sap,
                    nombre: element.s_nombre
                },
                tipo_material: {
                    id: element.id_tipo_material,
                    codigo_sap: element.tm_codigo_sap,
                    nombre: element.tm_nombre,
                    codigo_ramo: element.tm_codigo_ramo,
                    codigo_grupo_articulo: element.tm_codigo_grupo_articulo,
                    codigo_categoria_valoracion: element.tm_codigo_categoria_valoracion
                }
            });
        });

        return response;
    } catch (error) {
        winston.info("Error en escenarioNivel3Service.listarTodo, ");
        throw error;
    }
};

service.listarPorIdEscenarioNivel3 = async (conn, id_escenario_nivel3) => {
    try {
        const queryResponse = await conn.query("SELECT en3.id, en3.codigo, en3.nombre, \
        en1.id_sociedad, en1.codigo id_escenario_nivel1, s.codigo_sap s_codigo_sap, s.nombre s_nombre, \
        en3.id_tipo_material, tm.codigo_sap tm_codigo_sap, tm.nombre tm_nombre, \
        tm.codigo_ramo tm_codigo_ramo, \
        tm.codigo_grupo_articulo tm_codigo_grupo_articulo, \
        tm.codigo_categoria_valoracion tm_codigo_categoria_valoracion \
        FROM dino.tescenario_nivel3 en3 \
        INNER JOIN dino.tescenario_nivel2 en2 ON en2.id = en3.id_escenario_nivel2 \
        INNER JOIN dino.tescenario_nivel1 en1 ON en1.id = en2.id_escenario_nivel1 \
        INNER JOIN dino.tsociedad s ON s.id = en1.id_sociedad \
        INNER JOIN dino.ttipo_material tm ON tm.id = en3.id_tipo_material \
        WHERE en3.id = $1 \
        ORDER BY en3.nombre", [id_escenario_nivel3]);

        let response = [];
        queryResponse.rows.forEach(element => {
            response.push({
                id: element.id,
                id_escenario_nivel1:element.id_escenario_nivel1,
                codigo: element.codigo,
                nombre: element.nombre,
                sociedad: {
                    id: element.id_sociedad,
                    codigo_sap: element.s_codigo_sap,
                    nombre: element.s_nombre
                },
                tipo_material: {
                    id: element.id_tipo_material,
                    codigo_sap: element.tm_codigo_sap,
                    nombre: element.tm_nombre,
                    codigo_ramo: element.tm_codigo_ramo,
                    codigo_grupo_articulo: element.tm_codigo_grupo_articulo,
                    codigo_categoria_valoracion: element.tm_codigo_categoria_valoracion
                }
            });
        });

        return response;
    } catch (error) {
        winston.info("Error en escenarioNivel3Service.listarPorIdEscenarioNivel3, ");
        throw error;
    }
};

service.listarPorFiltros = async (conn, id_usuario, id_rol, id_tipo_solicitud, codigo_escenario_nivel1) => {
    try {
        const queryResponse = await conn.query("SELECT en3.id, en3.codigo, en3.nombre, \
        en1.id_sociedad, s.codigo_sap s_codigo_sap, s.nombre s_nombre, \
        en3.id_tipo_material, tm.codigo_sap tm_codigo_sap, tm.nombre tm_nombre, \
        tm.codigo_ramo tm_codigo_ramo, \
        tm.codigo_grupo_articulo tm_codigo_grupo_articulo, \
        tm.codigo_categoria_valoracion tm_codigo_categoria_valoracion \
        FROM dino.testrategia_rol_usuario eru \
        INNER JOIN dino.testrategia_rol er ON er.id = eru.id_estrategia_rol AND er.activo = true \
        INNER JOIN dino.testrategia e ON e.id = er.id_estrategia \
        INNER JOIN dino.tescenario_nivel3 en3 ON en3.id = e.id_escenario_nivel3 \
        INNER JOIN dino.tescenario_nivel2 en2 ON en2.id = en3.id_escenario_nivel2 \
        INNER JOIN dino.tescenario_nivel1 en1 ON en1.id = en2.id_escenario_nivel1 \
        INNER JOIN dino.tsociedad s ON s.id = en1.id_sociedad \
        INNER JOIN dino.ttipo_material tm ON tm.id = en3.id_tipo_material \
        WHERE eru.id_usuario = $1 AND eru.activo = true AND er.id_rol = $2 \
        AND e.id_tipo_solicitud = $3 AND en1.codigo = $4 \
        ORDER BY en3.nombre", [id_usuario, id_rol, id_tipo_solicitud,codigo_escenario_nivel1]);
        //AND e.id_tipo_solicitud = $3 AND en1.codigo = $4 \
        let response = [];
        queryResponse.rows.forEach(element => {
            response.push({
                id: element.id,
                codigo: element.codigo,
                nombre: element.nombre,
                sociedad: {
                    id: element.id_sociedad,
                    codigo_sap: element.s_codigo_sap,
                    nombre: element.s_nombre
                },
                tipo_material: {
                    id: element.id_tipo_material,
                    codigo_sap: element.tm_codigo_sap,
                    nombre: element.tm_nombre,
                    codigo_ramo: element.tm_codigo_ramo,
                    codigo_grupo_articulo: element.tm_codigo_grupo_articulo,
                    codigo_categoria_valoracion: element.tm_codigo_categoria_valoracion
                }
            });
        });

        return response;
    } catch (error) {
        winston.info("Error en escenarioNivel3Service.listarPorFiltros, ");
        throw error;
    }
};

service.listarPorIdSociedad = async (conn, id_sociedad) => {
    try {
        const queryResponse = await conn.query(
            "SELECT en3.id, en3.codigo, en3.nombre, \
            en1.id_sociedad, s.codigo_sap s_codigo_sap, s.nombre s_nombre, \
            en3.id_tipo_material, tm.codigo_sap tm_codigo_sap, tm.nombre tm_nombre, \
            tm.codigo_ramo tm_codigo_ramo, \
            tm.codigo_grupo_articulo tm_codigo_grupo_articulo, \
            tm.codigo_categoria_valoracion tm_codigo_categoria_valoracion \
            FROM dino.tescenario_nivel1 en1 \
            INNER JOIN dino.tescenario_nivel2 en2 ON en2.id_escenario_nivel1 = en1.id \
            INNER JOIN dino.tescenario_nivel3 en3 ON en3.id_escenario_nivel2 = en2.id \
            INNER JOIN dino.tsociedad s ON s.id = en1.id_sociedad \
            INNER JOIN dino.ttipo_material tm ON tm.id = en3.id_tipo_material \
            WHERE en1.id_sociedad = $1", [id_sociedad]);
        const response = [];
        queryResponse.rows.forEach(element => {
            response.push({
                id: element.id,
                codigo: element.codigo,
                nombre: element.nombre,
                sociedad: {
                    id: element.id_sociedad,
                    codigo_sap: element.s_codigo_sap,
                    nombre: element.s_nombre
                },
                tipo_material: {
                    id: element.id_tipo_material,
                    codigo_sap: element.tm_codigo_sap,
                    nombre: element.tm_nombre,
                    codigo_ramo: element.tm_codigo_ramo,
                    codigo_grupo_articulo: element.tm_codigo_grupo_articulo,
                    codigo_categoria_valoracion: element.tm_codigo_categoria_valoracion
                }
            });
        });
        return response;
    } catch (error) {
        winston.info("Error en escenarioNivel3Service.listarPorIdEscenarioNivel2, ");
        throw error;
    }
};

module.exports = service;