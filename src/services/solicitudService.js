const bigDecimal = require('js-big-decimal');
const { winston } = require('../config');
const Solicitud = require('../domain/solicitud');
//const dateFormat = require('dateformat');
const solicitudService = {};

solicitudService.crear = async (conn, solicitud) => {
    try {
        const queryResponse = await conn.query("INSERT INTO dino.tsolicitud (creado_por, fecha_creacion, id_estado_solicitud, descripcion, correlativo, id_escenario_nivel3, id_tipo_solicitud)"
            + " VALUES($1, NOW(), $2, $3, $4, $5, $6) RETURNING id",
            [solicitud.creado_por, solicitud.estadoSolicitud.id, solicitud.descripcion, solicitud.correlativo, solicitud.escenarioNivel3.id, solicitud.tipoSolicitud.id]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en solicitudService.crear, " + error.stack;
        throw error;
    }
}

solicitudService.contarFilasPorFiltros = async (conn, filtros) => {
    try {
        let queryFinal = "SELECT COUNT(*) as cantidad FROM dino.tsolicitud solicitud ";
        let whereCondition = "";
        let queryParameters = [];
        let parameterNames = [];
        if (filtros.id_estado_solicitud) {
            whereCondition = whereCondition + " solicitud.id_estado_solicitud in (" + filtros.id_estado_solicitud + ") ";
        }
        if (filtros.id_escenario_nivel3) {
            parameterNames.push("id_escenario_nivel3");
        }
        if (filtros.id_tipo_solicitud) {
            parameterNames.push("id_tipo_solicitud");
        }
        if (filtros.fecha_inicio) {
            parameterNames.push("fecha_inicio");
        }
        if (filtros.fecha_fin) {
            parameterNames.push("fecha_fin");
        }

        /*         if(parameterNames.length > 0){
                    whereCondition = " WHERE ";
                } */

        let i = 0;
        for (; i < parameterNames.length;) {
            if (i > 0 || filtros.id_estado_solicitud) {
                whereCondition = whereCondition + " AND";
            }
            if (parameterNames[i] == "id_escenario_nivel3") {
                whereCondition = whereCondition + " solicitud.id_escenario_nivel3=$" + (i + 1);
                queryParameters.push(filtros.id_escenario_nivel3);
            } else if (parameterNames[i] == "id_tipo_solicitud") {
                whereCondition = whereCondition + " solicitud.id_tipo_solicitud=$" + (i + 1);
                queryParameters.push(filtros.id_tipo_solicitud);
            } else if (parameterNames[i] == "fecha_inicio") {
                whereCondition = whereCondition + " solicitud.fecha_creacion>=TO_TIMESTAMP($" + (i + 1) + ",'YYYY-MM-DD')";
                queryParameters.push(filtros.fecha_inicio);
            } else if (parameterNames[i] == "fecha_fin") {
                whereCondition = whereCondition + " solicitud.fecha_creacion<=(TO_TIMESTAMP($" + (i + 1) + ",'YYYY-MM-DD') + cast('1 day' as interval))";
                queryParameters.push(filtros.fecha_fin);
            }
            i = i + 1;
        }
        //queryFinal = queryFinal + whereCondition;
        if (whereCondition != "") {
            queryFinal = queryFinal + " where " + whereCondition;
        }

        const queryResponse = await conn.query(queryFinal, queryParameters);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en solicitudService.contarFilasPorFiltros, " + error.stack;
        throw error;
    }
}

solicitudService.buscarPorFiltros = async (conn, filtros) => {
    try {
        let queryFinal;
        let selectQuery = "SELECT solicitud.*"
            + ", usuario_creador.nombre as usuario_creador_nombre"
            + ", est_sol.nombre as estado_solicitud_nombre"
            + ", tipo_sol.nombre as tipo_solicitud_nombre"
            + ", nivel1.id_sociedad, sociedad.codigo_sap as sociedad_codigo_sap, sociedad.nombre as sociedad_nombre";
        let fromQuery = " FROM dino.tsolicitud solicitud"
            + " JOIN dino.tusuario usuario_creador ON solicitud.creado_por=usuario_creador.id"
            + " JOIN dino.testado_solicitud est_sol ON solicitud.id_estado_solicitud=est_sol.id"
            + " JOIN dino.ttipo_solicitud tipo_sol ON solicitud.id_tipo_solicitud=tipo_sol.id"
            + " JOIN dino.tescenario_nivel3 nivel3 ON nivel3.id=solicitud.id_escenario_nivel3"
            + " JOIN dino.tescenario_nivel2 nivel2 ON nivel2.id=nivel3.id_escenario_nivel2"
            + " JOIN dino.tescenario_nivel1 nivel1 ON nivel1.id=nivel2.id_escenario_nivel1"
            + " JOIN dino.tsociedad sociedad ON sociedad.id=nivel1.id_sociedad";
        let whereCondition = "";
        let queryParameters = [];
        let parameterNames = [];
        if (filtros.id_usuario) {
            //parameterNames.push("id_usuario");
        }
        if (filtros.id_estado_solicitud) {
            whereCondition = whereCondition + " solicitud.id_estado_solicitud in (" + filtros.id_estado_solicitud + ") ";
            // parameterNames.push("id_estado_solicitud");
        }
        if (filtros.id_escenario_nivel3) {
            parameterNames.push("id_escenario_nivel3");
        }
        if (filtros.id_tipo_solicitud) {
            parameterNames.push("id_tipo_solicitud");
        }
        if (filtros.fecha_inicio) {
            parameterNames.push("fecha_inicio");
        }
        if (filtros.fecha_fin) {
            parameterNames.push("fecha_fin");
        }

        let i = 0;
        for (; i < parameterNames.length;) {
            if (i > 0 || filtros.id_estado_solicitud) {
                whereCondition = whereCondition + " AND "
            }
            if (parameterNames[i] == "id_usuario") {
                //selectQuery = selectQuery + ", usuario_creador.nombre as usuario_creador_nombre";
                //fromQuery = fromQuery + " JOIN dino.tusuario usuario_creador ON solicitud.creado_por=usuario_creador.id";

                // Se debe pensar como se va a filtrar por usuario
                //whereCondition = whereCondition + " solicitud.id_estado_solicitud=$"+(i+1);
                //queryParameters.push(filtros.id_estado_solicitud);
            } else if (parameterNames[i] == "id_estado_solicitud") {
                //selectQuery = selectQuery + ", est_sol.nombre as estado_solicitud_nombre";
                //fromQuery = fromQuery + " JOIN dino.testado_solicitud est_sol ON solicitud.id_estado_solicitud=est_sol.id";
                //whereCondition = whereCondition + " solicitud.id_estado_solicitud=$"+(i+1);
                //queryParameters.push(filtros.id_estado_solicitud);
            } else if (parameterNames[i] == "id_escenario_nivel3") {
                whereCondition = whereCondition + " solicitud.id_escenario_nivel3=$" + (i + 1);
                queryParameters.push(filtros.id_escenario_nivel3);
            } else if (parameterNames[i] == "id_tipo_solicitud") {
                //selectQuery = selectQuery + ", tipo_sol.nombre as tipo_solicitud_nombre";
                //fromQuery = fromQuery + " JOIN dino.ttipo_solicitud tipo_sol ON solicitud.id_tipo_solicitud=tipo_sol.id";
                whereCondition = whereCondition + " solicitud.id_tipo_solicitud=$" + (i + 1);
                queryParameters.push(filtros.id_tipo_solicitud);
            } else if (parameterNames[i] == "fecha_inicio") {
                whereCondition = whereCondition + " solicitud.fecha_creacion>=TO_TIMESTAMP($" + (i + 1) + ",'YYYY-MM-DD')";
                queryParameters.push(filtros.fecha_inicio);
            } else if (parameterNames[i] == "fecha_fin") {
                //whereCondition = whereCondition + " solicitud.fecha_creacion<=(TO_TIMESTAMP($"+(i+1)+",'YYYY-MM-DD') + cast('1 day' as interval))";
                whereCondition = whereCondition + " solicitud.fecha_creacion<=(TO_TIMESTAMP($" + (i + 1) + ",'YYYY-MM-DD HH24:MI:SS'))";
                queryParameters.push(filtros.fecha_fin + ' 23:59:59');
            }
            i = i + 1;
        }
        if (whereCondition != "") {
            queryFinal = selectQuery + fromQuery + " where " + whereCondition;
        }

        queryFinal+=" ORDER BY solicitud.id DESC LIMIT $" + (i + 1) + " OFFSET $" + (i + 2);

        //queryFinal = selectQuery + fromQuery + whereCondition + " ORDER BY solicitud.id DESC LIMIT $"+(i+1)+" OFFSET $"+(i+2);
        console.log("queryFinal: " + queryFinal);
        queryParameters.push(filtros.cantidad_filas);
        let bdCantidadFilas = new bigDecimal(filtros.cantidad_filas);
        let bdPaginas = new bigDecimal(filtros.pagina);
        queryParameters.push(bdCantidadFilas.multiply(bdPaginas).getValue());
        console.log("queryParameters: ", queryParameters);
        const queryResponse = await conn.query(queryFinal, queryParameters);
        const response = [];
        for (let i = 0; i < queryResponse.rows.length; i++) {
            response.push(extractSolicitudForBuscarPorFiltros(queryResponse.rows[i]));
        }
        return response;
    } catch (error) {
        error.stack = "\nError en solicitudService.buscarPorFiltros, " + error.stack;
        throw error;
    }
}

function extractSolicitudForBuscarPorFiltros(aRow) {
    const solicitud = new Solicitud();
    solicitud.creado_por = {
        id: aRow.creado_por,
        nombre: aRow.usuario_creador_nombre
    }
    solicitud.estadoSolicitud = {
        id: aRow.id_estado_solicitud,
        nombre: aRow.estado_solicitud_nombre
    }
    solicitud.tipoSolicitud = {
        id: aRow.id_tipo_solicitud,
        nombre: aRow.tipo_solicitud_nombre
    }
    solicitud.escenarioNivel3 = {
        id: aRow.id_escenario_nivel3,
        sociedad: {
            id: aRow.id_sociedad,
            codigo_sap: aRow.sociedad_codigo_sap,
            nombre: aRow.sociedad_nombre
        }
    }
    solicitud.id = aRow.id;
    //console.log("aRow.fecha_creacion: "+aRow.fecha_creacion)
    //solicitud.fecha_creacion = dateFormat(aRow.fecha_creacion, 'yyyy-mm-dd HH:MM:ss');
    solicitud.fecha_creacion = aRow.fecha_creacion.toISOString().replace('T', ' ').substr(0, 19);
    solicitud.descripcion_corta = aRow.descripcion;
    solicitud.correlativo = aRow.correlativo;
    solicitud.motivo_rechazo = aRow.motivo_rechazo;
    return solicitud;
}

solicitudService.buscarCabeceraPorId = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query("SELECT solicitud.*"
            + ", usuario_creador.nombre as usuario_creador_nombre"
            + ", est_sol.nombre as estado_solicitud_nombre"
            + ", tipo_sol.nombre as tipo_solicitud_nombre"
            + ", nivel1.id_sociedad, sociedad.codigo_sap as sociedad_codigo_sap, sociedad.nombre as sociedad_nombre"
            + " FROM dino.tsolicitud solicitud"
            + " JOIN dino.tusuario usuario_creador ON solicitud.creado_por=usuario_creador.id"
            + " JOIN dino.testado_solicitud est_sol ON solicitud.id_estado_solicitud=est_sol.id"
            + " JOIN dino.ttipo_solicitud tipo_sol ON solicitud.id_tipo_solicitud=tipo_sol.id"
            + " JOIN dino.tescenario_nivel3 nivel3 ON nivel3.id=solicitud.id_escenario_nivel3"
            + " JOIN dino.tescenario_nivel2 nivel2 ON nivel2.id=nivel3.id_escenario_nivel2"
            + " JOIN dino.tescenario_nivel1 nivel1 ON nivel1.id=nivel2.id_escenario_nivel1"
            + " JOIN dino.tsociedad sociedad ON sociedad.id=nivel1.id_sociedad"
            + " WHERE solicitud.id=$1", [id_solicitud]);
        let response = [];
        for (let i = 0; i < queryResponse.rows.length; i++) {
            response.push(extractSolicitudForBuscarPorFiltros(queryResponse.rows[i]));
        }
        return response;
    } catch (error) {
        error.stack = "\nError en solicitudService.buscarCabeceraPorId, " + error.stack;
        throw error;
    }
}

solicitudService.actualizarCabecera = async (conn, solicitud) => {
    try {
        const queryResponse = await conn.query("UPDATE dino.tsolicitud SET fecha_modificacion=NOW(), modificado_por=$1, descripcion=$2, id_escenario_nivel3=$3"
            + " WHERE id=$4", [solicitud.modificado_por, solicitud.descripcion, solicitud.escenarioNivel3.id, solicitud.id]);
        if (queryResponse && queryResponse.rowCount == 1) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en solicitudService.buscarCabeceraPorId, " + error.stack;
        throw error;
    }
}

solicitudService.actualizarEstado = async (conn, solicitud) => {
    try {
        const queryResponse = await conn.query("UPDATE dino.tsolicitud SET fecha_modificacion=NOW(), modificado_por=$1, id_estado_solicitud=$2 WHERE id=$3"
            , [solicitud.modificado_por, solicitud.estadoSolicitud.id, solicitud.id]);
        if (queryResponse && queryResponse.rowCount == 1) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en solicitudService.actualizarEstado, " + error.stack;
        throw error;
    }
}

solicitudService.listarCantidadMaterialSolicitudPorId = async (conn, listaIdsSolicitud) => {
    try {
        let listaQuery = "";
        for (let i = 0; i < listaIdsSolicitud.length; i++) {
            listaQuery = listaQuery + "$" + (i + 1);
            if ((i + 1) < listaIdsSolicitud.length) {
                listaQuery = listaQuery + ",";
            }
        }
        console.log("listaQuery:", listaQuery);
        const queryResponse = await conn.query("SELECT id_solicitud, COUNT(id_solicitud)::integer as cantidad FROM dino.tmaterial_solicitud WHERE id_solicitud IN (" + listaQuery + ") GROUP BY id_solicitud", listaIdsSolicitud);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en solicitudService.listarCantidadMaterialSolicitudPorId, " + error.stack;
        throw error;
    }
}

solicitudService.cantidadTotalPorListaEstrategiaYIdUsuario = async (conn, listaEstrategia, id_usuario) => {
    try {
        let finalQuery = "SELECT COUNT(*)::integer as cantidad FROM (";
        let subQuery = "";
        let queryParams = [];
        let indice = 0;
        if (listaEstrategia.length > 0) {
            for (let i = 0; i < listaEstrategia.length;) {
                subQuery = subQuery + " select aprob.id_solicitud, count(aprob.id_solicitud)"
                    + " from dino.tsolicitud soli"
                    + " join dino.taprobador_solicitud aprob on soli.id=aprob.id_solicitud"
                    + " where soli.id_escenario_nivel3=$" + (indice + 1) + " and soli.id_tipo_solicitud=$" + (indice + 2)
                    + " and aprob.id_usuario_aprobador=$" + (indice + 3)
                    + " group by aprob.id_solicitud";
                queryParams.push(listaEstrategia[i].id_escenario_nivel3);
                queryParams.push(listaEstrategia[i].id_tipo_solicitud);
                queryParams.push(id_usuario);
                indice = indice + 3;
                if ((i + 1) < listaEstrategia.length) {
                    subQuery = subQuery + " UNION ALL";
                }
                i = i + 1;
            }
            finalQuery = finalQuery + subQuery + ") t1";
            const queryResponse = await conn.query(finalQuery, queryParams);
            return queryResponse.rows;
        } else {
            throw new Error("listaEstrategia.length tiene que ser mayor a cero.");
        }
    } catch (error) {
        error.stack = "\nError en solicitudService.cantidadTotalPorListaEstrategiaYIdUsuario, " + error.stack;
        throw error;
    }
}

solicitudService.cantidadAprobacionesPorListaEstrategiaYIdUsuario = async (conn, listaEstrategia, id_usuario) => {
    try {
        let finalQuery = "SELECT SUM(t1.cantidad)::integer as cantidad FROM (";
        let subQuery = "";
        let queryParams = [];
        let indice = 0;
        if (listaEstrategia.length > 0) {
            for (let i = 0; i < listaEstrategia.length;) {
                subQuery = subQuery + " select aprob.id_solicitud, count(aprob.id_solicitud)::integer as cantidad"
                    + " from dino.tsolicitud soli"
                    + " join dino.taprobador_solicitud aprob on soli.id=aprob.id_solicitud"
                    + " where soli.id_escenario_nivel3=$" + (indice + 1) + " and soli.id_tipo_solicitud=$" + (indice + 2)
                    + " and aprob.id_usuario_aprobador=$" + (indice + 3) + " and aprob.estado_completado=true"
                    + " and aprob.tipo='F' group by aprob.id_solicitud";
                queryParams.push(listaEstrategia[i].id_escenario_nivel3);
                queryParams.push(listaEstrategia[i].id_tipo_solicitud);
                queryParams.push(id_usuario);
                indice = indice + 3;
                if ((i + 1) < listaEstrategia.length) {
                    subQuery = subQuery + " UNION ALL";
                }
                i = i + 1;
            }
            finalQuery = finalQuery + subQuery + ") t1";
            const queryResponse = await conn.query(finalQuery, queryParams);
            return queryResponse.rows;
        } else {
            throw new Error("listaEstrategia.length tiene que ser mayor a cero.");
        }
    } catch (error) {
        error.stack = "\nError en solicitudService.cantidadAprobacionesPorListaEstrategiaYIdUsuario, " + error.stack;
        throw error;
    }
}

solicitudService.cantidadPendientesPorListaEstrategiaYIdUsuario = async (conn, listaEstrategia, id_usuario) => {
    try {
        let finalQuery = "SELECT SUM(t1.cantidad)::integer as cantidad FROM (";
        let subQuery = "";
        let queryParams = [];
        let indice = 0;
        if (listaEstrategia.length > 0) {
            for (let i = 0; i < listaEstrategia.length;) {
                subQuery = subQuery + " select aprob.id_solicitud, count(aprob.id_solicitud)::integer as cantidad"
                    + " from dino.tsolicitud soli"
                    + " join dino.taprobador_solicitud aprob on soli.id=aprob.id_solicitud"
                    + " where soli.id_escenario_nivel3=$" + (indice + 1) + " and soli.id_tipo_solicitud=$" + (indice + 2)
                    + " and aprob.id_usuario_aprobador=$" + (indice + 3) + " and aprob.estado_completado=false and aprob.esta_aqui=true"
                    + " and aprob.tipo='F' group by aprob.id_solicitud";
                queryParams.push(listaEstrategia[i].id_escenario_nivel3);
                queryParams.push(listaEstrategia[i].id_tipo_solicitud);
                queryParams.push(id_usuario);
                indice = indice + 3;
                if ((i + 1) < listaEstrategia.length) {
                    subQuery = subQuery + " UNION ALL";
                }
                i = i + 1;
            }
            finalQuery = finalQuery + subQuery + ") t1";
            const queryResponse = await conn.query(finalQuery, queryParams);
            return queryResponse.rows;
        } else {
            throw new Error("listaEstrategia.length tiene que ser mayor a cero.");
        }
    } catch (error) {
        error.stack = "\nError en solicitudService.cantidadPendientesPorListaEstrategiaYIdUsuario, " + error.stack;
        throw error;
    }
}

solicitudService.obtenerParaValidar = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            'SELECT s.id \
            FROM dino.tsolicitud s \
            WHERE s.id = $1', [id_solicitud]);

        if (queryResponse.rows.length > 0) {
            return queryResponse.rows[0];
        } else {
            return null;
        }

    } catch (error) {
        error.stack = "\nError en solicitudService.obtenerParaValidar. Details: " + error.stack;
        throw error;
    }
}

solicitudService.obtenerParaNotificarRechazo = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            'SELECT s.id_motivo_rechazo, mr.nombre, s.motivo_rechazo, en1.codigo \
            FROM dino.tsolicitud s \
            INNER JOIN dino.tescenario_nivel3 en3 ON en3.id = s.id_escenario_nivel3 \
            INNER JOIN dino.tescenario_nivel2 en2 ON en2.id = en3.id_escenario_nivel2 \
            INNER JOIN dino.tescenario_nivel1 en1 ON en1.id = en2.id_escenario_nivel1 \
            LEFT JOIN dino.tmotivo_rechazo mr ON mr.id = s.id_motivo_rechazo \
            WHERE s.id = $1', [id_solicitud]);

        if (queryResponse.rows.length > 0) {
            return queryResponse.rows[0];
        } else {
            return null;
        }

    } catch (error) {
        error.stack = "\nError en solicitudService.obtenerParaNotificarRechazo. Details: " + error.stack;
        throw error;
    }
};

solicitudService.obtenerParaNotificarAprobacion = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            'SELECT s.id, en1.codigo \
            FROM dino.tsolicitud s \
            INNER JOIN dino.tescenario_nivel3 en3 ON en3.id = s.id_escenario_nivel3 \
            INNER JOIN dino.tescenario_nivel2 en2 ON en2.id = en3.id_escenario_nivel2 \
            INNER JOIN dino.tescenario_nivel1 en1 ON en1.id = en2.id_escenario_nivel1 \
            WHERE s.id = $1', [id_solicitud]);

        if (queryResponse.rows.length > 0) {
            return queryResponse.rows[0];
        } else {
            return null;
        }

    } catch (error) {
        error.stack = "\nError en solicitudService.obtenerParaNotificarAprobacion. Details: " + error.stack;
        throw error;
    }
};

solicitudService.obtener = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            'SELECT en3.id_tipo_material, tm.codigo_sap "tipo_material", tm.codigo_ramo, \
            tm.codigo_grupo_articulo, tm.codigo_categoria_valoracion \
            FROM dino.tsolicitud s \
            INNER JOIN dino.tescenario_nivel3 en3 ON en3.id = s.id_escenario_nivel3 \
            INNER JOIN dino.ttipo_material tm ON tm.id = en3.id_tipo_material \
            WHERE s.id = $1', [id_solicitud]);

        if (queryResponse.rows.length > 0) {
            return queryResponse.rows[0];
        } else {
            return null;
        }

    } catch (error) {
        error.stack = "\nError en solicitudService.obtener. Details: " + error.stack;
        throw error;
    }
}

solicitudService.contarMisSolicitudes = async (conn, filtros) => {
    try {
        let queryFinal = "SELECT DISTINCT solicitud.correlativo FROM dino.tsolicitud solicitud "
        + " join dino.testrategia ON testrategia.id_escenario_nivel3=solicitud.id_escenario_nivel3"

        + " JOIN dino.tescenario_nivel3 nivel3 ON nivel3.id=solicitud.id_escenario_nivel3"
        + " JOIN dino.tescenario_nivel2 nivel2 ON nivel2.id=nivel3.id_escenario_nivel2"
        + " JOIN dino.tescenario_nivel1 nivel1 ON nivel1.id=nivel2.id_escenario_nivel1"

        + " join dino.testrategia_rol ON testrategia_rol.id_estrategia=testrategia.id"
        + " join dino.testrategia_rol_usuario ON testrategia_rol_usuario.id_estrategia_rol=testrategia_rol.id ";

        let whereCondition = "";
        let queryParameters = [];
        let parameterNames = [];
        if (filtros.id_estado_solicitud) {
            whereCondition = whereCondition + " solicitud.id_estado_solicitud in (" + filtros.id_estado_solicitud + ") ";
        }
        if (filtros.id_escenario_nivel3) {
            parameterNames.push("id_escenario_nivel3");
        }
        if (filtros.id_tipo_solicitud) {
            parameterNames.push("id_tipo_solicitud");
        }
        if (filtros.fecha_inicio) {
            parameterNames.push("fecha_inicio");
        }
        if (filtros.fecha_fin) {
            parameterNames.push("fecha_fin");
        }

        /*         if(parameterNames.length > 0){
                    whereCondition = " WHERE ";
                } */

        let i = 0;
        for (; i < parameterNames.length;) {
            if (i > 0 || filtros.id_estado_solicitud) {
                whereCondition = whereCondition + " AND";
            }
            if (parameterNames[i] == "id_escenario_nivel3") {
                whereCondition = whereCondition + " solicitud.id_escenario_nivel3=$" + (i + 1);
                queryParameters.push(filtros.id_escenario_nivel3);
            } else if (parameterNames[i] == "id_tipo_solicitud") {
                whereCondition = whereCondition + " solicitud.id_tipo_solicitud=$" + (i + 1);
                queryParameters.push(filtros.id_tipo_solicitud);
            } else if (parameterNames[i] == "fecha_inicio") {
                whereCondition = whereCondition + " solicitud.fecha_creacion>=TO_TIMESTAMP($" + (i + 1) + ",'YYYY-MM-DD')";
                queryParameters.push(filtros.fecha_inicio);
            } else if (parameterNames[i] == "fecha_fin") {
                whereCondition = whereCondition + " solicitud.fecha_creacion<=(TO_TIMESTAMP($" + (i + 1) + ",'YYYY-MM-DD') + cast('1 day' as interval))";
                queryParameters.push(filtros.fecha_fin);
            }
            i = i + 1;
        }
        //queryFinal = queryFinal + whereCondition;
        if (whereCondition != "") {
            queryFinal = queryFinal + " where " + whereCondition;
        }

        if (filtros.id_usuario) {
            let user_where_clause = whereCondition != ""? ' AND ':'  WHERE ';
            user_where_clause += " nivel1.codigo= '"+filtros.id_escenario_nivel1+"' AND (testrategia_rol_usuario.id_usuario=" + filtros.id_usuario + "OR solicitud.id in (select id_solicitud from dino.taprobador_solicitud \
                where id_solicitud = solicitud.id \
                and id_usuario_aprobador = " + filtros.id_usuario + "))";
           
            queryFinal = queryFinal + user_where_clause;
        }
        queryFinal="select COUNT(*) as cantidad  from ( "+queryFinal+" ) arsa";
        const queryResponse = await conn.query(queryFinal, queryParameters);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en solicitudService.contarFilasPorFiltros, " + error.stack;
        throw error;
    }
};

solicitudService.buscarMisSolicitudes = async (conn, filtros) => {
    try {
        let queryFinal;
        let selectQuery = "SELECT DISTINCT solicitud.*"
            + ", usuario_creador.nombre as usuario_creador_nombre"
            + ", est_sol.nombre as estado_solicitud_nombre"
            + ", tipo_sol.nombre as tipo_solicitud_nombre"
            + ", nivel1.id_sociedad, sociedad.codigo_sap as sociedad_codigo_sap, sociedad.nombre as sociedad_nombre";
        let fromQuery = " FROM dino.tsolicitud solicitud"
            + " JOIN dino.tusuario usuario_creador ON solicitud.creado_por=usuario_creador.id"
            + " JOIN dino.testado_solicitud est_sol ON solicitud.id_estado_solicitud=est_sol.id"
            + " JOIN dino.ttipo_solicitud tipo_sol ON solicitud.id_tipo_solicitud=tipo_sol.id"
            + " JOIN dino.tescenario_nivel3 nivel3 ON nivel3.id=solicitud.id_escenario_nivel3"
            + " JOIN dino.tescenario_nivel2 nivel2 ON nivel2.id=nivel3.id_escenario_nivel2"
            + " JOIN dino.tescenario_nivel1 nivel1 ON nivel1.id=nivel2.id_escenario_nivel1"
            + " JOIN dino.tsociedad sociedad ON sociedad.id=nivel1.id_sociedad"
            + " join dino.testrategia ON testrategia.id_escenario_nivel3=solicitud.id_escenario_nivel3"
            + " join dino.testrategia_rol ON testrategia_rol.id_estrategia=testrategia.id"
            + " join dino.testrategia_rol_usuario ON testrategia_rol_usuario.id_estrategia_rol=testrategia_rol.id ";

        let whereCondition = "";
        let queryParameters = [];
        let parameterNames = [];
        if (filtros.id_usuario) {
            //parameterNames.push("id_usuario");
        }
        if (filtros.id_estado_solicitud) {
            whereCondition = whereCondition + " solicitud.id_estado_solicitud in (" + filtros.id_estado_solicitud + ") ";
            // parameterNames.push("id_estado_solicitud");
        }
        if (filtros.id_escenario_nivel3) {
            parameterNames.push("id_escenario_nivel3");
        }
        if (filtros.id_tipo_solicitud) {
            parameterNames.push("id_tipo_solicitud");
        }
        if (filtros.fecha_inicio) {
            parameterNames.push("fecha_inicio");
        }
        if (filtros.fecha_fin) {
            parameterNames.push("fecha_fin");
        }

        let i = 0;
        for (; i < parameterNames.length;) {
            if (i > 0 || filtros.id_estado_solicitud) {
                whereCondition = whereCondition + " AND "
            }
            if (parameterNames[i] == "id_usuario") {
                //selectQuery = selectQuery + ", usuario_creador.nombre as usuario_creador_nombre";
                //fromQuery = fromQuery + " JOIN dino.tusuario usuario_creador ON solicitud.creado_por=usuario_creador.id";

                // Se debe pensar como se va a filtrar por usuario
                //whereCondition = whereCondition + " solicitud.id_estado_solicitud=$"+(i+1);
                //queryParameters.push(filtros.id_estado_solicitud);
            } else if (parameterNames[i] == "id_estado_solicitud") {
                //selectQuery = selectQuery + ", est_sol.nombre as estado_solicitud_nombre";
                //fromQuery = fromQuery + " JOIN dino.testado_solicitud est_sol ON solicitud.id_estado_solicitud=est_sol.id";
                //whereCondition = whereCondition + " solicitud.id_estado_solicitud=$"+(i+1);
                //queryParameters.push(filtros.id_estado_solicitud);
            } else if (parameterNames[i] == "id_escenario_nivel3") {
                whereCondition = whereCondition + " solicitud.id_escenario_nivel3=$" + (i + 1);
                queryParameters.push(filtros.id_escenario_nivel3);
            } else if (parameterNames[i] == "id_tipo_solicitud") {
                //selectQuery = selectQuery + ", tipo_sol.nombre as tipo_solicitud_nombre";
                //fromQuery = fromQuery + " JOIN dino.ttipo_solicitud tipo_sol ON solicitud.id_tipo_solicitud=tipo_sol.id";
                whereCondition = whereCondition + " solicitud.id_tipo_solicitud=$" + (i + 1);
                queryParameters.push(filtros.id_tipo_solicitud);
            } else if (parameterNames[i] == "fecha_inicio") {
                whereCondition = whereCondition + " solicitud.fecha_creacion>=TO_TIMESTAMP($" + (i + 1) + ",'YYYY-MM-DD')";
                queryParameters.push(filtros.fecha_inicio);
            } else if (parameterNames[i] == "fecha_fin") {
                //whereCondition = whereCondition + " solicitud.fecha_creacion<=(TO_TIMESTAMP($"+(i+1)+",'YYYY-MM-DD') + cast('1 day' as interval))";
                whereCondition = whereCondition + " solicitud.fecha_creacion<=(TO_TIMESTAMP($" + (i + 1) + ",'YYYY-MM-DD HH24:MI:SS'))";
                queryParameters.push(filtros.fecha_fin + ' 23:59:59');
            }
            i = i + 1;
        }
        if (whereCondition != "") {
            queryFinal = selectQuery + fromQuery + " where " + whereCondition;
        }

        if (filtros.id_usuario) {
            let user_where_clause = whereCondition != ""? ' AND ':'  WHERE ';
            
            user_where_clause += " nivel1.codigo= '"+filtros.id_escenario_nivel1+"' AND (testrategia_rol_usuario.id_usuario=" + filtros.id_usuario + " OR solicitud.id in (select id_solicitud from dino.taprobador_solicitud \
                where id_solicitud = solicitud.id \
                and id_usuario_aprobador = " + filtros.id_usuario + "))";

           
            queryFinal = queryFinal + user_where_clause;
        }

        queryFinal+=" ORDER BY solicitud.id DESC LIMIT $" + (i + 1) + " OFFSET $" + (i + 2);

        //queryFinal = selectQuery + fromQuery + whereCondition + " ORDER BY solicitud.id DESC LIMIT $"+(i+1)+" OFFSET $"+(i+2);
        console.log("queryFinal: " + queryFinal);
        queryParameters.push(filtros.cantidad_filas);
        let bdCantidadFilas = new bigDecimal(filtros.cantidad_filas);
        let bdPaginas = new bigDecimal(filtros.pagina);
        queryParameters.push(bdCantidadFilas.multiply(bdPaginas).getValue());
        console.log("queryParameters: ", queryParameters);
        const queryResponse = await conn.query(queryFinal, queryParameters);
        const response = [];
        for (let i = 0; i < queryResponse.rows.length; i++) {
            response.push(extractSolicitudForBuscarPorFiltros(queryResponse.rows[i]));
        }
        return response;
    } catch (error) {
        error.stack = "\nError en solicitudService.buscarPorFiltros, " + error.stack;
        throw error;
    }
};

solicitudService.contarMisPendientes = async (conn, filtros) => {
    try {
        let queryFinal = "SELECT DISTINCT solicitud.correlativo FROM dino.tsolicitud solicitud "
        + " JOIN dino.testado_solicitud est_sol ON solicitud.id_estado_solicitud=est_sol.id "

        + " JOIN dino.tescenario_nivel3 nivel3 ON nivel3.id=solicitud.id_escenario_nivel3"
        + " JOIN dino.tescenario_nivel2 nivel2 ON nivel2.id=nivel3.id_escenario_nivel2"
        + " JOIN dino.tescenario_nivel1 nivel1 ON nivel1.id=nivel2.id_escenario_nivel1"
        
        + " join dino.testrategia ON testrategia.id_escenario_nivel3=solicitud.id_escenario_nivel3"
        + " join dino.testrategia_rol ON testrategia_rol.id_estrategia=testrategia.id"
        + " join dino.testrategia_rol_usuario ON testrategia_rol_usuario.id_estrategia_rol=testrategia_rol.id ";

        let whereCondition = "";
        let queryParameters = [];
        let parameterNames = [];
        if (filtros.id_estado_solicitud) {
            whereCondition = whereCondition + " solicitud.id_estado_solicitud in (" + filtros.id_estado_solicitud + ") ";
        }
        if (filtros.id_escenario_nivel3) {
            parameterNames.push("id_escenario_nivel3");
        }
        if (filtros.id_tipo_solicitud) {
            parameterNames.push("id_tipo_solicitud");
        }
        if (filtros.fecha_inicio) {
            parameterNames.push("fecha_inicio");
        }
        if (filtros.fecha_fin) {
            parameterNames.push("fecha_fin");
        }

        /*         if(parameterNames.length > 0){
                    whereCondition = " WHERE ";
                } */

        let i = 0;
        for (; i < parameterNames.length;) {
            if (i > 0 || filtros.id_estado_solicitud) {
                whereCondition = whereCondition + " AND";
            }
            if (parameterNames[i] == "id_escenario_nivel3") {
                whereCondition = whereCondition + " solicitud.id_escenario_nivel3=$" + (i + 1);
                queryParameters.push(filtros.id_escenario_nivel3);
            } else if (parameterNames[i] == "id_tipo_solicitud") {
                whereCondition = whereCondition + " solicitud.id_tipo_solicitud=$" + (i + 1);
                queryParameters.push(filtros.id_tipo_solicitud);
            } else if (parameterNames[i] == "fecha_inicio") {
                whereCondition = whereCondition + " solicitud.fecha_creacion>=TO_TIMESTAMP($" + (i + 1) + ",'YYYY-MM-DD')";
                queryParameters.push(filtros.fecha_inicio);
            } else if (parameterNames[i] == "fecha_fin") {
                whereCondition = whereCondition + " solicitud.fecha_creacion<=(TO_TIMESTAMP($" + (i + 1) + ",'YYYY-MM-DD') + cast('1 day' as interval))";
                queryParameters.push(filtros.fecha_fin);
            }
            i = i + 1;
        }
        //queryFinal = queryFinal + whereCondition;
        if (whereCondition != "") {
            queryFinal = queryFinal + " where " + whereCondition;
        }

        if (filtros.id_usuario) {
            let user_where_clause = whereCondition != ""? " AND ":"  WHERE ";
            
            user_where_clause += " nivel1.codigo= '"+filtros.id_escenario_nivel1+"' AND (testrategia_rol.id_rol=est_sol.id_rol and \
                testrategia_rol_usuario.id_usuario=" + filtros.id_usuario + " OR solicitud.id in (select id_solicitud from dino.taprobador_solicitud \
                where id_solicitud = solicitud.id \
                and esta_aqui = true \
                /*and fecha_ingreso is not null and fecha_salida is null*/ \
                and id_usuario_aprobador = " + filtros.id_usuario +"))";
            
            queryFinal = queryFinal + user_where_clause;
        }
        queryFinal="select COUNT(*) as cantidad  from ( "+queryFinal+" ) arsa";
        console.log(queryFinal);
        const queryResponse = await conn.query(queryFinal, queryParameters);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en solicitudService.contarFilasPorFiltros, " + error.stack;
        throw error;
    }
};

solicitudService.buscarMisPendientes = async (conn, filtros) => {
    try {
        let queryFinal;
        let selectQuery = "SELECT DISTINCT solicitud.*"
            + ", usuario_creador.nombre as usuario_creador_nombre"
            + ", est_sol.nombre as estado_solicitud_nombre"
            + ", tipo_sol.nombre as tipo_solicitud_nombre"
            + ", nivel1.id_sociedad, sociedad.codigo_sap as sociedad_codigo_sap, sociedad.nombre as sociedad_nombre";
        let fromQuery = " FROM dino.tsolicitud solicitud"
            + " JOIN dino.tusuario usuario_creador ON solicitud.creado_por=usuario_creador.id"
            + " JOIN dino.testado_solicitud est_sol ON solicitud.id_estado_solicitud=est_sol.id"
            + " JOIN dino.ttipo_solicitud tipo_sol ON solicitud.id_tipo_solicitud=tipo_sol.id"
            + " JOIN dino.tescenario_nivel3 nivel3 ON nivel3.id=solicitud.id_escenario_nivel3"
            + " JOIN dino.tescenario_nivel2 nivel2 ON nivel2.id=nivel3.id_escenario_nivel2"
            + " JOIN dino.tescenario_nivel1 nivel1 ON nivel1.id=nivel2.id_escenario_nivel1"
            + " JOIN dino.tsociedad sociedad ON sociedad.id=nivel1.id_sociedad"
            + " join dino.testrategia ON testrategia.id_escenario_nivel3=solicitud.id_escenario_nivel3"
            + " join dino.testrategia_rol ON testrategia_rol.id_estrategia=testrategia.id"
            + " join dino.testrategia_rol_usuario ON testrategia_rol_usuario.id_estrategia_rol=testrategia_rol.id ";
        let whereCondition = "";
        let queryParameters = [];
        let parameterNames = [];
        if (filtros.id_usuario) {
            //parameterNames.push("id_usuario");
        }
        if (filtros.id_estado_solicitud) {
            whereCondition = whereCondition + " solicitud.id_estado_solicitud in (" + filtros.id_estado_solicitud + ") ";
            // parameterNames.push("id_estado_solicitud");
        }
        if (filtros.id_escenario_nivel3) {
            parameterNames.push("id_escenario_nivel3");
        }
        if (filtros.id_tipo_solicitud) {
            parameterNames.push("id_tipo_solicitud");
        }
        if (filtros.fecha_inicio) {
            parameterNames.push("fecha_inicio");
        }
        if (filtros.fecha_fin) {
            parameterNames.push("fecha_fin");
        }

        let i = 0;
        for (; i < parameterNames.length;) {
            if (i > 0 || filtros.id_estado_solicitud) {
                whereCondition = whereCondition + " AND "
            }
            if (parameterNames[i] == "id_usuario") {
                //selectQuery = selectQuery + ", usuario_creador.nombre as usuario_creador_nombre";
                //fromQuery = fromQuery + " JOIN dino.tusuario usuario_creador ON solicitud.creado_por=usuario_creador.id";

                // Se debe pensar como se va a filtrar por usuario
                //whereCondition = whereCondition + " solicitud.id_estado_solicitud=$"+(i+1);
                //queryParameters.push(filtros.id_estado_solicitud);
            } else if (parameterNames[i] == "id_estado_solicitud") {
                //selectQuery = selectQuery + ", est_sol.nombre as estado_solicitud_nombre";
                //fromQuery = fromQuery + " JOIN dino.testado_solicitud est_sol ON solicitud.id_estado_solicitud=est_sol.id";
                //whereCondition = whereCondition + " solicitud.id_estado_solicitud=$"+(i+1);
                //queryParameters.push(filtros.id_estado_solicitud);
            } else if (parameterNames[i] == "id_escenario_nivel3") {
                whereCondition = whereCondition + " solicitud.id_escenario_nivel3=$" + (i + 1);
                queryParameters.push(filtros.id_escenario_nivel3);
            } else if (parameterNames[i] == "id_tipo_solicitud") {
                //selectQuery = selectQuery + ", tipo_sol.nombre as tipo_solicitud_nombre";
                //fromQuery = fromQuery + " JOIN dino.ttipo_solicitud tipo_sol ON solicitud.id_tipo_solicitud=tipo_sol.id";
                whereCondition = whereCondition + " solicitud.id_tipo_solicitud=$" + (i + 1);
                queryParameters.push(filtros.id_tipo_solicitud);
            } else if (parameterNames[i] == "fecha_inicio") {
                whereCondition = whereCondition + " solicitud.fecha_creacion>=TO_TIMESTAMP($" + (i + 1) + ",'YYYY-MM-DD')";
                queryParameters.push(filtros.fecha_inicio);
            } else if (parameterNames[i] == "fecha_fin") {
                //whereCondition = whereCondition + " solicitud.fecha_creacion<=(TO_TIMESTAMP($"+(i+1)+",'YYYY-MM-DD') + cast('1 day' as interval))";
                whereCondition = whereCondition + " solicitud.fecha_creacion<=(TO_TIMESTAMP($" + (i + 1) + ",'YYYY-MM-DD HH24:MI:SS'))";
                queryParameters.push(filtros.fecha_fin + ' 23:59:59');
            }
            i = i + 1;
        }
        if (whereCondition != "") {
            queryFinal = selectQuery + fromQuery + " where " + whereCondition;
        }

        if (filtros.id_usuario) {
            let user_where_clause = whereCondition != ""? ' AND ':'  WHERE ';
            
            user_where_clause += " nivel1.codigo= '"+filtros.id_escenario_nivel1+"' AND (testrategia_rol.id_rol=est_sol.id_rol and \
                testrategia_rol_usuario.id_usuario=" + filtros.id_usuario + " OR solicitud.id in (select id_solicitud from dino.taprobador_solicitud \
                where id_solicitud = solicitud.id \
                and esta_aqui = true \
                /*and fecha_ingreso is not null and fecha_salida is null*/ \
                and id_usuario_aprobador = " + filtros.id_usuario +"))";
            
            queryFinal = queryFinal + user_where_clause;
        }

        queryFinal+=" ORDER BY solicitud.id DESC LIMIT $" + (i + 1) + " OFFSET $" + (i + 2);

        //queryFinal = selectQuery + fromQuery + whereCondition + " ORDER BY solicitud.id DESC LIMIT $"+(i+1)+" OFFSET $"+(i+2);
        console.log("queryFinal: " + queryFinal);
        queryParameters.push(filtros.cantidad_filas);
        let bdCantidadFilas = new bigDecimal(filtros.cantidad_filas);
        let bdPaginas = new bigDecimal(filtros.pagina);
        queryParameters.push(bdCantidadFilas.multiply(bdPaginas).getValue());
        console.log("queryParameters: ", queryParameters);
        const queryResponse = await conn.query(queryFinal, queryParameters);
        const response = [];
        for (let i = 0; i < queryResponse.rows.length; i++) {
            response.push(extractSolicitudForBuscarPorFiltros(queryResponse.rows[i]));
        }
        return response;
    } catch (error) {
        error.stack = "\nError en solicitudService.buscarPorFiltros, " + error.stack;
        throw error;
    }
};

solicitudService.anularItemsSolicitud = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query("update dino.tmaterial_solicitud set denominacion= LEFT('anulado-' || denominacion || '-' || id, 40) where id_solicitud = $1", [id_solicitud]);
        if (queryResponse && queryResponse.rowCount >= 1) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en solicitudService.actualizarEstado, " + error.stack;
        throw error;
    }
};

module.exports = solicitudService;