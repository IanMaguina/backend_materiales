const winston = require('../utils/winston');
const service = {};

service.listar = async (conn, codigo_sociedad) => {
    try {
        const queryResponse = await conn.query("SELECT c.codigo_sap, \
        c.codigo_sociedad, c.nombre \
        FROM dino.tcentro c \
        WHERE c.codigo_sociedad = $1 ORDER BY c.codigo_sap", [codigo_sociedad]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en centroService.listar, " + error.stack;
        throw error;
    }
};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query(
            "select codigo_sap, nombre, codigo_centro_beneficio, codigo_sociedad \
            from dino.tcentro ORDER BY codigo_sap", []);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en centroService.listar, " + error.stack;
        throw error;
    }
};

service.listarParaValidar = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT c.codigo_sap, c.codigo_centro_beneficio \
            FROM dino.tsolicitud s \
            INNER JOIN dino.tescenario_nivel3 en3 ON en3.id = s.id_escenario_nivel3 \
            INNER JOIN dino.tescenario_nivel2 en2 ON en2.id = en3.id_escenario_nivel2 \
            INNER JOIN dino.tescenario_nivel1 en1 ON en1.id = en2.id_escenario_nivel1 \
            INNER JOIN dino.tsociedad so ON so.id = en1.id_sociedad \
            INNER JOIN dino.tcentro c ON c.codigo_sociedad = so.codigo_sap \
            WHERE s.id = $1", [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en centroService.listarParaValidar, " + error.stack;
        throw error;
    }
};

module.exports = service;