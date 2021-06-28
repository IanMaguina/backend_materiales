const correlativoSolicitudService = {};

correlativoSolicitudService.crear = async (conn) => {
    try {
        const queryResponse = await conn.query("INSERT INTO dino.tcorrelativo_solicitud (anio,correlativo) VALUES (extract(year from now())::integer,1) RETURNING id",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en correlativoSolicitudService.crear, " + error.stack;
        throw error;
    }
}

correlativoSolicitudService.obtenerUltimoDeAnioActual = async (conn) => {
    try {
        const queryResponse = await conn.query("select * from dino.tcorrelativo_solicitud corr_soli where corr_soli.anio=extract(year from now())::integer FOR UPDATE",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en correlativoSolicitudService.obtenerActual, " + error.stack;
        throw error;
    }
}

correlativoSolicitudService.actualizar = async (conn, correlativoSolicitud) => {
    try {
        const queryResponse = await conn.query("UPDATE dino.tcorrelativo_solicitud SET anio=$1, correlativo=$2 where id=$3",
        [correlativoSolicitud.anio, correlativoSolicitud.correlativo, correlativoSolicitud.id]);
        if(queryResponse && queryResponse.rowCount == 1){
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en correlativoSolicitudService.actualizar, " + error.stack;
        throw error;
    }
}

module.exports = correlativoSolicitudService;