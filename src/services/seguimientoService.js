const seguimientoService = {};

seguimientoService.crear = async (conn, seguimiento) => {
    try {
        const queryResponse = await conn.query("INSERT INTO dino.tseguimiento (id_estado_solicitud, id_solicitud, motivo, id_usuario, fecha_registro, id_rol)"
        +" VALUES($1, $2, $3, $4, NOW(),$5) RETURNING id_solicitud"
        ,[seguimiento.estadoSolicitud.id, seguimiento.solicitud.id, seguimiento.motivo, seguimiento.usuario.id, seguimiento.rol.id]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en seguimientoService.crear, " + error.stack;
        throw error;
    }
}

module.exports = seguimientoService;