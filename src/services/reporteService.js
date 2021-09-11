const winston = require('../utils/winston');
const service = {};

service.obtener_total_solicitudes_dashboard = async (conn, filtros) => {
    try {
        const universo = script_filtros_dashboard(filtros);

        const query = "select count(s.id) from dino.tsolicitud s \
            where s.id in (" + universo.query + " )";

        const queryResponse = await conn.query(query, universo.params);

        if (queryResponse.rows.length > 0) {
            return queryResponse.rows[0];
        } else {
            return 0;
        }
    } catch (error) {
        winston.info("Error en reporteService.obtener_total_solicitudes_dashboard.");
        throw error;
    }
};

service.obtener_total_solicitudes_pendientes = async (conn, filtros) => {
    try {
        const universo = script_filtros_dashboard(filtros);

        const query = "select count(s.id) from dino.tsolicitud s \
            where s.id in (" + universo.query + " ) \
            and s.id_estado_solicitud <> 9";

        const queryResponse = await conn.query(query, universo.params);

        if (queryResponse.rows.length > 0) {
            return queryResponse.rows[0];
        } else {
            return 0;
        }
    } catch (error) {
        winston.info("Error en reporteService.obtener_total_solicitudes_pendientes.");
        throw error;
    }
};

service.obtener_total_solicitudes_finalizadas = async (conn, filtros) => {
    try {
        const universo = script_filtros_dashboard(filtros);

        const query = "select count(s.id) from dino.tsolicitud s \
            where s.id in (" + universo.query + " ) \
            and s.id_estado_solicitud = 9";

        const queryResponse = await conn.query(query, universo.params);

        if (queryResponse.rows.length > 0) {
            return queryResponse.rows[0];
        } else {
            return 0;
        }
    } catch (error) {
        winston.info("Error en reporteService.obtener_total_solicitudes_finalizadas.");
        throw error;
    }
};

service.listar_solicitudes_por_estado_dashboard = async (conn, filtros) => {
    try {
        const universo = script_filtros_dashboard(filtros);

        const query = "select es.id, es.nombre, count(es.id) \
            from dino.tsolicitud s \
            inner join dino.testado_solicitud es on es.id = s.id_estado_solicitud \
            where s.id in (" + universo.query + " )\
            group by es.id, es.nombre \
            order by 1";

        const queryResponse = await conn.query(query, universo.params);

        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en reporteService.listar_solicitudes_por_estado_dashboard.");
        throw error;
    }
};

service.obtener_promedio_atencion = async (conn, filtros) => {
    try {
        const universo = script_filtros_dashboard(filtros);

        const query = "select ROUND(AVG(DATE_PART('day', s. fecha_modificacion - s.fecha_creacion) * 24 + DATE_PART('hour', fecha_modificacion - fecha_creacion ))::numeric, 2) \"promedio\" \
            from dino.tsolicitud s \
            where s.id in (" + universo.query + " ) \
            and s.id_estado_solicitud = 9";

        const queryResponse = await conn.query(query, universo.params);

        if (queryResponse.rows.length > 0) {
            return queryResponse.rows[0];
        } else {
            return 0;
        }
    } catch (error) {
        winston.info("Error en reporteService.obtener_promedio_atencion.");
        throw error;
    }
};

service.listar_solicitudes_por_area = async (conn, filtros) => {
    try {
        const universo = script_filtros_dashboard(filtros);

        const query = "select au.id, au.nombre, count(s.id) \
            from dino.tsolicitud s \
            left join dino.taprobador_solicitud a on a.id_solicitud = s.id and a.tipo = 'F' and a.esta_aqui = true \
            left join dino.tusuario u on u.id = a.id_usuario_aprobador \
            left join dino.tarea_usuario au on au.id = u.id_area_usuario \
            where s.id in (" + universo.query + " )\
            group by au.id, au.nombre \
            order by 1";

        const queryResponse = await conn.query(query, universo.params);

        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en reporteService.listar_solicitudes_por_area.");
        throw error;
    }
};

service.listar_tiempo_atencion_por_gestor = async (conn, filtros) => {
    try {
        const universo = script_filtros_dashboard(filtros);

        const query = "select a.id_rol, a.nombre_rol, ROUND(AVG(DATE_PART('day',  a.fecha_salida - a.fecha_ingreso) * 24 + DATE_PART('hour', a.fecha_salida - a.fecha_ingreso ))::numeric, 2) \"promedio\" \
            from dino.tsolicitud s \
            inner join dino.taprobador_solicitud a on a.id_solicitud = s.id and a.tipo = 'F' \
            and a.fecha_ingreso is not null and a.fecha_salida is not null \
            where s.id in (" + universo.query + " )\
            group by a.id_rol, a.nombre_rol \
            order by 1";

        const queryResponse = await conn.query(query, universo.params);

        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en reporteService.listar_tiempo_atencion_por_gestor.");
        throw error;
    }
};

service.listar_solicitudes_por_motivo_rechazo = async (conn, filtros) => {
    try {
        const universo = script_filtros_dashboard(filtros);

        const query = "select mr.id, mr.nombre, count(s.id) \
            from dino.tsolicitud s \
            left join dino.taprobador_solicitud a on a.id_solicitud = s.id and a.tipo = 'S' \
            inner join dino.tmotivo_rechazo mr on mr.id = a.id_motivo_rechazo \
            where s.id in (" + universo.query + " )\
            group by mr.id, mr.nombre \
            order by 1";

        const queryResponse = await conn.query(query, universo.params);

        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en reporteService.listar_solicitudes_por_motivo_rechazo.");
        throw error;
    }
};

service.listar_solicitudes_por_tipo = async (conn, filtros) => {
    try {
        const universo = script_filtros_dashboard(filtros);

        const query = "select ts.id, ts.nombre, count(s.id) \
            from dino.tsolicitud s \
            inner join dino.ttipo_solicitud ts on ts.id = s.id_tipo_solicitud \
            where s.id in (" + universo.query + " )\
            group by ts.id, ts.nombre \
            order by 1";

        const queryResponse = await conn.query(query, universo.params);

        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en reporteService.listar_solicitudes_por_motivo_rechazo.");
        throw error;
    }
};

function script_filtros_dashboard(filtros) {
    const result = { query: "", params: [] };

    result.query = "select s.id from dino.tsolicitud s \
        left join dino.taprobador_solicitud a on a.id_solicitud = s.id and a.tipo = 'F' and esta_aqui = true \
        left join dino.tusuario u on u.id = a.id_usuario_aprobador \
        where s.id > 0";

    if (filtros.id_tipo_solicitud && filtros.id_tipo_solicitud != 0) {
        result.query += " and s.id_tipo_solicitud = $" + (result.params.length + 1);
        result.params.push(filtros.id_tipo_solicitud);
    }

    if (filtros.fecha_inicio) {
        result.query += " and s.fecha_creacion >= $" + (result.params.length + 1);;
        result.params.push(filtros.fecha_inicio);
    }

    if (filtros.fecha_fin) {
        result.query += " and s.fecha_creacion < $" + (result.params.length + 1);;
        result.params.push(filtros.fecha_fin);
    }

    if (filtros.id_rol && filtros.id_rol != 0) {
        result.query += " and a.id_rol = $" + (result.params.length + 1);;
        result.params.push(filtros.id_rol);
    }

    if (filtros.id_area_usuario && filtros.id_area_usuario != 0) {
        result.query += " and u.id_area_usuario = $" + (result.params.length + 1);;
        result.params.push(filtros.id_area_usuario);
    }

    return result;
};


service.obtener_total_solicitudes_cantidad = async (conn, filtros) => {
    try {
        const universo = script_filtros_cantidad(filtros);

        const query = "select count(s.id) from dino.tsolicitud s \
            where s.id in (" + universo.query + " )";

        const queryResponse = await conn.query(query, universo.params);

        if (queryResponse.rows.length > 0) {
            return queryResponse.rows[0];
        } else {
            return 0;
        }
    } catch (error) {
        winston.info("Error en reporteService.obtener_total_solicitudes_cantidad.");
        throw error;
    }
};

service.listar_solicitudes_por_estado_cantidad = async (conn, filtros) => {
    try {
        const universo = script_filtros_cantidad(filtros);

        const query = "select es.id, es.nombre, count(es.id) \
            from dino.tsolicitud s \
            inner join dino.testado_solicitud es on es.id = s.id_estado_solicitud \
            where s.id in (" + universo.query + " )\
            group by es.id, es.nombre \
            order by 1";

        const queryResponse = await conn.query(query, universo.params);

        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en reporteService.listar_solicitudes_por_estado_cantidad.");
        throw error;
    }
};

service.listar_solicitudes_filtros_cantidad = async (conn, filtros) => {
    try {
        const universo = script_filtros_cantidad(filtros);

        const query = "select s.id \"id_solicitud\", s.correlativo, s.descripcion, s.fecha_creacion, s.id_tipo_solicitud, \
            ts.nombre \"tipo_solicitud\", s.id_escenario_nivel3, en3.nombre \"escenario_nivel3\", \
            a.id_usuario_aprobador, a.nombre_usuario_aprobador, s.id_estado_solicitud, es.nombre \"estado_solicitud\", \
            u.id_area_usuario, au.nombre \"area_usuario\", \
            (select nombre_motivo_rechazo from dino.taprobador_solicitud ar \
            where id_solicitud = s.id and ar.tipo = 'S' and ar.id_motivo_rechazo is not null order by id desc limit(1)) \"motivo_rechazo\" \
            from dino.tsolicitud s \
            inner join dino.taprobador_solicitud a on a.id_solicitud = s.id and a.tipo = 'F' and a.id_rol = 1 \
            inner join dino.tusuario u on u.id = a.id_usuario_aprobador \
            inner join dino.tarea_usuario au on au.id = u.id_area_usuario \
            inner join dino.ttipo_solicitud ts on ts.id = s.id_tipo_solicitud \
            inner join dino.tescenario_nivel3 en3 on en3.id = s.id_escenario_nivel3 \
            inner join dino.testado_solicitud es on es.id = s.id_estado_solicitud \
            where s.id in (" + universo.query + " )\
            order by 1";

        const queryResponse = await conn.query(query, universo.params);

        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en reporteService.listar_solicitudes_filtros_cantidad.");
        throw error;
    }
};

function script_filtros_cantidad(filtros) {
    const result = { query: "", params: [] };

    result.query = "select s.id from dino.tsolicitud s \
        inner join dino.tescenario_nivel3 en3 on en3.id = s.id_escenario_nivel3 \
        inner join dino.tescenario_nivel2 en2 on en2.id = en3.id_escenario_nivel2 \
        inner join dino.tescenario_nivel1 en1 on en1.id = en2.id_escenario_nivel1 \
        inner join dino.taprobador_solicitud a on a.id_solicitud = s.id and a.tipo = 'F' and a.id_rol = 1 \
        inner join dino.tusuario u on u.id = a.id_usuario_aprobador \
        inner join dino.tmaterial_solicitud m on m.id_solicitud = s.id \
        where s.id > 0";

    if (filtros.fecha_inicio) {
        result.query += " and s.fecha_creacion >= $" + (result.params.length + 1);;
        result.params.push(filtros.fecha_inicio);
    }

    if (filtros.fecha_fin) {
        result.query += " and s.fecha_creacion < $" + (result.params.length + 1);;
        result.params.push(filtros.fecha_fin);
    }

    if (filtros.anho && filtros.anho != 0) {
        result.query += " and EXTRACT(year FROM s.fecha_creacion) = $" + (result.params.length + 1);;
        result.params.push(filtros.anho);
    }

    if (filtros.id_sociedad && filtros.id_sociedad != 0) {
        result.query += " and en1.id_sociedad = $" + (result.params.length + 1);;
        result.params.push(filtros.id_sociedad);
    }

    if (filtros._usuario && filtros.id_usuario != 0) {
        result.query += " and a.id_usuario_aprobador = $" + (result.params.length + 1);;
        result.params.push(filtros.id_usuario);
    }

    if (filtros.id_area_usuario && filtros.id_area_usuario != 0) {
        result.query += " and u.id_area_usuario = $" + (result.params.length + 1);;
        result.params.push(filtros.id_area_usuario);
    }

    if (filtros.id_tipo_solicitud && filtros.id_tipo_solicitud != 0) {
        result.query += " and s.id_tipo_solicitud = $" + (result.params.length + 1);
        result.params.push(filtros.id_tipo_solicitud);
    }

    if (filtros.id_escenario_nivel3 && filtros.id_escenario_nivel3 != 0) {
        result.query += " and en3.id = $" + (result.params.length + 1);
        result.params.push(filtros.id_escenario_nivel3);
    }

    if (filtros.centro_codigo_sap) {
        result.query += " and m.centro_codigo_sap = $" + (result.params.length + 1);;
        result.params.push(filtros.centro_codigo_sap);
    }

    return result;
};

service.listar_promedio_atencion_estado = async (conn, filtros) => {
    try {
        const universo = script_filtros_tiempo(filtros);

        const query = "select a.id_rol_real, a.nombre_rol_real, \
            ROUND( AVG(DATE_PART('hour', a.fecha_salida - a.fecha_ingreso ))::numeric, 2) \"promedio\" \
            from dino.tsolicitud s \
            inner join dino.taprobador_solicitud a on a.id_solicitud = s.id and a.tipo = 'F' \
            where s.id in (" + universo.query + " ) \
            and a.fecha_salida is not null and a.fecha_ingreso is not null \
            group by a.id_rol_real, a.nombre_rol_real \
            order by a.id_rol_real";

        const queryResponse = await conn.query(query, universo.params);

        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en reporteService.listar_promedio_atencion_estado.");
        throw error;
    }
};

service.listar_solicitudes_filtros_tiempo = async (conn, filtros) => {
    try {
        const universo = script_filtros_tiempo(filtros);

        const query = "select s.id \"id_solicitud\", s.correlativo, s.descripcion, s.fecha_creacion, s.id_tipo_solicitud, \
            ts.nombre \"tipo_solicitud\", s.id_escenario_nivel3, en3.nombre \"escenario_nivel3\", \
            a.id_usuario_aprobador, a.nombre_usuario_aprobador, s.id_estado_solicitud, es.nombre \"estado_solicitud\", \
            u.id_area_usuario, au.nombre \"area_usuario\", \
            (select nombre_motivo_rechazo from dino.taprobador_solicitud ar \
            where id_solicitud = s.id and ar.tipo = 'S' and ar.id_motivo_rechazo is not null order by id desc limit(1)) \"motivo_rechazo\" \
            from dino.tsolicitud s \
            inner join dino.taprobador_solicitud a on a.id_solicitud = s.id and a.tipo = 'F' and a.id_rol = 1 \
            inner join dino.tusuario u on u.id = a.id_usuario_aprobador \
            inner join dino.tarea_usuario au on au.id = u.id_area_usuario \
            inner join dino.ttipo_solicitud ts on ts.id = s.id_tipo_solicitud \
            inner join dino.tescenario_nivel3 en3 on en3.id = s.id_escenario_nivel3 \
            inner join dino.testado_solicitud es on es.id = s.id_estado_solicitud \
            where s.id in (" + universo.query + " )\
            order by 1";

        const queryResponse = await conn.query(query, universo.params);

        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en reporteService.listar_solicitudes_filtros_tiempo.");
        throw error;
    }
};

function script_filtros_tiempo(filtros) {
    const result = { query: "", params: [] };

    result.query = "select s.id from dino.tsolicitud s \
        inner join dino.tescenario_nivel3 en3 on en3.id = s.id_escenario_nivel3 \
        inner join dino.tescenario_nivel2 en2 on en2.id = en3.id_escenario_nivel2 \
        inner join dino.tescenario_nivel1 en1 on en1.id = en2.id_escenario_nivel1 \
        inner join dino.taprobador_solicitud a on a.id_solicitud = s.id and a.tipo = 'F' and a.id_rol = 1 \
        inner join dino.tusuario u on u.id = a.id_usuario_aprobador \
        inner join dino.tmaterial_solicitud m on m.id_solicitud = s.id \
        where s.id > 0";

    if (filtros.fecha_inicio) {
        result.query += " and s.fecha_creacion >= $" + (result.params.length + 1);;
        result.params.push(filtros.fecha_inicio);
    }

    if (filtros.fecha_fin) {
        result.query += " and s.fecha_creacion < $" + (result.params.length + 1);;
        result.params.push(filtros.fecha_fin);
    }

    if (filtros.anho && filtros.anho != 0) {
        result.query += " and EXTRACT(year FROM s.fecha_creacion) = $" + (result.params.length + 1);;
        result.params.push(filtros.anho);
    }

    if (filtros.id_sociedad && filtros.id_sociedad != 0) {
        result.query += " and en1.id_sociedad = $" + (result.params.length + 1);;
        result.params.push(filtros.id_sociedad);
    }

    if (filtros._usuario && filtros.id_usuario != 0) {
        result.query += " and a.id_usuario_aprobador = $" + (result.params.length + 1);;
        result.params.push(filtros.id_usuario);
    }

    if (filtros.id_area_usuario && filtros.id_area_usuario != 0) {
        result.query += " and u.id_area_usuario = $" + (result.params.length + 1);;
        result.params.push(filtros.id_area_usuario);
    }

    if (filtros.id_tipo_solicitud && filtros.id_tipo_solicitud != 0) {
        result.query += " and s.id_tipo_solicitud = $" + (result.params.length + 1);
        result.params.push(filtros.id_tipo_solicitud);
    }

    if (filtros.id_escenario_nivel3 && filtros.id_escenario_nivel3 != 0) {
        result.query += " and en3.id = $" + (result.params.length + 1);
        result.params.push(filtros.id_escenario_nivel3);
    }

    if (filtros.id_estado_solicitud && filtros.id_estado_solicitud != 0) {
        result.query += " and s.id_estado_solicitud = $" + (result.params.length + 1);
        result.params.push(filtros.id_estado_solicitud);
    }

    if (filtros.centro_codigo_sap) {
        result.query += " and m.centro_codigo_sap = $" + (result.params.length + 1);;
        result.params.push(filtros.centro_codigo_sap);
    }

    return result;
};

module.exports = service;