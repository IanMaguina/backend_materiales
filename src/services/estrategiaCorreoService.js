const winston = require('../utils/winston');

const estrategiaCorreoService = {};

estrategiaCorreoService.crear = async (conn, estrategiaCorreo) => {
    try {
        const queryResponse = await conn.query("INSERT INTO dino.testrategia_correo (correo, nombre, id_estrategia) VALUES($1, $2, $3) RETURNING id",
            [estrategiaCorreo.correo, estrategiaCorreo.nombre, estrategiaCorreo.id_estrategia]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en estrategiaCorreoService.crear, " + error.stack;
        throw error;
    }
};

estrategiaCorreoService.listarPorIdEstrategia = async (conn, id_estrategia) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.testrategia_correo where id_estrategia=$1", [id_estrategia]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en estrategiaCorreoService.listarPorIdEstrategia, " + error.stack
        throw error;
    }
};

estrategiaCorreoService.buscarPorId = async (conn, id) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.testrategia_correo  where id=$1", [id]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en estrategiaCorreoService.buscarPorId, " + error.stack
        throw error;
    }
};

estrategiaCorreoService.eliminarPorId = async (conn, id) => {
    try {
        const queryResponse = await conn.query(
            "DELETE FROM dino.testrategia_correo \
            WHERE id = $1",
            [id]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en estrategiaCorreoService.eliminarPorId. Details: " + error.stack;
        throw error;
    }
};

module.exports = estrategiaCorreoService;