const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const { StaticPool } = require("node-worker-threads-pool");
const path = require('path');
const emailValidatorFilePath = path.join(__dirname, '../workers/emailValidator.js');
const CorrelativoSolicitud = require('../domain/correlativoSolicitud');
const EstadoSolicitud = require('../domain/estadoSolicitud');
const Solicitud = require('../domain/solicitud');
const AprobadorSolicitud = require('../domain/aprobadorSolicitud');
const SupervisorSolicitud = require('../domain/supervisorSolicitud');
const Seguimiento = require('../domain/seguimiento');
const correlativoSolicitudService = require('../services/correlativoSolicitudService');
const estrategiaRolUsuarioService = require('../services/estrategiaRolUsuarioService');
const aprobadorSolicitudService = require('../services/aprobadorSolicitudService');
const supervisorSolicitudService = require('../services/supervisorSolicitudService');
const seguimientoService = require('../services/seguimientoService');
const materialSolicitudController = require('./materialSolicitudController');
const estadoSolicitudService = require('../services/estadoSolicitudService');
const notificacionController = require('./notificacionController')
const rolService = require('../services/rolService');
const usuarioService = require('../services/usuarioService');
const utilityService = require('../services/utilityService');
const solicitudService = require('../services/solicitudService');
const motivoRechazoService = require('../services/motivoRechazoService');
const materialSolicitudService = require('../services/materialSolicitudService');
const config = require('../config');
const constantes = require('../utils/constantes');
const utility = require('../utils/utility');
const { cli } = require('winston/lib/winston/config');
const areaUsuarioService = require('../services/areaUsuarioService');

const pool = new StaticPool({
    size: 4,
    task: emailValidatorFilePath,
    workerData: "workerData!",
});

const solicitudController = {};

solicitudController.crearCabecera = async (req, res) => {
    const client = await postgresConn.getClient();
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al crear la Cabecera de la Solicitud."
        };
        let { id_usuario, descripcion_corta, id_escenario_nivel3, id_tipo_solicitud
            , id_rol } = req.body;
        winston.info("***** Inicio solicitudController.crearCabecera *****\n"
            + "req.body: " + JSON.stringify(req.body));

        if (!id_usuario || isNaN(id_usuario) || id_usuario < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no es válido. Tipo de dato: '" + (typeof id_usuario) + "', valor = " + id_usuario;
            return res.status(200).json(response);
        }
        if (!id_escenario_nivel3 || isNaN(id_escenario_nivel3) || id_escenario_nivel3 < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_escenario_nivel3 no es válido. Tipo de dato: '" + (typeof id_escenario_nivel3) + "', valor = " + id_escenario_nivel3;
            return res.status(200).json(response);
        }
        if (!id_tipo_solicitud || isNaN(id_tipo_solicitud) || id_tipo_solicitud < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_tipo_solicitud no es válido. Tipo de dato: '" + (typeof id_tipo_solicitud) + "', valor = " + id_tipo_solicitud;
            return res.status(200).json(response);
        }
        if (!id_rol || isNaN(id_rol) || id_rol < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_rol no es válido. Tipo de dato: '" + (typeof id_rol) + "', valor = " + id_rol;
            return res.status(200).json(response);
        }

        await client.query("BEGIN");

        // crear solicitud
        const estadoSolicitudObj = new EstadoSolicitud();
        estadoSolicitudObj.id = 1; // 1 = Borrador

        const solicitud = new Solicitud();
        solicitud.creado_por = id_usuario;
        solicitud.estadoSolicitud = estadoSolicitudObj;
        solicitud.descripcion = descripcion_corta ? descripcion_corta : null;
        solicitud.escenarioNivel3 = { id: id_escenario_nivel3 };
        solicitud.tipoSolicitud = { id: id_tipo_solicitud };

        // Inicio crear correlativo
        /*
        let nuevoCorrelativoFormateado = null;
        const correlativoSolicitudActualRes = await correlativoSolicitudService.obtenerUltimoDeAnioActual(client);
        winston.info("correlativoSolicitudActualRes: " + JSON.stringify(correlativoSolicitudActualRes))
        if (correlativoSolicitudActualRes.length > 0) {
            // si hay correlativo actual este anio
            let correlativoNuevoInt = correlativoSolicitudActualRes[0].correlativo + 1;
            let correlativoNuevoStr = '' + correlativoNuevoInt;
            nuevoCorrelativoFormateado = correlativoSolicitudActualRes[0].anio + "-" + correlativoNuevoStr.padStart(5, "0");

            // actualizar correlativo actual en BD
            const correlativoObj = new CorrelativoSolicitud();
            correlativoObj.id = correlativoSolicitudActualRes[0].id;
            correlativoObj.anio = correlativoSolicitudActualRes[0].anio;
            correlativoObj.correlativo = correlativoNuevoInt;
            const actualizarCorrRes = await correlativoSolicitudService.actualizar(client, correlativoObj);
            if (!actualizarCorrRes) {
                await client.query("ROLLBACK");
                winston.info("actualizarCorrRes: " + actualizarCorrRes);
                response.resultado = 0;
                response.mensaje = "No se pudo actualizar la tabla tcorrelativo_solicitud con el nuevo numero correlatvo.";
                res.status(200).json(response);
                return;
            }
        } else {
            // no hay correlativo este anio
            // entonces creamos 
            const nuevoIdCorrSolicitud = await correlativoSolicitudService.crear(client);
            if (nuevoIdCorrSolicitud && nuevoIdCorrSolicitud[0].id) {
                // se creo bien la nueva fila
                const correlativoSolicitudNuevoRes = await correlativoSolicitudService.obtenerUltimoDeAnioActual(client);
                winston.info("correlativoSolicitudNuevoRes: " + JSON.stringify(correlativoSolicitudNuevoRes))
                let correlativoNuevoInt = correlativoSolicitudNuevoRes[0].correlativo;
                let correlativoNuevoStr = '' + correlativoNuevoInt;
                nuevoCorrelativoFormateado = correlativoSolicitudNuevoRes[0].anio + "-" + correlativoNuevoStr.padStart(5, "0");
            } else {
                await client.query("ROLLBACK");
                winston.info("nuevoIdCorrSolicitud: " + nuevoIdCorrSolicitud);
                response.resultado = 0;
                response.mensaje = "No se pudo crear el nuevo correlativo.";
                res.status(200).json(response);
                return;
            }
        }
        winston.info("nuevoCorrelativoFormateado: " + nuevoCorrelativoFormateado);
        */
        // Fin crear correlativo

        let nuevoCorrelativoFormateado = await obtenerCorrelativo(client, id_usuario);
        winston.info("nuevoCorrelativoFormateado: " + nuevoCorrelativoFormateado);

        if (!nuevoCorrelativoFormateado) {
            response.resultado = 0;
            response.mensaje = "No se pudo crear el nuevo correlativo.";
            res.status(200).json(response);
            return;
        }

        solicitud.correlativo = nuevoCorrelativoFormateado;

        const crearSolicitudRes = await solicitudService.crear(client, solicitud);
        winston.info("crearSolicitudRes: " + JSON.stringify(crearSolicitudRes));
        if (!(crearSolicitudRes && crearSolicitudRes[0].id)) {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "Error al intentar crear Solicitud.";
            res.status(200).json(response);
            return;
        }
        const idNuevaSolicitud = crearSolicitudRes[0].id;
        const usuarioYRolRes = await estrategiaRolUsuarioService.listarRolYUsuarioPorIdEscenarioNivel3YIdTipoSolicitud(client, id_escenario_nivel3, id_tipo_solicitud);
        winston.info("usuarioYRolRes: " + usuarioYRolRes);
        if (!(usuarioYRolRes && usuarioYRolRes.length > 0)) {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "Error al intentar buscar datos de Usuario y Rol.";
            res.status(200).json(response);
            return;
        }

        // traemos la descripcion de los Estados de Solicitud
        const listaEstadoSolicitudRes = await estadoSolicitudService.listarTodo(client);
        winston.info("listaEstadoSolicitudRes: " + JSON.stringify(listaEstadoSolicitudRes));

        // Inicio: obteniendo Fecha Actual para fecha_ingreso
        const fechaActualRes = await aprobadorSolicitudService.obtenerFechaActual(client);
        winston.info("fechaActualRes: ", fechaActualRes);
        const fechaActual = fechaActualRes[0].fecha.toISOString().replace('T', ' ').substr(0, 19);
        winston.info("fechaActual: " + fechaActual);
        // Fin: obteniendo Fecha Actual para fecha_ingreso

        let id_usuario_supervisor = null;

        // agregar aprobadores de solicitud, tipo Flujo
        let seAgregoSolicitante = false;
        for (let i = 0; i < usuarioYRolRes.length; i++) {
            if (seAgregoSolicitante === true && usuarioYRolRes[i].id_rol == 1) {
                // si ya se agrego el Rol Solicitante(1) ya no volver a agregarlo
                continue;
            } else {
                const aprobadorSolicitudObj = new AprobadorSolicitud();
                aprobadorSolicitudObj.solicitud = { id: idNuevaSolicitud };
                aprobadorSolicitudObj.orden = usuarioYRolRes[i].orden;

                aprobadorSolicitudObj.id_rol = usuarioYRolRes[i].id_rol;
                aprobadorSolicitudObj.nombre_rol = usuarioYRolRes[i].nombre_rol;
                aprobadorSolicitudObj.id_usuario_aprobador = usuarioYRolRes[i].id_usuario;
                aprobadorSolicitudObj.nombre_usuario_aprobador = usuarioYRolRes[i].nombre_usuario;
                aprobadorSolicitudObj.correo_usuario = usuarioYRolRes[i].correo_usuario;
                aprobadorSolicitudObj.aprobar_enviar_correo = usuarioYRolRes[i].aprobar_enviar_correo;
                aprobadorSolicitudObj.rechazar_enviar_correo = usuarioYRolRes[i].rechazar_enviar_correo;
                if (usuarioYRolRes[i].id_rol == 2) { // 2 = Supervisor
                    aprobadorSolicitudObj.es_supervisor = true;
                    id_usuario_supervisor = usuarioYRolRes[i].id_usuario;
                } else {
                    aprobadorSolicitudObj.es_supervisor = false;
                }

                if (usuarioYRolRes[i].id_rol == 1) {// 1= Solicitante
                    aprobadorSolicitudObj.esta_aqui = true;
                    aprobadorSolicitudObj.fecha_ingreso = fechaActual;
                    seAgregoSolicitante = true;
                } else {
                    //aprobadorSolicitudObj.id_usuario_aprobador = usuarioYRolRes[i].id_usuario;
                    aprobadorSolicitudObj.esta_aqui = false;
                    aprobadorSolicitudObj.fecha_ingreso = null;
                }

                // Inicio: agregar Estado Solicitud
                for (let j = 0; j < listaEstadoSolicitudRes.length; j++) {
                    if (usuarioYRolRes[i].id_rol == listaEstadoSolicitudRes[j].id_rol) {
                        aprobadorSolicitudObj.id_estado = listaEstadoSolicitudRes[j].id;
                        aprobadorSolicitudObj.nombre_estado = listaEstadoSolicitudRes[j].nombre;
                        break;
                    }
                }
                // Fin: agregar Estado Solicitud

                winston.info("aprobadorSolicitudObj: " + JSON.stringify(aprobadorSolicitudObj));
                const crearAprobadorRes = await aprobadorSolicitudService.crearFlujo(client, aprobadorSolicitudObj);
                if (!(crearAprobadorRes && crearAprobadorRes[0].id)) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "Error al intentar crear Aprobador de Solicitud.";
                    res.status(200).json(response);
                    return;
                }
            }

        }

        /* // quitamos la logica de agregar SAP al final del Flujo
        // Inicio: Agregamos el Usuario, Rol y Estado SAP
        const aprobadorSolicitudObj = new AprobadorSolicitud();
        aprobadorSolicitudObj.solicitud = { id: idNuevaSolicitud };
        aprobadorSolicitudObj.orden = usuarioYRolRes[usuarioYRolRes.length - 1].orden + 1;
        /// buscamos Rol 'SAP'
        const rolSapRes = await rolService.buscarPorNombre(client, "SAP");
        winston.info("rolSapRes:", rolSapRes);
        aprobadorSolicitudObj.id_rol = rolSapRes[0].id;
        aprobadorSolicitudObj.nombre_rol = rolSapRes[0].nombre;
        /// buscamos estado Solicitud de Rol 'SAP'
        const estadoSapRes = await estadoSolicitudService.buscarPorIdRol(client, rolSapRes[0].id);
        winston.info("estadoSapRes:", estadoSapRes);
        aprobadorSolicitudObj.id_estado = estadoSapRes[0].id;
        aprobadorSolicitudObj.nombre_estado = estadoSapRes[0].nombre;
        /// buscamos usuario 'SAP'
        const usuarioSapRes = await usuarioService.listarSoloUsuarioPorCampoUsuario(client,"SAP");
        winston.info("usuarioSapRes:", usuarioSapRes);
        aprobadorSolicitudObj.id_usuario_aprobador = usuarioSapRes[0].id;
        aprobadorSolicitudObj.nombre_usuario_aprobador = usuarioSapRes[0].usuario;
        aprobadorSolicitudObj.esta_aqui = false;
        winston.info("aprobadorSolicitudObj: "+JSON.stringify(aprobadorSolicitudObj));
        const crearAprobadorRes = await aprobadorSolicitudService.crearFlujo(client, aprobadorSolicitudObj);
        if(!(crearAprobadorRes && crearAprobadorRes[0].id_solicitud)){
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "Error al intentar crear Aprobador de Solicitud.";
            res.status(200).json(response);
            return;
        }
        // Fin: Agregamos el Usuario, Rol y Estado SAP
        */

        // agregar supervisor de solicitud
        const supervisorSolicitudObj = new SupervisorSolicitud();
        let crearSupervisorRes = null;
        if (id_usuario_supervisor != null) {
            supervisorSolicitudObj.solicitud = { id: idNuevaSolicitud };
            supervisorSolicitudObj.usuarioSupervisor = { id: id_usuario_supervisor };
            supervisorSolicitudObj.activo = true;
            crearSupervisorRes = await supervisorSolicitudService.crear(client, supervisorSolicitudObj);
            if (!(crearSupervisorRes && crearSupervisorRes[0].id_solicitud)) {
                await client.query("ROLLBACK");
                response.resultado = 0;
                response.mensaje = "Error al intentar crear Supervisor de Solicitud.";
                res.status(200).json(response);
                return;
            }
        }

        /*
        // En la nueva logica ya no se usa esta tabla. En la tabla taprobador_solicitud se manejara el flujo y el seguimiento
        // agregar Seguimiento
        const seguimientoObj = new Seguimiento();
        seguimientoObj.estadoSolicitud = estadoSolicitudObj;
        seguimientoObj.solicitud = { id: idNuevaSolicitud };
        seguimientoObj.motivo = null;
        seguimientoObj.usuario = { id: id_usuario };
        seguimientoObj.rol = { id: 1 };// 1 = Solicitante
        const crearSeguimientoRes = await seguimientoService.crear(client, seguimientoObj);
        if(!(crearSeguimientoRes && crearSeguimientoRes[0].id_solicitud)){
            await client.query("ROLLBACK");
                response.resultado = 0;
                response.mensaje = "Error al intentar crear Seguimiento de Solicitud.";
                res.status(200).json(response);
                return;
        }
        */

        // buscamos datos del Usuario
        const usuarioRes = await usuarioService.buscarPorId(client, id_usuario);
        winston.info("usuarioRes[0]:", usuarioRes[0]);
        // buscamos datos del Rol
        const rolRes = await rolService.buscarPorId(client, id_rol);
        winston.info("rolRes[0]:", rolRes[0]);

        // agregar Seguimiento
        const seguimientoObj = new AprobadorSolicitud();
        seguimientoObj.solicitud = { id: idNuevaSolicitud };
        /// buscamos estado de Solicitante, id_rol = 1
        const estadoSolicitudRes = await estadoSolicitudService.buscarPorIdRol(client, 1);
        seguimientoObj.id_estado_real = estadoSolicitudRes[0].id;
        seguimientoObj.nombre_estado_real = estadoSolicitudRes[0].nombre;
        seguimientoObj.id_rol_real = id_rol;
        seguimientoObj.nombre_rol_real = rolRes[0].nombre;
        seguimientoObj.id_usuario_real = id_usuario;
        seguimientoObj.nombre_usuario_real = usuarioRes[0].nombre;
        seguimientoObj.correo_usuario_real = usuarioRes[0].usuario;
        seguimientoObj.fecha_ingreso = fechaActual;
        seguimientoObj.motivo = "Creación de la Solicitud."
        const crearSeguimientoRes = await aprobadorSolicitudService.crearSeguimiento(client, seguimientoObj);
        if (!(crearSeguimientoRes && crearSeguimientoRes[0].id)) {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "Error al intentar crear Seguimiento de Solicitud.";
            res.status(200).json(response);
            return;
        }

        await client.query('COMMIT');
        response.resultado = 1;
        response.mensaje = "";
        response.id = idNuevaSolicitud;
        response.correlativo = nuevoCorrelativoFormateado;
        res.status(200).json(response);
    } catch (error) {
        await client.query("ROLLBACK");
        winston.error("Error en solicitudController.crearCabecera,", error);
        res.status(500).send(error);
    } finally {
        client.release();
        winston.info("***** Fin solicitudController.crearCabecera *****");
    }
};

solicitudController.contarFilasPorFiltros = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al contar Solicitudes."
        };
        let { id_usuario, id_estado_solicitud, id_escenario_nivel3, id_tipo_solicitud, fecha_inicio, fecha_fin } = req.body;
        // Inicio: Validando filtros
        /*
        if(!fecha_inicio || fecha_inicio==constantes.emptyString || !utility.validateStringDateYYYYMMDDConGuion(fecha_inicio)){
            response.resultado = 0;
            response.mensaje = "El campo fecha_inicio no tiene un valor válido. Tipo de dato: '"+(typeof fecha_inicio)+"', valor = "+fecha_inicio;
            winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if(!fecha_fin || fecha_fin==constantes.emptyString || !utility.validateStringDateYYYYMMDDConGuion(fecha_fin)){
            response.resultado = 0;
            response.mensaje = "El campo fecha_fin no tiene un valor válido. Tipo de dato: '"+(typeof fecha_inicio)+"', valor = "+fecha_inicio;
            winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        */
        // Fin: Validando filtros

        const cantidadFilasRes = await solicitudService.contarFilasPorFiltros(postgresConn, req.body);
        if (cantidadFilasRes[0].cantidad) {
            response.resultado = 1;
            response.mensaje = "";
            response.cantidad = cantidadFilasRes[0].cantidad;
        } else {
            response.resultado = 0;
            response.mensaje = "Error al momento de contar Solicitudes en la base de datos.";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en solicitudController.contarFilasPorFiltros,", error);
        res.status(500).send(error);
    }
};

solicitudController.buscarPorFiltros = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al buscar Solicitudes."
        };
        let { id_usuario, id_estado_solicitud, id_escenario_nivel3, id_tipo_solicitud, fecha_inicio, fecha_fin,
            cantidad_filas, pagina } = req.body;

        // Inicio: Validando filtros
        if (!utility.isNumericValue(cantidad_filas) || cantidad_filas < 1) {
            response.resultado = 0;
            response.mensaje = "El campo cantidad_filas no tiene un valor válido. Tipo de dato: '" + (typeof cantidad_filas) + "', valor = " + cantidad_filas;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if (!utility.isNumericValue(pagina) || pagina < 1) {
            response.resultado = 0;
            response.mensaje = "El campo pagina no tiene un valor válido. Tipo de dato: '" + (typeof pagina) + "', valor = " + pagina;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        // Fin: Validando filtros
        req.body.pagina = pagina - 1;
        const busquedaRes = await solicitudService.buscarPorFiltros(postgresConn, req.body);

        //Inicio: Avance de cantidad de Materiales por Solicitud
        const listaIdsSolicitud = [];
        for (let i = 0; i < busquedaRes.length; i++) {
            listaIdsSolicitud.push(busquedaRes[i].id);
        }
        winston.info("listaIdsSolicitud:", listaIdsSolicitud);
        let listaCantidadMaterialesPorIdSolicitudRes = null;
        if (listaIdsSolicitud.length > 0) {
            // buscamos cantidad de materiales por solicitud
            listaCantidadMaterialesPorIdSolicitudRes = await solicitudService.listarCantidadMaterialSolicitudPorId(postgresConn, listaIdsSolicitud);
            for (let i = 0; i < busquedaRes.length; i++) {
                for (let j = 0; j < listaCantidadMaterialesPorIdSolicitudRes.length; j++) {
                    if (busquedaRes[i].id == listaCantidadMaterialesPorIdSolicitudRes[j].id_solicitud) {
                        busquedaRes[i].cantidad_materiales = listaCantidadMaterialesPorIdSolicitudRes[j].cantidad;
                    }
                }

            }
        }

        // Si no se encontro cantidad de materiales(debido a que si no hay ni un material en la tabla tmaterial_solicitud el conteo no retorna la fila, eso quiere decir que hay CERO materiales)
        // entonces le ponemos CERO a la cantidad_materiales
        for (let i = 0; i < busquedaRes.length; i++) {
            if (!busquedaRes[i].cantidad_materiales) {
                busquedaRes[i].cantidad_materiales = 0;
            }
        }
        // Fin: Avance de cantidad de Materiales por Solicitud


        if (busquedaRes) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = busquedaRes;
        } else {
            response.resultado = 0;
            response.mensaje = "Error al momento de buscar Solicitudes en la base de datos.";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en solicitudController.buscarPorFiltros,", error);
        res.status(500).send(error);
    }
};

solicitudController.contarMisSolicitudes = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al contar Solicitudes."
        };
        let { id_usuario, id_estado_solicitud, id_escenario_nivel3, id_tipo_solicitud, fecha_inicio, fecha_fin } = req.body;
        // Inicio: Validando filtros
        /*
        if(!fecha_inicio || fecha_inicio==constantes.emptyString || !utility.validateStringDateYYYYMMDDConGuion(fecha_inicio)){
            response.resultado = 0;
            response.mensaje = "El campo fecha_inicio no tiene un valor válido. Tipo de dato: '"+(typeof fecha_inicio)+"', valor = "+fecha_inicio;
            winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if(!fecha_fin || fecha_fin==constantes.emptyString || !utility.validateStringDateYYYYMMDDConGuion(fecha_fin)){
            response.resultado = 0;
            response.mensaje = "El campo fecha_fin no tiene un valor válido. Tipo de dato: '"+(typeof fecha_inicio)+"', valor = "+fecha_inicio;
            winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        */
        // Fin: Validando filtros

        const cantidadFilasRes = await solicitudService.contarMisSolicitudes(postgresConn, req.body);
        if (cantidadFilasRes[0].cantidad) {
            response.resultado = 1;
            response.mensaje = "";
            response.cantidad = cantidadFilasRes[0].cantidad;
        } else {
            response.resultado = 0;
            response.mensaje = "Error al momento de contar Solicitudes en la base de datos.";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en solicitudController.contarMisSolicitudes,", error);
        res.status(500).send(error);
    }
};

solicitudController.buscarMisSolicitudes = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al buscar Solicitudes."
        };
        let { id_usuario, id_estado_solicitud, id_escenario_nivel3, id_tipo_solicitud, fecha_inicio, fecha_fin,
            cantidad_filas, pagina } = req.body;

        // Inicio: Validando filtros
        if (!utility.isNumericValue(cantidad_filas) || cantidad_filas < 1) {
            response.resultado = 0;
            response.mensaje = "El campo cantidad_filas no tiene un valor válido. Tipo de dato: '" + (typeof cantidad_filas) + "', valor = " + cantidad_filas;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if (!utility.isNumericValue(pagina) || pagina < 1) {
            response.resultado = 0;
            response.mensaje = "El campo pagina no tiene un valor válido. Tipo de dato: '" + (typeof pagina) + "', valor = " + pagina;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        // Fin: Validando filtros
        req.body.pagina = pagina - 1;
        const busquedaRes = await solicitudService.buscarMisSolicitudes(postgresConn, req.body);

        //Inicio: Avance de cantidad de Materiales por Solicitud
        const listaIdsSolicitud = [];
        for (let i = 0; i < busquedaRes.length; i++) {
            listaIdsSolicitud.push(busquedaRes[i].id);
        }
        winston.info("listaIdsSolicitud:", listaIdsSolicitud);
        let listaCantidadMaterialesPorIdSolicitudRes = null;
        if (listaIdsSolicitud.length > 0) {
            // buscamos cantidad de materiales por solicitud
            listaCantidadMaterialesPorIdSolicitudRes = await solicitudService.listarCantidadMaterialSolicitudPorId(postgresConn, listaIdsSolicitud);
            for (let i = 0; i < busquedaRes.length; i++) {
                for (let j = 0; j < listaCantidadMaterialesPorIdSolicitudRes.length; j++) {
                    if (busquedaRes[i].id == listaCantidadMaterialesPorIdSolicitudRes[j].id_solicitud) {
                        busquedaRes[i].cantidad_materiales = listaCantidadMaterialesPorIdSolicitudRes[j].cantidad;
                    }
                }

            }
        }

        // Si no se encontro cantidad de materiales(debido a que si no hay ni un material en la tabla tmaterial_solicitud el conteo no retorna la fila, eso quiere decir que hay CERO materiales)
        // entonces le ponemos CERO a la cantidad_materiales
        for (let i = 0; i < busquedaRes.length; i++) {
            if (!busquedaRes[i].cantidad_materiales) {
                busquedaRes[i].cantidad_materiales = 0;
            }
        }
        // Fin: Avance de cantidad de Materiales por Solicitud


        if (busquedaRes) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = busquedaRes;
        } else {
            response.resultado = 0;
            response.mensaje = "Error al momento de buscar Solicitudes en la base de datos.";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en solicitudController.buscarMisSolicitudes,", error);
        res.status(500).send(error);
    }
};

solicitudController.contarMisPendientes = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al contar Solicitudes."
        };
        let { id_escenario_nivel1, id_usuario, id_estado_solicitud, id_escenario_nivel3, id_tipo_solicitud, fecha_inicio, fecha_fin } = req.body;
        // Inicio: Validando filtros
        /*
        if(!fecha_inicio || fecha_inicio==constantes.emptyString || !utility.validateStringDateYYYYMMDDConGuion(fecha_inicio)){
            response.resultado = 0;
            response.mensaje = "El campo fecha_inicio no tiene un valor válido. Tipo de dato: '"+(typeof fecha_inicio)+"', valor = "+fecha_inicio;
            winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if(!fecha_fin || fecha_fin==constantes.emptyString || !utility.validateStringDateYYYYMMDDConGuion(fecha_fin)){
            response.resultado = 0;
            response.mensaje = "El campo fecha_fin no tiene un valor válido. Tipo de dato: '"+(typeof fecha_inicio)+"', valor = "+fecha_inicio;
            winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        */
        // Fin: Validando filtros

        const cantidadFilasRes = await solicitudService.contarMisPendientes(postgresConn, req.body);
        if (cantidadFilasRes[0].cantidad) {
            response.resultado = 1;
            response.mensaje = "";
            response.cantidad = cantidadFilasRes[0].cantidad;
        } else {
            response.resultado = 0;
            response.mensaje = "Error al momento de contar Solicitudes en la base de datos.";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en solicitudController.contarMisPendientes,", error);
        res.status(500).send(error);
    }
};

solicitudController.buscarMisPendientes = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al buscar Solicitudes."
        };
        let { id_usuario, id_estado_solicitud, id_escenario_nivel3, id_tipo_solicitud, fecha_inicio, fecha_fin,
            cantidad_filas, pagina } = req.body;

        // Inicio: Validando filtros
        if (!utility.isNumericValue(cantidad_filas) || cantidad_filas < 1) {
            response.resultado = 0;
            response.mensaje = "El campo cantidad_filas no tiene un valor válido. Tipo de dato: '" + (typeof cantidad_filas) + "', valor = " + cantidad_filas;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if (!utility.isNumericValue(pagina) || pagina < 1) {
            response.resultado = 0;
            response.mensaje = "El campo pagina no tiene un valor válido. Tipo de dato: '" + (typeof pagina) + "', valor = " + pagina;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        // Fin: Validando filtros
        req.body.pagina = pagina - 1;
        const busquedaRes = await solicitudService.buscarMisPendientes(postgresConn, req.body);

        //Inicio: Avance de cantidad de Materiales por Solicitud
        const listaIdsSolicitud = [];
        for (let i = 0; i < busquedaRes.length; i++) {
            listaIdsSolicitud.push(busquedaRes[i].id);
        }
        winston.info("listaIdsSolicitud:", listaIdsSolicitud);
        let listaCantidadMaterialesPorIdSolicitudRes = null;
        if (listaIdsSolicitud.length > 0) {
            // buscamos cantidad de materiales por solicitud
            listaCantidadMaterialesPorIdSolicitudRes = await solicitudService.listarCantidadMaterialSolicitudPorId(postgresConn, listaIdsSolicitud);
            for (let i = 0; i < busquedaRes.length; i++) {
                for (let j = 0; j < listaCantidadMaterialesPorIdSolicitudRes.length; j++) {
                    if (busquedaRes[i].id == listaCantidadMaterialesPorIdSolicitudRes[j].id_solicitud) {
                        busquedaRes[i].cantidad_materiales = listaCantidadMaterialesPorIdSolicitudRes[j].cantidad;
                    }
                }

            }
        }

        // Si no se encontro cantidad de materiales(debido a que si no hay ni un material en la tabla tmaterial_solicitud el conteo no retorna la fila, eso quiere decir que hay CERO materiales)
        // entonces le ponemos CERO a la cantidad_materiales
        for (let i = 0; i < busquedaRes.length; i++) {
            if (!busquedaRes[i].cantidad_materiales) {
                busquedaRes[i].cantidad_materiales = 0;
            }
        }
        // Fin: Avance de cantidad de Materiales por Solicitud


        if (busquedaRes) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = busquedaRes;
        } else {
            response.resultado = 0;
            response.mensaje = "Error al momento de buscar Solicitudes en la base de datos.";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en solicitudController.buscarMisPendientes,", error);
        res.status(500).send(error);
    }
};

solicitudController.obtenerDatosDeSolicitud = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener datos de Solicitud."
        };
        let { id_solicitud, id_rol } = req.body;
        // Inicio: Validando filtros
        if (!utility.isNumericValue(id_solicitud) || id_solicitud < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no tiene un valor válido. Tipo de dato: '" + (typeof id_solicitud) + "', valor = " + id_solicitud;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if (!utility.isNumericValue(id_rol) || id_rol < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_rol no tiene un valor válido. Tipo de dato: '" + (typeof id_rol) + "', valor = " + id_rol;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        // Fin: Validando filtros
        const busquedaCabeceraRes = await solicitudService.buscarCabeceraPorId(postgresConn, id_solicitud);

        // aqui agregar logica del listar detalle de materiales de solicitud
        let detalles = await materialSolicitudController.internal.listar(id_solicitud);

        response.resultado = 1;
        response.mensaje = "";
        response.objeto = busquedaCabeceraRes[0];
        response.objeto.materiales_solicitud = detalles;
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en solicitudController.obtenerDatosDeSolicitud,", error);
        res.status(500).send(error);
    }
}

solicitudController.actualizarCabecera = async (req, res) => {
    const client = await postgresConn.getClient();
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al actualizar Cabecera de Solicitud."
        };
        let { id_usuario, descripcion_corta, id_escenario_nivel3, id_solicitud } = req.body;
        winston.info("req.body: " + JSON.stringify(req.body));
        // Inicio: Validando parametros
        if (!utility.isNumericValue(id_usuario) || id_usuario < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no tiene un valor válido. Tipo de dato: '" + (typeof id_usuario) + "', valor = " + id_usuario;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if (!utility.isNumericValue(id_escenario_nivel3) || id_escenario_nivel3 < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_escenario_nivel3 no tiene un valor válido. Tipo de dato: '" + (typeof id_escenario_nivel3) + "', valor = " + id_escenario_nivel3;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if (!utility.isNumericValue(id_solicitud) || id_solicitud < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no tiene un valor válido. Tipo de dato: '" + (typeof id_solicitud) + "', valor = " + id_solicitud;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        // Fin: Validando parametros

        await client.query("BEGIN");
        const buscarSolicitudRes = await solicitudService.buscarCabeceraPorId(client, id_solicitud);
        winston.info("buscarSolicitudRes: " + JSON.stringify(buscarSolicitudRes));
        if (buscarSolicitudRes[0]) {
            if (buscarSolicitudRes[0].escenarioNivel3.id != id_escenario_nivel3) {
                // Si cambio el id_escenario_nivel3, entonces borramos los datos del detalle de la Solicitud
                winston.info("borrando detalles de Solicitud.")
                await materialSolicitudController.internal.eliminarPorSolicitud(client, id_solicitud);
                winston.info("termino borrado detalles de Solicitud.")
            }

            // actualizamos la cabecera de Solicitud
            const solicitud = new Solicitud();
            solicitud.modificado_por = id_usuario;
            solicitud.descripcion = descripcion_corta ? descripcion_corta : null;
            solicitud.escenarioNivel3 = { id: id_escenario_nivel3 };
            solicitud.id = id_solicitud;
            const actualizarCabeceraSolicitudRes = await solicitudService.actualizarCabecera(client, solicitud);
            if (!actualizarCabeceraSolicitudRes) {
                await client.query("ROLLBACK");
                response.resultado = 0;
                response.mensaje = "No se encontró Solicitud para actualizar con id = " + id_solicitud;
                res.status(200).json(response);
                return;
            }
        } else {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "No se encontró Solicitud con id = " + id_solicitud;
            res.status(200).json(response);
            return;
        }

        // si todo salio bien entonces hacemos commit
        await client.query('COMMIT');
        response.resultado = 1;
        response.mensaje = "";
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en solicitudController.actualizarCabecera,", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
}

/*
solicitudController.agregarAnexo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al agregar anexo a Solicitud."
        }
        winston.info("req.file:", req.file);
        if(req.file.path){
            response.resultado = 1;
            response.mensaje = "";
            response.ruta_anexo = path.basename(req.file.path);
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en solicitudController.agregarAnexo,", error);
        res.status(500).send(error);
    }
}
*/

solicitudController.anularSolicitud = async (req, res) => {
    const client = await postgresConn.getClient();
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al anular de Solicitud."
        };
        winston.info("req.body: " + JSON.stringify(req.body));
        let { id_usuario, id_solicitud, id_rol } = req.body;
        // Inicio Validando parametros
        if (!utility.isNumericValue(id_usuario) || id_usuario < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no tiene un valor válido. Tipo de dato: '" + (typeof id_usuario) + "', valor = " + id_usuario;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if (!utility.isNumericValue(id_solicitud) || id_solicitud < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no tiene un valor válido. Tipo de dato: '" + (typeof id_solicitud) + "', valor = " + id_solicitud;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if (!utility.isNumericValue(id_rol) || id_rol < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_rol no tiene un valor válido. Tipo de dato: '" + (typeof id_rol) + "', valor = " + id_rol;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        // Fin Validando parametros

        await client.query("BEGIN");

        // buscamos datos del Usuario
        const usuarioRes = await usuarioService.buscarPorId(client, id_usuario);
        winston.info("usuarioRes[0]:", usuarioRes[0]);
        // buscamos datos del Rol
        const rolRes = await rolService.buscarPorId(client, id_rol);
        winston.info("rolRes[0]:", rolRes[0]);

        // cambiar el estado de Solicitud a 'Anulado'
        const solicitud = new Solicitud();
        solicitud.modificado_por = id_usuario;
        solicitud.estadoSolicitud = { id: 2 }; //2 = 'Anulado'
        solicitud.id = id_solicitud;
        const actualizarSolicitudRes = await solicitudService.actualizarEstado(client, solicitud);
        if (!actualizarSolicitudRes) {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "No se pudo actualizar la Solicitud.";
            res.status(200).json(response);
            return;
        }

        /*
        // poner en tabla Seguimiento que se Anulo
        const seguimiento = new Seguimiento();
        seguimiento.estadoSolicitud = { id: 2 }; //2 = 'Anulado'
        seguimiento.solicitud = { id: id_solicitud };
        seguimiento.motivo = "Se anula la Solicitud";
        seguimiento.usuario = { id: id_usuario };
        seguimiento.rol = { id: id_rol };
        const crearSeguimientoRes = await seguimientoService.crear(client, seguimiento);
        if(!crearSeguimientoRes[0].id_solicitud){
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "No se pudo guardar el Seguimiento.";
            res.status(200).json(response);
            return;
        }
        */

        // Inicio: listar Aprobadores de Solicitud (Flujo) ordenado por orden
        const listaAprobadoresRes = await aprobadorSolicitudService.listarFlujoPorIdSolicitudOrdenadoPorOrden(client, id_solicitud);
        winston.info("listaAprobadoresRes: " + JSON.stringify(listaAprobadoresRes));
        if (listaAprobadoresRes.length < 1) {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "No se encontró aprobadores con id_solicitud = " + id_solicitud;
            res.status(200).json(response);
            return;
        }
        // buscamos la posicion donde se encuentra la Solicitud en el Flujo
        let posicion = null;
        for (let i = 0; i < listaAprobadoresRes.length; i++) {
            if (listaAprobadoresRes[i].esta_aqui === true) {
                posicion = i;
                break;
            }
        }
        // Fin: listar Aprobadores de Solicitud (Flujo) ordenado por orden

        if (listaAprobadoresRes[posicion].id_estado_real == 2) {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "No se puede anular la Solicitud, ya esta anulada.";
            res.status(200).json(response);
            return;
        }

        // Inicio: obteniendo Fecha Actual
        const fechaActualRes = await aprobadorSolicitudService.obtenerFechaActual(client);
        winston.info("fechaActualRes: ", fechaActualRes);
        const fechaActual = fechaActualRes[0].fecha.toISOString().replace('T', ' ').substr(0, 19);
        winston.info("fechaActual: " + fechaActual);
        // Fin: obteniendo Fecha Actual

        // Inicio: Para Flujo: 
        /// Inicio: se actualiza el usuario Actual
        const aprobadorFlujoActualObj = new AprobadorSolicitud();
        aprobadorFlujoActualObj.id = listaAprobadoresRes[posicion].id;
        aprobadorFlujoActualObj.id_estado_real = 2;
        aprobadorFlujoActualObj.nombre_estado_real = 'Anulado';
        aprobadorFlujoActualObj.id_rol_real = id_rol;
        aprobadorFlujoActualObj.nombre_rol_real = rolRes[0].nombre;
        aprobadorFlujoActualObj.id_usuario_real = id_usuario;
        aprobadorFlujoActualObj.nombre_usuario_real = usuarioRes[0].nombre;
        aprobadorFlujoActualObj.correo_usuario_real = usuarioRes[0].usuario;
        aprobadorFlujoActualObj.fecha_ingreso = listaAprobadoresRes[posicion].fecha_ingreso.toISOString().replace('T', ' ').substr(0, 19);
        aprobadorFlujoActualObj.fecha_salida = fechaActual;
        aprobadorFlujoActualObj.estado_completado = true;
        aprobadorFlujoActualObj.motivo = null;
        aprobadorFlujoActualObj.duracion = null;
        const actualizarFlujoActualRes = await aprobadorSolicitudService.actualizarFlujo(client, aprobadorFlujoActualObj);
        if (!actualizarFlujoActualRes) {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "Error al momento de actualizar el flujo del usuario actual.";
            res.status(200).json(response);
            return;
        }
        // Fin: Para Flujo

        // 2. Inicio: Para Seguimiento:
        /// buscamos los registros de Seguimiento
        const listaSeguimientoRes = await aprobadorSolicitudService.listarSeguimientoPorIdSolicitudOrdenadoPorId(client, id_solicitud);
        winston.info("listaSeguimientoRes: " + JSON.stringify(listaSeguimientoRes));
        /// calculamos la duracion
        const segundosDuracionRes = await utilityService.extractSegundosEnBigintDeRestarTimestampString(client, fechaActual, listaSeguimientoRes[listaSeguimientoRes.length - 1].fecha_ingreso.toISOString().replace('T', ' ').substr(0, 19));
        winston.info("segundosDuracionRes: " + JSON.stringify(segundosDuracionRes))
        const duracion = utility.convertSecondsInDaysHoursString(segundosDuracionRes[0].segundos);
        winston.info("duracion: " + duracion);
        /// actualizamos la fecha_salida y la duracion del ultimo registro de seguimiento
        const seguimientoActualObj = new AprobadorSolicitud();
        seguimientoActualObj.id = listaSeguimientoRes[listaSeguimientoRes.length - 1].id;
        seguimientoActualObj.fecha_salida = fechaActual;
        seguimientoActualObj.duracion = duracion;
        const actualizarSeguimientoActualRes = await aprobadorSolicitudService.actualizarSeguimiento(client, seguimientoActualObj);
        if (!actualizarSeguimientoActualRes) {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "No se puede actualizar el Seguimiento Actual.";
            res.status(200).json(response);
            return;
        }

        /// Inicio: Agregamos nuevo registro de Seguimiento
        const nuevoSeguimientoObj = new AprobadorSolicitud();
        nuevoSeguimientoObj.solicitud = { id: id_solicitud };
        nuevoSeguimientoObj.id_estado_real = 2;// Anulado
        nuevoSeguimientoObj.nombre_estado_real = 'Anulado';
        nuevoSeguimientoObj.id_rol_real = id_rol;
        nuevoSeguimientoObj.nombre_rol_real = rolRes[0].nombre;
        nuevoSeguimientoObj.id_usuario_real = id_usuario;
        nuevoSeguimientoObj.nombre_usuario_real = usuarioRes[0].nombre;
        nuevoSeguimientoObj.correo_usuario_real = usuarioRes[0].usuario;
        nuevoSeguimientoObj.fecha_ingreso = fechaActual;
        nuevoSeguimientoObj.motivo = 'Anulación de Solicitud';
        const crearSeguimientoRes = await aprobadorSolicitudService.crearSeguimiento(client, nuevoSeguimientoObj);
        if (!(crearSeguimientoRes && crearSeguimientoRes[0].id)) {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "No se pudo crear el nuevo registro de Seguimiento.";
            res.status(200).json(response);
            return;
        }
        const anularItemsSolicitud = await solicitudService.anularItemsSolicitud(client, id_solicitud);
        if (!anularItemsSolicitud) {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "No se pudo anular Items de  la Solicitud.";
            res.status(200).json(response);
            return;
        }

        /// Fin: Agregamos nuevo registro de Seguimiento
        // 2. Fin: Para Seguimiento

        // si todo salio bien entonces hacemos commit
        await client.query('COMMIT');
        response.resultado = 1;
        response.mensaje = "";
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en solicitudController.anularSolicitud,", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
}

solicitudController.aprobacionRechazoSolicitud = async (req, res) => {
    const client = await postgresConn.getClient();
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al anular de Solicitud."
        };
        winston.info("req.body: " + JSON.stringify(req.body));
        let { id_usuario, id_solicitud, id_rol, aprobado, motivo, id_motivo_rechazo } = req.body;
        // Inicio Validando parametros
        if (!utility.isNumericValue(id_usuario) || id_usuario < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no tiene un valor válido. Tipo de dato: '" + (typeof id_usuario) + "', valor = " + id_usuario;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if (!utility.isNumericValue(id_solicitud) || id_solicitud < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no tiene un valor válido. Tipo de dato: '" + (typeof id_solicitud) + "', valor = " + id_solicitud;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if (!utility.isNumericValue(id_rol) || id_rol < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_rol no tiene un valor válido. Tipo de dato: '" + (typeof id_rol) + "', valor = " + id_rol;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if ((typeof aprobado) !== 'boolean') {
            response.resultado = 0;
            response.mensaje = "El campo aprobado no tiene un valor válido. Tipo de dato: '" + (typeof aprobado) + "', valor = " + aprobado;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        // Fin Validando parametros

        await client.query("BEGIN");
        // listar Aprobadores de Solicitud (Flujo) ordenado por orden
        const listaAprobadoresRes = await aprobadorSolicitudService.listarFlujoPorIdSolicitudOrdenadoPorOrden(client, id_solicitud);
        winston.info("listaAprobadoresRes: " + JSON.stringify(listaAprobadoresRes));
        if (listaAprobadoresRes.length < 1) {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "No se encontró aprobadores con id_solicitud = " + id_solicitud;
            res.status(200).json(response);
            return;
        }
        // buscamos la posicion donde se encuentra la Solicitud en el Flujo
        let posicion = null;
        for (let i = 0; i < listaAprobadoresRes.length; i++) {
            if (listaAprobadoresRes[i].esta_aqui === true) {
                posicion = i;
                break;
            }
        }

        let id_rol_nuevo = null; // el nuevo rol en el que se encontrara la Solicitud
        let id_usuario_nuevo = null; // el nuevo usuario en el que se encontrara la Solicitud

        // buscamos datos del Usuario
        const usuarioRes = await usuarioService.buscarPorId(client, id_usuario);
        winston.info("usuarioRes[0]:", usuarioRes[0]);
        // buscamos datos del Rol
        const rolRes = await rolService.buscarPorId(client, id_rol);
        winston.info("rolRes[0]:", rolRes[0]);

        // Inicio: obteniendo Fecha Actual
        const fechaActualRes = await aprobadorSolicitudService.obtenerFechaActual(client);
        winston.info("fechaActualRes: ", fechaActualRes);
        const fechaActual = fechaActualRes[0].fecha.toISOString().replace('T', ' ').substr(0, 19);
        winston.info("fechaActual: " + fechaActual);
        // Fin: obteniendo Fecha Actual

        /// buscamos los registros de Seguimiento
        const listaSeguimientoRes = await aprobadorSolicitudService.listarSeguimientoPorIdSolicitudOrdenadoPorId(client, id_solicitud);
        winston.info("listaSeguimientoRes: " + JSON.stringify(listaSeguimientoRes));

        if (listaSeguimientoRes[listaSeguimientoRes.length - 1].id_estado_real == config.constantesDb.id_estado_solicitud_en_sap) {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "No se puede aprobar o rechazar una Solicitud que esta en SAP.";
            res.status(200).json(response);
            return;
        }

        let nombre_motivo_rechazo = '';
        // Verificamos si se esta Aprobando o Rechazando
        if (aprobado === true) {
            // Si la solicitud esta en el ultimo usuario del flujo
            if ((posicion + 1) == listaAprobadoresRes.length) {
                // Logica para enviar datos de Solicitud a SAP
                // Inicio: Enviar a SAP datos de la solicitud
                const envioSolicitudSAPRes = await materialSolicitudController.internal.enviarSAP(id_solicitud);
                if (!(envioSolicitudSAPRes.resultado === 1)) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "Ocurrio un error al enviar a SAP. " + envioSolicitudSAPRes.mensaje;
                    res.status(200).json(response);
                    return;
                }
                //Fin: Enviar a SAP datos de la solicitud

                // Inicio: Para Flujo: se actualiza el usuario Actual
                const aprobadorFlujoActualObj = new AprobadorSolicitud();
                aprobadorFlujoActualObj.id = listaAprobadoresRes[posicion].id;
                /// buscamos estado real
                const estadoSolicitudRes = await estadoSolicitudService.buscarPorIdRol(client, id_rol);
                aprobadorFlujoActualObj.id_estado_real = estadoSolicitudRes[0].id;
                aprobadorFlujoActualObj.nombre_estado_real = estadoSolicitudRes[0].nombre;

                aprobadorFlujoActualObj.id_rol_real = id_rol;
                aprobadorFlujoActualObj.nombre_rol_real = rolRes[0].nombre;
                aprobadorFlujoActualObj.id_usuario_real = id_usuario;
                aprobadorFlujoActualObj.nombre_usuario_real = usuarioRes[0].nombre;
                aprobadorFlujoActualObj.correo_usuario_real = usuarioRes[0].usuario;
                aprobadorFlujoActualObj.fecha_ingreso = listaAprobadoresRes[posicion].fecha_ingreso.toISOString().replace('T', ' ').substr(0, 19);
                aprobadorFlujoActualObj.fecha_salida = fechaActual;
                aprobadorFlujoActualObj.estado_completado = true;
                aprobadorFlujoActualObj.motivo = null;
                aprobadorFlujoActualObj.duracion = null;
                const actualizarFlujoActualRes = await aprobadorSolicitudService.actualizarFlujo(client, aprobadorFlujoActualObj);
                if (!actualizarFlujoActualRes) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "Error al momento de actualizar el flujo del usuario actual.";
                    res.status(200).json(response);
                    return;
                }
                // Fin: Para Flujo

                // Para Seguimiento:

                /// calculamos la duracion
                const segundosDuracionRes = await utilityService.extractSegundosEnBigintDeRestarTimestampString(client, fechaActual, listaSeguimientoRes[listaSeguimientoRes.length - 1].fecha_ingreso.toISOString().replace('T', ' ').substr(0, 19));
                winston.info("segundosDuracionRes: " + JSON.stringify(segundosDuracionRes))
                const duracion = utility.convertSecondsInDaysHoursString(segundosDuracionRes[0].segundos);
                winston.info("duracion: " + duracion);
                /// actualizamos la fecha_salida y la duracion del ultimo registro de seguimiento
                const seguimientoActualObj = new AprobadorSolicitud();
                seguimientoActualObj.id = listaSeguimientoRes[listaSeguimientoRes.length - 1].id;
                seguimientoActualObj.fecha_salida = fechaActual;
                seguimientoActualObj.duracion = duracion;
                const actualizarSeguimientoActualRes = await aprobadorSolicitudService.actualizarSeguimiento(client, seguimientoActualObj);
                if (!actualizarSeguimientoActualRes) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "No se puede actualizar el Seguimiento Actual.";
                    res.status(200).json(response);
                    return;
                }

                /// Inicio: Agregamos nuevo registro de Seguimiento
                const nuevoSeguimientoObj = new AprobadorSolicitud();
                nuevoSeguimientoObj.solicitud = { id: id_solicitud };
                nuevoSeguimientoObj.id_estado_real = config.constantesDb.id_estado_solicitud_en_sap;// id estado en SAP
                nuevoSeguimientoObj.nombre_estado_real = config.constantesDb.nombre_estado_solicitud_en_sap;
                nuevoSeguimientoObj.id_rol_real = config.constantesDb.id_rol_sap;// id rol SAP
                nuevoSeguimientoObj.nombre_rol_real = config.constantesDb.nombre_rol_sap;
                nuevoSeguimientoObj.id_usuario_real = config.constantesDb.id_usuario_sap;
                //nuevoSeguimientoObj.nombre_usuario_real = usuarioRes[0].nombre;
                //nuevoSeguimientoObj.correo_usuario_real = usuarioRes[0].usuario;
                // buscamos usuario SAP
                const usuarioSapRes = await usuarioService.buscarPorId(client, config.constantesDb.id_usuario_sap);
                nuevoSeguimientoObj.nombre_usuario_real = usuarioSapRes[0].nombre;
                nuevoSeguimientoObj.correo_usuario_real = usuarioSapRes[0].usuario;
                nuevoSeguimientoObj.fecha_ingreso = fechaActual;
                nuevoSeguimientoObj.motivo = motivo;
                const crearSeguimientoRes = await aprobadorSolicitudService.crearSeguimiento(client, nuevoSeguimientoObj);
                if (!(crearSeguimientoRes && crearSeguimientoRes[0].id)) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "No se pudo crear el nuevo registro de Seguimiento.";
                    res.status(200).json(response);
                    return;
                }
                /// Fin: Agregamos nuevo registro de Seguimiento
                id_rol_nuevo = 7;// id rol SAP

            } else {
                // Si la solicitud esta en cualquier otra parte del flujo que no sea el final
                // Inicio: Para Flujo: 
                /// Inicio: se actualiza el usuario Actual
                const aprobadorFlujoActualObj = new AprobadorSolicitud();
                aprobadorFlujoActualObj.id = listaAprobadoresRes[posicion].id;
                aprobadorFlujoActualObj.id_estado_real = listaAprobadoresRes[posicion].id_estado;
                aprobadorFlujoActualObj.nombre_estado_real = listaAprobadoresRes[posicion].nombre_estado;

                aprobadorFlujoActualObj.id_rol_real = id_rol;
                aprobadorFlujoActualObj.nombre_rol_real = rolRes[0].nombre;
                aprobadorFlujoActualObj.id_usuario_real = id_usuario;
                aprobadorFlujoActualObj.nombre_usuario_real = usuarioRes[0].nombre;
                aprobadorFlujoActualObj.correo_usuario_real = usuarioRes[0].usuario;
                aprobadorFlujoActualObj.fecha_ingreso = listaAprobadoresRes[posicion].fecha_ingreso.toISOString().replace('T', ' ').substr(0, 19);
                aprobadorFlujoActualObj.fecha_salida = fechaActual;
                aprobadorFlujoActualObj.estado_completado = true;
                aprobadorFlujoActualObj.motivo = null;
                aprobadorFlujoActualObj.duracion = null;
                const actualizarFlujoActualRes = await aprobadorSolicitudService.actualizarFlujo(client, aprobadorFlujoActualObj);
                if (!actualizarFlujoActualRes) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "Error al momento de actualizar el flujo del usuario actual.";
                    res.status(200).json(response);
                    return;
                }

                //// Inicio: actualizar esta_aqui de usuario Actual
                const actualizarEstaAquiUsuActualRes = await aprobadorSolicitudService.actualizarEstaAquiPorId(client, false, listaAprobadoresRes[posicion].id);
                if (!actualizarEstaAquiUsuActualRes) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "1.- Aprobacion: No se pudo actualizar campo esta_aqui en el flujo de la Solicitud.";
                    res.status(200).json(response);
                    return;
                }
                //// Fin: actualizar esta_aqui de usuario Actual
                /// Fin: se actualiza el usuario Actual

                /// Inicio: se actualiza el usuario Siguiente
                const aprobadorFlujoSiguienteObj = new AprobadorSolicitud();
                aprobadorFlujoSiguienteObj.id = listaAprobadoresRes[posicion + 1].id;
                aprobadorFlujoSiguienteObj.id_estado_real = null;
                aprobadorFlujoSiguienteObj.nombre_estado_real = null;
                aprobadorFlujoSiguienteObj.id_rol_real = null;
                aprobadorFlujoSiguienteObj.nombre_rol_real = null;
                aprobadorFlujoSiguienteObj.id_usuario_real = null;
                aprobadorFlujoSiguienteObj.nombre_usuario_real = null;
                aprobadorFlujoSiguienteObj.correo_usuario_real = null;
                aprobadorFlujoSiguienteObj.fecha_ingreso = fechaActual;
                aprobadorFlujoSiguienteObj.fecha_salida = null;
                aprobadorFlujoSiguienteObj.estado_completado = false;
                aprobadorFlujoSiguienteObj.motivo = null;
                aprobadorFlujoSiguienteObj.duracion = null;
                winston.info("listaAprobadoresRes[posicion + 1].id: " + listaAprobadoresRes[posicion + 1].id);
                const actualizarFlujoSiguienteRes = await aprobadorSolicitudService.actualizarFlujo(client, aprobadorFlujoSiguienteObj);
                if (!actualizarFlujoSiguienteRes) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "Error al momento de actualizar el flujo del usuario Siguiente.";
                    res.status(200).json(response);
                    return;
                }

                //// Inicio: actualizar esta_aqui de usuario Siguiente
                const actualizarEstaAquiSigRes = await aprobadorSolicitudService.actualizarEstaAquiPorId(client, true, listaAprobadoresRes[posicion + 1].id);
                if (!actualizarEstaAquiSigRes) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "2.- Aprobacion: No se pudo actualizar campo esta_aqui en el flujo de la Solicitud.";
                    res.status(200).json(response);
                    return;
                }
                //// Fin: actualizar esta_aqui de usuario Siguiente
                /// Fin: se actualiza el usuario Siguiente

                // Fin: Para Flujo

                // Inicio: Para Seguimiento:
                /// buscamos los registros de Seguimiento
                const listaSeguimientoRes = await aprobadorSolicitudService.listarSeguimientoPorIdSolicitudOrdenadoPorId(client, id_solicitud);
                winston.info("listaSeguimientoRes: " + JSON.stringify(listaSeguimientoRes));
                /// calculamos la duracion
                const segundosDuracionRes = await utilityService.extractSegundosEnBigintDeRestarTimestampString(client, fechaActual, listaSeguimientoRes[listaSeguimientoRes.length - 1].fecha_ingreso.toISOString().replace('T', ' ').substr(0, 19));
                winston.info("segundosDuracionRes: " + JSON.stringify(segundosDuracionRes))
                const duracion = utility.convertSecondsInDaysHoursString(segundosDuracionRes[0].segundos);
                winston.info("duracion: " + duracion);
                /// actualizamos la fecha_salida y la duracion del ultimo registro de seguimiento
                const seguimientoActualObj = new AprobadorSolicitud();
                seguimientoActualObj.id = listaSeguimientoRes[listaSeguimientoRes.length - 1].id;
                seguimientoActualObj.fecha_salida = fechaActual;
                seguimientoActualObj.duracion = duracion;
                const actualizarSeguimientoActualRes = await aprobadorSolicitudService.actualizarSeguimiento(client, seguimientoActualObj);
                if (!actualizarSeguimientoActualRes) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "No se puede actualizar el Seguimiento Actual.";
                    res.status(200).json(response);
                    return;
                }

                /// Inicio: Agregamos nuevo registro de Seguimiento
                const nuevoSeguimientoObj = new AprobadorSolicitud();
                nuevoSeguimientoObj.solicitud = { id: id_solicitud };
                nuevoSeguimientoObj.id_estado_real = listaAprobadoresRes[posicion + 1].id_estado;
                nuevoSeguimientoObj.nombre_estado_real = listaAprobadoresRes[posicion + 1].nombre_estado;
                nuevoSeguimientoObj.id_rol_real = id_rol;
                nuevoSeguimientoObj.nombre_rol_real = rolRes[0].nombre;
                nuevoSeguimientoObj.id_usuario_real = id_usuario;
                nuevoSeguimientoObj.nombre_usuario_real = usuarioRes[0].nombre;
                nuevoSeguimientoObj.correo_usuario_real = usuarioRes[0].usuario;
                nuevoSeguimientoObj.fecha_ingreso = fechaActual;
                nuevoSeguimientoObj.motivo = motivo;
                const crearSeguimientoRes = await aprobadorSolicitudService.crearSeguimiento(client, nuevoSeguimientoObj);
                if (!(crearSeguimientoRes && crearSeguimientoRes[0].id)) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "No se pudo crear el nuevo registro de Seguimiento.";
                    res.status(200).json(response);
                    return;
                }
                /// Fin: Agregamos nuevo registro de Seguimiento
                // Fin: Para Seguimiento

                id_rol_nuevo = listaAprobadoresRes[posicion + 1].id_rol;
            }

            //id_rol_nuevo = listaAprobadoresRes[i].id_rol;
            //id_usuario_nuevo = listaAprobadoresRes[i].id_usuario_aprobador;


        } else {
            // Rechazar 

            // validamos id_motivo_rechazo
            if (!utility.isNumericValue(id_motivo_rechazo) || id_motivo_rechazo < 1) {
                await client.query("ROLLBACK");
                response.resultado = 0;
                response.mensaje = "El campo id_motivo_rechazo no tiene un valor válido. Tipo de dato: '" + (typeof id_motivo_rechazo) + "', valor = " + id_motivo_rechazo;
                winston.info("response: " + JSON.stringify(response));
                res.status(200).json(response);
                return;
            }

            const buscarMotivoRechazoRes = await motivoRechazoService.buscarPorId(client, id_motivo_rechazo);
            if (!(buscarMotivoRechazoRes && buscarMotivoRechazoRes.length > 0)) {
                await client.query("ROLLBACK");
                response.resultado = 0;
                response.mensaje = "El campo id_motivo_rechazo no tiene un valor válido. Tipo de dato: '" + (typeof id_motivo_rechazo) + "', valor = " + id_motivo_rechazo;
                winston.info("response: " + JSON.stringify(response));
                res.status(200).json(response);
                return;
            }
            nombre_motivo_rechazo = buscarMotivoRechazoRes[0].nombre;

            if (posicion < 1) {
                await client.query("ROLLBACK");
                response.resultado = 0;
                response.mensaje = "No se puede rechazar y enviar a un usuario anterior, esta en el primer usuario del flujo.";
                res.status(200).json(response);
                return;
            } else {
                // Rachazar con un usuario que no es el primero del flujo
                // 1. Inicio: para Flujo
                /// 1.1 Inicio: se actualiza el usuario Anterior
                const aprobadorFlujoAnteriorObj = new AprobadorSolicitud();
                aprobadorFlujoAnteriorObj.id = listaAprobadoresRes[posicion - 1].id;
                aprobadorFlujoAnteriorObj.id_estado_real = listaAprobadoresRes[posicion - 1].id_estado_real;
                aprobadorFlujoAnteriorObj.nombre_estado_real = listaAprobadoresRes[posicion - 1].nombre_estado_real;
                aprobadorFlujoAnteriorObj.id_rol_real = listaAprobadoresRes[posicion - 1].id_rol_real;
                aprobadorFlujoAnteriorObj.nombre_rol_real = listaAprobadoresRes[posicion - 1].nombre_rol_real;
                aprobadorFlujoAnteriorObj.id_usuario_real = listaAprobadoresRes[posicion - 1].id_usuario_real;
                aprobadorFlujoAnteriorObj.nombre_usuario_real = listaAprobadoresRes[posicion - 1].nombre_usuario_real;
                aprobadorFlujoAnteriorObj.correo_usuario_real = listaAprobadoresRes[posicion - 1].correo_usuario_real;
                aprobadorFlujoAnteriorObj.fecha_ingreso = listaAprobadoresRes[posicion - 1].fecha_ingreso.toISOString().replace('T', ' ').substr(0, 19);
                aprobadorFlujoAnteriorObj.fecha_salida = null;
                aprobadorFlujoAnteriorObj.estado_completado = false;
                aprobadorFlujoAnteriorObj.motivo = null;
                aprobadorFlujoAnteriorObj.duracion = null;
                const actualizarFlujoAnteriorRes = await aprobadorSolicitudService.actualizarFlujo(client, aprobadorFlujoAnteriorObj);
                if (!actualizarFlujoAnteriorRes) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "Error al momento de actualizar el flujo del usuario Anterior.";
                    res.status(200).json(response);
                    return;
                }

                //// Inicio: actualizar esta_aqui de usuario Anterior
                const actualizarEstaAquiAnteriorRes = await aprobadorSolicitudService.actualizarEstaAquiPorId(client, true, listaAprobadoresRes[posicion - 1].id);
                if (!actualizarEstaAquiAnteriorRes) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "1.- No se pudo actualizar campo esta_aqui del usuario anterior en el flujo de la Solicitud.";
                    res.status(200).json(response);
                    return;
                }
                //// Fin: actualizar esta_aqui de usuario Anterior
                /// 1.1 Fin: se actualiza el usuario Anterior

                /// 1.2 Inicio: se actualiza el usuario Actual
                const aprobadorFlujoActualObj = new AprobadorSolicitud();
                aprobadorFlujoActualObj.id = listaAprobadoresRes[posicion].id;
                aprobadorFlujoActualObj.id_estado_real = null;
                aprobadorFlujoActualObj.nombre_estado_real = null;

                aprobadorFlujoActualObj.id_rol_real = null;
                aprobadorFlujoActualObj.nombre_rol_real = null;
                aprobadorFlujoActualObj.id_usuario_real = null;
                aprobadorFlujoActualObj.nombre_usuario_real = null;
                aprobadorFlujoActualObj.correo_usuario_real = null;
                aprobadorFlujoActualObj.fecha_ingreso = null;
                aprobadorFlujoActualObj.fecha_salida = null;
                aprobadorFlujoActualObj.estado_completado = false;
                aprobadorFlujoActualObj.motivo = null;
                aprobadorFlujoActualObj.duracion = null;
                const actualizarFlujoActualRes = await aprobadorSolicitudService.actualizarFlujo(client, aprobadorFlujoActualObj);
                if (!actualizarFlujoActualRes) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "Error al momento de actualizar el flujo del usuario actual.";
                    res.status(200).json(response);
                    return;
                }

                //// Inicio: actualizar esta_aqui de usuario Actual
                const actualizarEstaAquiActualRes = await aprobadorSolicitudService.actualizarEstaAquiPorId(client, false, listaAprobadoresRes[posicion].id);
                if (!actualizarEstaAquiActualRes) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "2.-  No se pudo actualizar campo esta_aqui del usuario actual en el flujo de la Solicitud.";
                    res.status(200).json(response);
                    return;
                }
                //// Fin: actualizar esta_aqui de usuario Actual
                /// 1.2 Fin: se actualiza el usuario Actual
                // 1. Fin: Para Flujo

                // 2. Inicio: Para Seguimiento:
                /// buscamos los registros de Seguimiento
                const listaSeguimientoRes = await aprobadorSolicitudService.listarSeguimientoPorIdSolicitudOrdenadoPorId(client, id_solicitud);
                winston.info("listaSeguimientoRes: " + JSON.stringify(listaSeguimientoRes));
                /// calculamos la duracion
                const segundosDuracionRes = await utilityService.extractSegundosEnBigintDeRestarTimestampString(client, fechaActual, listaSeguimientoRes[listaSeguimientoRes.length - 1].fecha_ingreso.toISOString().replace('T', ' ').substr(0, 19));
                winston.info("segundosDuracionRes: " + JSON.stringify(segundosDuracionRes))
                const duracion = utility.convertSecondsInDaysHoursString(segundosDuracionRes[0].segundos);
                winston.info("duracion: " + duracion);
                /// actualizamos la fecha_salida y la duracion del ultimo registro de seguimiento
                const seguimientoActualObj = new AprobadorSolicitud();
                seguimientoActualObj.id = listaSeguimientoRes[listaSeguimientoRes.length - 1].id;
                seguimientoActualObj.fecha_salida = fechaActual;
                seguimientoActualObj.duracion = duracion;
                const actualizarSeguimientoActualRes = await aprobadorSolicitudService.actualizarSeguimiento(client, seguimientoActualObj);
                if (!actualizarSeguimientoActualRes) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "No se puede actualizar el Seguimiento Actual.";
                    res.status(200).json(response);
                    return;
                }

                /// Inicio: Agregamos nuevo registro de Seguimiento
                const nuevoSeguimientoObj = new AprobadorSolicitud();
                nuevoSeguimientoObj.solicitud = { id: id_solicitud };
                nuevoSeguimientoObj.id_estado_real = listaAprobadoresRes[posicion - 1].id_estado;
                nuevoSeguimientoObj.nombre_estado_real = listaAprobadoresRes[posicion - 1].nombre_estado;
                nuevoSeguimientoObj.id_rol_real = id_rol;
                nuevoSeguimientoObj.nombre_rol_real = rolRes[0].nombre;
                nuevoSeguimientoObj.id_usuario_real = id_usuario;
                nuevoSeguimientoObj.nombre_usuario_real = usuarioRes[0].nombre;
                nuevoSeguimientoObj.correo_usuario_real = usuarioRes[0].usuario;
                nuevoSeguimientoObj.fecha_ingreso = fechaActual;
                nuevoSeguimientoObj.motivo = motivo;
                nuevoSeguimientoObj.id_motivo_rechazo = id_motivo_rechazo;
                nuevoSeguimientoObj.nombre_motivo_rechazo = nombre_motivo_rechazo;
                const crearSeguimientoRes = await aprobadorSolicitudService.crearSeguimiento(client, nuevoSeguimientoObj);
                if (!(crearSeguimientoRes && crearSeguimientoRes[0].id)) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "No se pudo crear el nuevo registro de Seguimiento.";
                    res.status(200).json(response);
                    return;
                }
                /// Fin: Agregamos nuevo registro de Seguimiento
                // 2. Fin: Para Seguimiento

                id_rol_nuevo = listaAprobadoresRes[posicion - 1].id_rol
            }
            //////////////////////////////////////////////////

        }

        // buscar nuevo estado de la Solicitud
        const nuevoEstadoSolicitudRes = await estadoSolicitudService.buscarPorIdRol(client, id_rol_nuevo);
        winston.info("nuevoEstadoSolicitudRes: " + JSON.stringify(nuevoEstadoSolicitudRes));

        // cambiamos de estado a la Solicitud
        const solicitud = new Solicitud();
        solicitud.id = id_solicitud;
        solicitud.estadoSolicitud = { id: nuevoEstadoSolicitudRes[0].id };
        solicitud.modificado_por = id_usuario;
        const actualizarEstadoSolicitudRes = await solicitudService.actualizarEstado(client, solicitud);
        winston.info("actualizarEstadoSolicitudRes: " + actualizarEstadoSolicitudRes);
        if (!actualizarEstadoSolicitudRes) {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "No se pudo actualizar el Estado de la Solicitud.";
            res.status(200).json(response);
            return;
        }

        // si todo salio bien entonces hacemos commit
        await client.query('COMMIT');
        response.resultado = 1;
        response.mensaje = "";
        res.status(200).json(response);

        // Ponemos esta logica de envio de correo despues del 'COMMIT' para no bloquear la base de datos por mucho tiempo, ya que este proceso puede demorar
        // Inicio: Logica para envio correo
        let respuestaCorreo = null;
        if (aprobado) {
            console.log('Notificar aprobación');
            respuestaCorreo = await notificacionController.internal.notificarAprobacion(id_solicitud, id_rol);
        } else {
            respuestaCorreo = await notificacionController.internal.notificarRechazo(id_solicitud, id_rol, nombre_motivo_rechazo, motivo);
        }

        winston.info("respuestaCorreo:", respuestaCorreo);
        // Fin: Logica para envio correo
    } catch (error) {
        await client.query("ROLLBACK");
        winston.error("Error en solicitudController.aprobacionRechazoSolicitud,", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
}

solicitudController.rechazoSolicitudADemanda = async (req, res) => {
    const client = await postgresConn.getClient();
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al anular de Solicitud."
        };
        winston.info("req.body: " + JSON.stringify(req.body));
        let { id_usuario, id_solicitud, id_rol, aprobado, motivo, id_motivo_rechazo, aprobador_derivado } = req.body;
        // Inicio Validando parametros
        if (!utility.isNumericValue(id_usuario) || id_usuario < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no tiene un valor válido. Tipo de dato: '" + (typeof id_usuario) + "', valor = " + id_usuario;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if (!utility.isNumericValue(id_solicitud) || id_solicitud < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no tiene un valor válido. Tipo de dato: '" + (typeof id_solicitud) + "', valor = " + id_solicitud;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if (!utility.isNumericValue(id_rol) || id_rol < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_rol no tiene un valor válido. Tipo de dato: '" + (typeof id_rol) + "', valor = " + id_rol;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if ((typeof aprobado) !== 'boolean') {
            response.resultado = 0;
            response.mensaje = "El campo aprobado no tiene un valor válido. Tipo de dato: '" + (typeof aprobado) + "', valor = " + aprobado;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        // Fin Validando parametros

        await client.query("BEGIN");
        // listar Aprobadores de Solicitud (Flujo) ordenado por orden
        const listaAprobadoresRes = await aprobadorSolicitudService.listarFlujoPorIdSolicitudOrdenadoPorOrden(client, id_solicitud);
        winston.info("listaAprobadoresRes: " + JSON.stringify(listaAprobadoresRes));
        if (listaAprobadoresRes.length < 1) {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "No se encontró aprobadores con id_solicitud = " + id_solicitud;
            res.status(200).json(response);
            return;
        }
        // buscamos la posicion donde se encuentra la Solicitud en el Flujo
        let posicion = null;
        for (let i = 0; i < listaAprobadoresRes.length; i++) {
            if (listaAprobadoresRes[i].esta_aqui === true) {
                posicion = i;
                break;
            }
        }

        let id_rol_nuevo = null; // el nuevo rol en el que se encontrara la Solicitud
        let id_usuario_nuevo = null; // el nuevo usuario en el que se encontrara la Solicitud

        // buscamos datos del Usuario
        const usuarioRes = await usuarioService.buscarPorId(client, id_usuario);
        winston.info("usuarioRes[0]:", usuarioRes[0]);
        // buscamos datos del Rol
        const rolRes = await rolService.buscarPorId(client, id_rol);
        winston.info("rolRes[0]:", rolRes[0]);

        // Inicio: obteniendo Fecha Actual
        const fechaActualRes = await aprobadorSolicitudService.obtenerFechaActual(client);
        winston.info("fechaActualRes: ", fechaActualRes);
        const fechaActual = fechaActualRes[0].fecha.toISOString().replace('T', ' ').substr(0, 19);
        winston.info("fechaActual: " + fechaActual);
        // Fin: obteniendo Fecha Actual

        /// buscamos los registros de Seguimiento
        const listaSeguimientoRes = await aprobadorSolicitudService.listarSeguimientoPorIdSolicitudOrdenadoPorId(client, id_solicitud);
        winston.info("listaSeguimientoRes: " + JSON.stringify(listaSeguimientoRes));

        if (listaSeguimientoRes[listaSeguimientoRes.length - 1].id_estado_real == config.constantesDb.id_estado_solicitud_en_sap) {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "No se puede aprobar o rechazar una Solicitud que esta en SAP.";
            res.status(200).json(response);
            return;
        }

        let nombre_motivo_rechazo = '';
        // Verificamos si se esta Aprobando o Rechazando
        if (aprobado === false) {// Rechazar 
            // validamos id_motivo_rechazo
            if (!utility.isNumericValue(id_motivo_rechazo) || id_motivo_rechazo < 1) {
                await client.query("ROLLBACK");
                response.resultado = 0;
                response.mensaje = "El campo id_motivo_rechazo no tiene un valor válido. Tipo de dato: '" + (typeof id_motivo_rechazo) + "', valor = " + id_motivo_rechazo;
                winston.info("response: " + JSON.stringify(response));
                res.status(200).json(response);
                return;
            }

            const buscarMotivoRechazoRes = await motivoRechazoService.buscarPorId(client, id_motivo_rechazo);
            if (!(buscarMotivoRechazoRes && buscarMotivoRechazoRes.length > 0)) {
                await client.query("ROLLBACK");
                response.resultado = 0;
                response.mensaje = "El campo id_motivo_rechazo no tiene un valor válido. Tipo de dato: '" + (typeof id_motivo_rechazo) + "', valor = " + id_motivo_rechazo;
                winston.info("response: " + JSON.stringify(response));
                res.status(200).json(response);
                return;
            }
            nombre_motivo_rechazo = buscarMotivoRechazoRes[0].nombre;

            if (posicion < 1) {
                await client.query("ROLLBACK");
                response.resultado = 0;
                response.mensaje = "No se puede rechazar y enviar a un usuario anterior, esta en el primer usuario del flujo.";
                res.status(200).json(response);
                return;
            } else {
                // Rechazar con un usuario que no es el primero del flujo
                // 1. Inicio: para Flujo
                /// 1.1 Inicio: se actualiza el usuario Anterior
                const aprobadorFlujoAnteriorObj = new AprobadorSolicitud();
                aprobadorFlujoAnteriorObj.id = aprobador_derivado.id;
                aprobadorFlujoAnteriorObj.id_estado_real = aprobador_derivado.id_estado_real;
                aprobadorFlujoAnteriorObj.nombre_estado_real = aprobador_derivado.nombre_estado_real;
                aprobadorFlujoAnteriorObj.id_rol_real = aprobador_derivado.id_rol_real;
                aprobadorFlujoAnteriorObj.nombre_rol_real = aprobador_derivado.nombre_rol_real;
                aprobadorFlujoAnteriorObj.id_usuario_real = aprobador_derivado.id_usuario_real;
                aprobadorFlujoAnteriorObj.nombre_usuario_real = aprobador_derivado.nombre_usuario_real;
                aprobadorFlujoAnteriorObj.correo_usuario_real = aprobador_derivado.correo_usuario_real;
                aprobadorFlujoAnteriorObj.fecha_ingreso = fechaActual;//aprobador_derivado.fecha_ingreso.toISOString().replace('T', ' ').substr(0, 19);
                aprobadorFlujoAnteriorObj.fecha_salida = null;
                aprobadorFlujoAnteriorObj.estado_completado = false;
                aprobadorFlujoAnteriorObj.motivo = null;
                aprobadorFlujoAnteriorObj.duracion = null;
                const actualizarFlujoAnteriorRes = await aprobadorSolicitudService.actualizarFlujo(client, aprobadorFlujoAnteriorObj);
                if (!actualizarFlujoAnteriorRes) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "Error al momento de actualizar el flujo del usuario Anterior.";
                    res.status(200).json(response);
                    return;
                }

                //// Inicio: actualizar esta_aqui de usuario Anterior
                const actualizarEstaAquiAnteriorRes = await aprobadorSolicitudService.actualizarEstaAquiPorId(client, true, aprobador_derivado.id);
                if (!actualizarEstaAquiAnteriorRes) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "1.- No se pudo actualizar campo esta_aqui del usuario anterior en el flujo de la Solicitud.";
                    res.status(200).json(response);
                    return;
                }
                //// Fin: actualizar esta_aqui de usuario Anterior
                /// 1.1 Fin: se actualiza el usuario Anterior

                /// 1.2 Inicio: se actualiza el usuario Actual
                const aprobadorFlujoActualObj = new AprobadorSolicitud();
                aprobadorFlujoActualObj.id = listaAprobadoresRes[posicion].id;
                aprobadorFlujoActualObj.id_estado_real = null;
                aprobadorFlujoActualObj.nombre_estado_real = null;

                aprobadorFlujoActualObj.id_rol_real = null;
                aprobadorFlujoActualObj.nombre_rol_real = null;
                aprobadorFlujoActualObj.id_usuario_real = null;
                aprobadorFlujoActualObj.nombre_usuario_real = null;
                aprobadorFlujoActualObj.correo_usuario_real = null;
                aprobadorFlujoActualObj.fecha_ingreso = null;
                aprobadorFlujoActualObj.fecha_salida = null;
                aprobadorFlujoActualObj.estado_completado = false;
                aprobadorFlujoActualObj.motivo = null;
                aprobadorFlujoActualObj.duracion = null;
                const actualizarFlujoActualRes = await aprobadorSolicitudService.actualizarFlujo(client, aprobadorFlujoActualObj);
                if (!actualizarFlujoActualRes) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "Error al momento de actualizar el flujo del usuario actual.";
                    res.status(200).json(response);
                    return;
                }

                //// Inicio: actualizar esta_aqui de usuario Actual
                const actualizarEstaAquiActualRes = await aprobadorSolicitudService.actualizarEstaAquiPorId(client, false, listaAprobadoresRes[posicion].id);
                if (!actualizarEstaAquiActualRes) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "2.-  No se pudo actualizar campo esta_aqui del usuario actual en el flujo de la Solicitud.";
                    res.status(200).json(response);
                    return;
                }
                //// Fin: actualizar esta_aqui de usuario Actual
                /// 1.2 Fin: se actualiza el usuario Actual

                /// 1.3 Inicia: Se blanquean las fechas de aprobadores superiores
                const blanquearAprobacionesSuperioresRes = await aprobadorSolicitudService.blanquearAprobacionesSuperiores(client, id_solicitud, aprobador_derivado.id);
                /// 1.3 Fin: Se blanquean las fechas de aprobadores superiores
                // 1. Fin: Para Flujo

                // 2. Inicio: Para Seguimiento:
                /// buscamos los registros de Seguimiento
                const listaSeguimientoRes = await aprobadorSolicitudService.listarSeguimientoPorIdSolicitudOrdenadoPorId(client, id_solicitud);
                winston.info("listaSeguimientoRes: " + JSON.stringify(listaSeguimientoRes));
                /// calculamos la duracion
                const segundosDuracionRes = await utilityService.extractSegundosEnBigintDeRestarTimestampString(client, fechaActual, listaSeguimientoRes[listaSeguimientoRes.length - 1].fecha_ingreso.toISOString().replace('T', ' ').substr(0, 19));
                winston.info("segundosDuracionRes: " + JSON.stringify(segundosDuracionRes))
                const duracion = utility.convertSecondsInDaysHoursString(segundosDuracionRes[0].segundos);
                winston.info("duracion: " + duracion);
                /// actualizamos la fecha_salida y la duracion del ultimo registro de seguimiento
                const seguimientoActualObj = new AprobadorSolicitud();
                seguimientoActualObj.id = listaSeguimientoRes[listaSeguimientoRes.length - 1].id;
                seguimientoActualObj.fecha_salida = fechaActual;
                seguimientoActualObj.duracion = duracion;
                const actualizarSeguimientoActualRes = await aprobadorSolicitudService.actualizarSeguimiento(client, seguimientoActualObj);
                if (!actualizarSeguimientoActualRes) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "No se puede actualizar el Seguimiento Actual.";
                    res.status(200).json(response);
                    return;
                }

                /// Inicio: Agregamos nuevo registro de Seguimiento
                const nuevoSeguimientoObj = new AprobadorSolicitud();
                nuevoSeguimientoObj.solicitud = { id: id_solicitud };
                nuevoSeguimientoObj.id_estado_real = aprobador_derivado.id_estado;
                nuevoSeguimientoObj.nombre_estado_real = aprobador_derivado.nombre_estado;
                nuevoSeguimientoObj.id_rol_real = id_rol;
                nuevoSeguimientoObj.nombre_rol_real = rolRes[0].nombre;
                nuevoSeguimientoObj.id_usuario_real = id_usuario;
                nuevoSeguimientoObj.nombre_usuario_real = usuarioRes[0].nombre;
                nuevoSeguimientoObj.correo_usuario_real = usuarioRes[0].usuario;
                nuevoSeguimientoObj.fecha_ingreso = fechaActual;
                nuevoSeguimientoObj.motivo = motivo;
                nuevoSeguimientoObj.id_motivo_rechazo = id_motivo_rechazo;
                nuevoSeguimientoObj.nombre_motivo_rechazo = nombre_motivo_rechazo;
                const crearSeguimientoRes = await aprobadorSolicitudService.crearSeguimiento(client, nuevoSeguimientoObj);
                if (!(crearSeguimientoRes && crearSeguimientoRes[0].id)) {
                    await client.query("ROLLBACK");
                    response.resultado = 0;
                    response.mensaje = "No se pudo crear el nuevo registro de Seguimiento.";
                    res.status(200).json(response);
                    return;
                }
                /// Fin: Agregamos nuevo registro de Seguimiento
                // 2. Fin: Para Seguimiento

                id_rol_nuevo = aprobador_derivado.id_rol
            }
            //////////////////////////////////////////////////

        }

        // buscar nuevo estado de la Solicitud
        const nuevoEstadoSolicitudRes = await estadoSolicitudService.buscarPorIdRol(client, id_rol_nuevo);
        winston.info("nuevoEstadoSolicitudRes: " + JSON.stringify(nuevoEstadoSolicitudRes));

        // cambiamos de estado a la Solicitud
        const solicitud = new Solicitud();
        solicitud.id = id_solicitud;
        solicitud.estadoSolicitud = { id: nuevoEstadoSolicitudRes[0].id };
        solicitud.modificado_por = id_usuario;
        const actualizarEstadoSolicitudRes = await solicitudService.actualizarEstado(client, solicitud);
        winston.info("actualizarEstadoSolicitudRes: " + actualizarEstadoSolicitudRes);
        if (!actualizarEstadoSolicitudRes) {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "No se pudo actualizar el Estado de la Solicitud.";
            res.status(200).json(response);
            return;
        }

        // si todo salio bien entonces hacemos commit
        await client.query('COMMIT');
        response.resultado = 1;
        response.mensaje = "";
        res.status(200).json(response);

        // Ponemos esta logica de envio de correo despues del 'COMMIT' para no bloquear la base de datos por mucho tiempo, ya que este proceso puede demorar
        // Inicio: Logica para envio correo
        let respuestaCorreo = null;
        if (aprobado) {
            respuestaCorreo = await notificacionController.internal.notificarAprobacion(id_solicitud, id_rol);
        } else {
            respuestaCorreo = await notificacionController.internal.notificarRechazo(id_solicitud, id_rol, nombre_motivo_rechazo, motivo);
        }

        winston.info("respuestaCorreo:", respuestaCorreo);
        // Fin: Logica para envio correo
    } catch (error) {
        await client.query("ROLLBACK");
        winston.error("Error en solicitudController.aprobacionRechazoSolicitud,", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
}

solicitudController.listarSeguimiento = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al buscar Seguimientos de Solicitud."
        };
        winston.info("req.query: " + JSON.stringify(req.query));
        let { id_solicitud } = req.query;
        // Inicio Validando parametros
        if (!utility.isNumericValue(id_solicitud) || parseInt(id_solicitud) < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no tiene un valor válido. Tipo de dato: '" + (typeof id_solicitud) + "', valor = " + id_solicitud;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }

        const buscarRes = await aprobadorSolicitudService.listarSeguimientoPorIdSolicitudOrdenadoPorId(postgresConn, id_solicitud);
        if (buscarRes) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = buscarRes;
        } else {
            response.resultado = 0;
            response.mensaje = "Error al buscar Seguimientos de Solicitud en la Base de Datos.";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en solicitudController.listarSeguimiento,", error);
        res.status(500).send(error);
    }
}

solicitudController.listarFlujo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al buscar Flujo de Solicitud."
        };
        winston.info("req.query: " + JSON.stringify(req.query));
        let { id_solicitud } = req.query;
        // Inicio Validando parametros
        if (!utility.isNumericValue(id_solicitud) || parseInt(id_solicitud) < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no tiene un valor válido. Tipo de dato: '" + (typeof id_solicitud) + "', valor = " + id_solicitud;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }

        const buscarRes = await aprobadorSolicitudService.listarFlujoPorIdSolicitudOrdenadoPorOrden(postgresConn, id_solicitud);
        if (buscarRes) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = buscarRes;
        } else {
            response.resultado = 0;
            response.mensaje = "Error al buscar Flujo de Solicitud en la Base de Datos.";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en solicitudController.listarFlujo,", error);
        res.status(500).send(error);
    }
}

solicitudController.cantidadSolicitudesPorUsuario = async (req, res) => {
    const client = await postgresConn.getClient();
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al contar Solicitudes por Usuario."
        };
        winston.info("req.query: " + JSON.stringify(req.query));
        let { id_usuario } = req.query;
        // Inicio Validando parametros
        if (!utility.isNumericValue(id_usuario) || parseInt(id_usuario) < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no tiene un valor válido. Tipo de dato: '" + (typeof id_usuario) + "', valor = " + id_usuario;
            //winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }

        await client.query("BEGIN");
        const listaIdEscenarioNivel3YIdTipoSolicitudRes = await usuarioService.listarIdEscenarioYIdTipoSolicitudPorIdUsuario(client, id_usuario);
        winston.info("listaIdEscenarioNivel3YIdTipoSolicitudRes: " + JSON.stringify(listaIdEscenarioNivel3YIdTipoSolicitudRes));
        let respuesta = null;
        if (listaIdEscenarioNivel3YIdTipoSolicitudRes.length < 1) {
            respuesta = 0;
        } else {
            const cantidadRes = await solicitudService.cantidadTotalPorListaEstrategiaYIdUsuario(client, listaIdEscenarioNivel3YIdTipoSolicitudRes, id_usuario);
            if (utility.isNumericValue(cantidadRes[0].cantidad)) {
                respuesta = cantidadRes[0].cantidad;
            } else {
                respuesta = 0;
            }
        }

        if (respuesta > -1) {
            await client.query('COMMIT');
            response.resultado = 1;
            response.mensaje = "";
            response.cantidad = respuesta;
        } else {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "Error no controlado al contar Solicitudes por Usuario.";
        }
        res.status(200).json(response);
    } catch (error) {
        await client.query("ROLLBACK");
        winston.error("Error en solicitudController.cantidadSolicitudesPorUsuario,", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
}

solicitudController.cantidadDeAprobacionesPorUsuario = async (req, res) => {
    const client = await postgresConn.getClient();
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al contar Aprobaciones por Usuario."
        };
        winston.info("req.query: " + JSON.stringify(req.query));
        let { id_usuario } = req.query;
        // Inicio Validando parametros
        if (!utility.isNumericValue(id_usuario) || parseInt(id_usuario) < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no tiene un valor válido. Tipo de dato: '" + (typeof id_usuario) + "', valor = " + id_usuario;
            //winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }

        await client.query("BEGIN");
        const listaIdEscenarioNivel3YIdTipoSolicitudRes = await usuarioService.listarIdEscenarioYIdTipoSolicitudPorIdUsuario(client, id_usuario);
        winston.info("listaIdEscenarioNivel3YIdTipoSolicitudRes: " + JSON.stringify(listaIdEscenarioNivel3YIdTipoSolicitudRes));
        let respuesta = null;
        if (listaIdEscenarioNivel3YIdTipoSolicitudRes.length < 1) {
            respuesta = 0;
        } else {
            const cantidadRes = await solicitudService.cantidadAprobacionesPorListaEstrategiaYIdUsuario(client, listaIdEscenarioNivel3YIdTipoSolicitudRes, id_usuario);
            if (utility.isNumericValue(cantidadRes[0].cantidad)) {
                respuesta = cantidadRes[0].cantidad;
            } else {
                respuesta = 0;
            }
        }

        if (respuesta > -1) {
            await client.query('COMMIT');
            response.resultado = 1;
            response.mensaje = "";
            response.cantidad = respuesta;
        } else {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "Error no controlado al contar Aprobaciones por Usuario.";
        }
        res.status(200).json(response);
    } catch (error) {
        await client.query("ROLLBACK");
        winston.error("Error en solicitudController.cantidadDeAprobacionesPorUsuario,", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
}

solicitudController.cantidadDePendientesPorUsuario = async (req, res) => {
    const client = await postgresConn.getClient();
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al contar Pendientes por Usuario."
        };
        winston.info("req.query: " + JSON.stringify(req.query));
        let { id_usuario } = req.query;
        // Inicio Validando parametros
        if (!utility.isNumericValue(id_usuario) || parseInt(id_usuario) < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no tiene un valor válido. Tipo de dato: '" + (typeof id_usuario) + "', valor = " + id_usuario;
            //winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }

        await client.query("BEGIN");
        const listaIdEscenarioNivel3YIdTipoSolicitudRes = await usuarioService.listarIdEscenarioYIdTipoSolicitudPorIdUsuario(client, id_usuario);
        winston.info("listaIdEscenarioNivel3YIdTipoSolicitudRes: " + JSON.stringify(listaIdEscenarioNivel3YIdTipoSolicitudRes));
        let respuesta = null;
        if (listaIdEscenarioNivel3YIdTipoSolicitudRes.length < 1) {
            winston.info("entro if");
            respuesta = 0;
        } else {
            const cantidadRes = await solicitudService.cantidadPendientesPorListaEstrategiaYIdUsuario(client, listaIdEscenarioNivel3YIdTipoSolicitudRes, id_usuario);
            winston.info("entro else, cantidadRes: " + JSON.stringify(cantidadRes));
            if (utility.isNumericValue(cantidadRes[0].cantidad)) {
                winston.info("entro if, utility.isNumericValue(cantidadRes[0].cantidad): " + utility.isNumericValue(cantidadRes[0].cantidad));
                respuesta = cantidadRes[0].cantidad;
            } else {
                respuesta = 0;
            }
        }

        if (respuesta > -1) {
            await client.query('COMMIT');
            response.resultado = 1;
            response.mensaje = "";
            response.cantidad = respuesta;
        } else {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "Error no controlado al contar Aprobaciones por Usuario.";
        }
        res.status(200).json(response);
    } catch (error) {
        await client.query("ROLLBACK");
        winston.error("Error en solicitudController.cantidadDePendientesPorUsuario,", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
}

solicitudController.finalizarSolicitud = async (req, res) => {
    const response = {
        resultado: 0,
        mensaje: "Error inesperado al Finalizar Solicitud."
    };
    const client = await postgresConn.getClient();
    try {
        let { id_usuario, id_solicitud, id_rol } = req.body;
        if (!utility.isNumericValue(id_usuario) || parseInt(id_usuario) < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no tiene un valor válido. Tipo de dato: '" + (typeof id_usuario) + "', valor = " + id_usuario;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if (!utility.isNumericValue(id_solicitud) || parseInt(id_solicitud) < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no tiene un valor válido. Tipo de dato: '" + (typeof id_solicitud) + "', valor = " + id_solicitud;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if (!utility.isNumericValue(id_rol) || parseInt(id_rol) < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_rol no tiene un valor válido. Tipo de dato: '" + (typeof id_rol) + "', valor = " + id_rol;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }

        await client.query("BEGIN");
        const listaMaterialesRes = await materialSolicitudService.listaParaFinalizarSolicitud(client, id_solicitud);
        if (listaMaterialesRes.length > 0) {
            let estaVacio = false;
            for (let i = 0; i < listaMaterialesRes.length; i++) {
                if (listaMaterialesRes[i].material_codigo_sap === "" || !(listaMaterialesRes[i].material_codigo_sap)) {
                    estaVacio = true;
                    if (estaVacio) {
                        await client.query("ROLLBACK");
                        response.resultado = 0;
                        response.mensaje = "No se puede Finalizar la Solicitud con id = " + id_solicitud + " debido a que el material_solicitud con id = " + listaMaterialesRes[i].id + " no tiene codigo_sap asignado.";
                        res.status(200).json(response);
                        return;
                    }
                    break;
                }
            }


            // si todo esta bien, continuar
            // listar Aprobadores de Solicitud (Flujo) ordenado por orden
            const listaAprobadoresRes = await aprobadorSolicitudService.listarFlujoPorIdSolicitudOrdenadoPorOrden(client, id_solicitud);
            winston.info("listaAprobadoresRes: " + JSON.stringify(listaAprobadoresRes));
            if (listaAprobadoresRes.length < 1) {
                await client.query("ROLLBACK");
                response.resultado = 0;
                response.mensaje = "No se encontró aprobadores con id_solicitud = " + id_solicitud;
                res.status(200).json(response);
                return;
            }
            // buscamos la posicion donde se encuentra la Solicitud en el Flujo
            let posicion = null;
            for (let i = 0; i < listaAprobadoresRes.length; i++) {
                if (listaAprobadoresRes[i].esta_aqui === true) {
                    posicion = i;
                    break;
                }
            }
            winston.info("posicion: " + posicion);
            if (posicion !== (listaAprobadoresRes.length - 1)) {
                await client.query("ROLLBACK");
                response.resultado = 0;
                response.mensaje = "Error, No se pudo Finalizar la Solicitud. Solo se puede Finalizar Solicitudes que esten en el ultimo usaurio del Flujo.";
                res.status(200).json(response);
                return;
            }

            // buscamos datos del Usuario
            const usuarioRes = await usuarioService.buscarPorId(client, id_usuario);
            winston.info("usuarioRes[0]:", usuarioRes[0]);
            // buscamos datos del Rol
            const rolRes = await rolService.buscarPorId(client, id_rol);
            winston.info("rolRes[0]:", rolRes[0]);

            // Inicio: obteniendo Fecha Actual
            const fechaActualRes = await aprobadorSolicitudService.obtenerFechaActual(client);
            winston.info("fechaActualRes: ", fechaActualRes);
            const fechaActual = fechaActualRes[0].fecha.toISOString().replace('T', ' ').substr(0, 19);
            winston.info("fechaActual: " + fechaActual);
            // Fin: obteniendo Fecha Actual

            // => Inicio: para Seguimiento
            /// buscamos los registros de Seguimiento
            const listaSeguimientoRes = await aprobadorSolicitudService.listarSeguimientoPorIdSolicitudOrdenadoPorId(client, id_solicitud);
            winston.info("listaSeguimientoRes: " + JSON.stringify(listaSeguimientoRes));
            if (listaSeguimientoRes[listaSeguimientoRes.length - 1].id_estado_real == config.constantesDb.id_estado_solicitud_en_sap) {
                await client.query("ROLLBACK");
                response.resultado = 0;
                response.mensaje = "No se puede Finalizar una Solicitud que esta en SAP.";
                res.status(200).json(response);
                return;
            }

            /// calculamos la duracion
            const segundosDuracionRes = await utilityService.extractSegundosEnBigintDeRestarTimestampString(client, fechaActual, listaSeguimientoRes[listaSeguimientoRes.length - 1].fecha_ingreso.toISOString().replace('T', ' ').substr(0, 19));
            winston.info("segundosDuracionRes: " + JSON.stringify(segundosDuracionRes))
            const duracion = utility.convertSecondsInDaysHoursString(segundosDuracionRes[0].segundos);
            winston.info("duracion: " + duracion);
            /// actualizamos la fecha_salida y la duracion del ultimo registro de seguimiento
            const seguimientoActualObj = new AprobadorSolicitud();
            seguimientoActualObj.id = listaSeguimientoRes[listaSeguimientoRes.length - 1].id;
            seguimientoActualObj.fecha_salida = fechaActual;
            seguimientoActualObj.duracion = duracion;
            const actualizarSeguimientoActualRes = await aprobadorSolicitudService.actualizarSeguimiento(client, seguimientoActualObj);
            if (!actualizarSeguimientoActualRes) {
                await client.query("ROLLBACK");
                response.resultado = 0;
                response.mensaje = "No se puede actualizar el Seguimiento Actual.";
                res.status(200).json(response);
                return;
            }

            /// Inicio: Agregamos nuevo registro de Seguimiento
            const nuevoSeguimientoObj = new AprobadorSolicitud();
            nuevoSeguimientoObj.solicitud = { id: id_solicitud };
            nuevoSeguimientoObj.id_estado_real = config.constantesDb.id_estado_solicitud_finalizado;
            const estadoSolicitudRes = await estadoSolicitudService.buscarPorId(client, config.constantesDb.id_estado_solicitud_finalizado);
            winston.info("estadoSolicitudRes: " + JSON.stringify(estadoSolicitudRes));
            nuevoSeguimientoObj.nombre_estado_real = estadoSolicitudRes[0].nombre;
            nuevoSeguimientoObj.id_rol_real = id_rol;
            nuevoSeguimientoObj.nombre_rol_real = rolRes[0].nombre;
            nuevoSeguimientoObj.id_usuario_real = id_usuario;
            nuevoSeguimientoObj.nombre_usuario_real = usuarioRes[0].nombre;
            nuevoSeguimientoObj.correo_usuario_real = usuarioRes[0].usuario;
            nuevoSeguimientoObj.fecha_ingreso = fechaActual;
            nuevoSeguimientoObj.motivo = "Finalizacion de Solicitud.";
            const crearSeguimientoRes = await aprobadorSolicitudService.crearSeguimiento(client, nuevoSeguimientoObj);
            if (!(crearSeguimientoRes && crearSeguimientoRes[0].id)) {
                await client.query("ROLLBACK");
                response.resultado = 0;
                response.mensaje = "No se pudo crear el nuevo registro de Seguimiento.";
                res.status(200).json(response);
                return;
            }
            /// Fin: Agregamos nuevo registro de Seguimiento

            // => Fin: para Seguimiento

            // => actualizar estado de Solicitud
            // cambiamos de estado a la Solicitud
            const solicitud = new Solicitud();
            solicitud.id = id_solicitud;
            solicitud.estadoSolicitud = { id: config.constantesDb.id_estado_solicitud_finalizado };
            solicitud.modificado_por = id_usuario;
            const actualizarEstadoSolicitudRes = await solicitudService.actualizarEstado(client, solicitud);
            winston.info("actualizarEstadoSolicitudRes: " + actualizarEstadoSolicitudRes);
            if (!actualizarEstadoSolicitudRes) {
                await client.query("ROLLBACK");
                response.resultado = 0;
                response.mensaje = "No se pudo actualizar el Estado de la Solicitud.";
                res.status(200).json(response);
                return;
            }

            // si todo salio bien entonces hacemos commit
            await client.query('COMMIT');
            response.resultado = 1;
            response.mensaje = "";
            res.status(200).json(response);
        } else {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "No hay materiales guardados con el id_solicitud = " + id_solicitud;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
    } catch (error) {
        await client.query("ROLLBACK");
        winston.error("Error en solicitudController.finalizarSolicitud,", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
}

async function obtenerCorrelativo(client, id_usuario) {
    const area_usuario = await areaUsuarioService.obtenerPorUsuario(client, id_usuario);
    if (area_usuario) {
        area_usuario.anio;
        area_usuario.correlativo;
        area_usuario.abreviatura;

        if (!area_usuario.anio) {
            area_usuario.anio = new Date().getFullYear();
        }

        if (!area_usuario.correlativo) {
            area_usuario.correlativo = 0;
        }

        if (area_usuario.anio < new Date().getFullYear()) {
            area_usuario.anio = new Date().getFullYear();
            area_usuario.correlativo = 0;
        }

        if (!area_usuario.abreviatura) {
            area_usuario.abreviatura = '';
        }

        area_usuario.correlativo = area_usuario.correlativo + 1;
        await areaUsuarioService.actualizar(client, area_usuario);

        return area_usuario.abreviatura + '-' + area_usuario.anio + '-' + area_usuario.correlativo.toString().padStart(3, '0');
    }

    return null;
};
module.exports = solicitudController;