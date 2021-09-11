const service = {};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.tarea_usuario", [])
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en areaUsuarioService.listarTodo, " + error.stack;
        throw error;
    }
}

service.obtenerPorUsuario = async (conn, id_usuario) => {
    try {
        const queryResponse = await conn.query(
            "SELECT au.id, au.abreviatura, au.anio, au.correlativo \
            FROM dino.tusuario u \
            INNER JOIN dino.tarea_usuario au ON au.id = u.id_area_usuario \
            WHERE u.id = $1", [id_usuario])

        if (queryResponse.rows.length > 0) {
            return queryResponse.rows[0];
        } else {
            return null;
        }
    } catch (error) {
        error.stack = "\nError en areaUsuarioService.obtenerPorUsuario, " + error.stack;
        throw error;
    }
}

service.actualizar = async (conn, area_usuario) => {
    try {
        console.log(area_usuario.anio); console.log(area_usuario.correlativo); console.log(area_usuario.id);
        const queryResponse = await conn.query(
            "UPDATE dino.tarea_usuario \
            SET anio = $1, correlativo = $2 \
            WHERE id = $3", [area_usuario.anio, area_usuario.correlativo, area_usuario.id])

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en areaUsuarioService.actualizar, " + error.stack;
        throw error;
    }
}

module.exports = service;