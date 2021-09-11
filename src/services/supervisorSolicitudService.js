const supervisorSolicitudService = {};

supervisorSolicitudService.crear = async (conn, supervisorSolicitud) => {
    try {
        const queryResponse = await conn.query("INSERT INTO dino.tsupervisor_solicitud (id_solicitud, id_usuario_supervisor, activo)"
        +" VALUES($1, $2, $3) RETURNING id_solicitud"
        ,[supervisorSolicitud.solicitud.id, supervisorSolicitud.usuarioSupervisor.id, supervisorSolicitud.activo]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en supervisorSolicitudService.crear, " + error.stack;
        throw error;
    }
}

module.exports = supervisorSolicitudService;