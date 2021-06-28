const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const utility = require('../utils/utility');
const config = require('../config');
const MaterialSolicitud = require('../domain/materialSolicitud');
const Solicitud = require('../domain/solicitud');
const AprobadorSolicitud = require('../domain/aprobadorSolicitud');
const materialSolicitudService = require('../services/materialSolicitudService');
const aprobadorSolicitudService = require('../services/aprobadorSolicitudService');
const solicitudService = require('../services/solicitudService');
const estadoSolicitudService = require('../services/estadoSolicitudService');
const utilityService = require('../services/utilityService');
const rolService = require('../services/rolService');
const usuarioService = require('../services/usuarioService');
const EmailSender = require('../workers/mailer');

const sapController = {};

sapController.respuestaCreacionSolicitud = async (req, res) => {
    winston.error("***** Inicio sapController.respuestaCreacionSolicitud *****");
    const response = {
        resultado: 0,
        mensaje: "Error inesperado en sapController.respuestaCreacionSolicitud"
    }
    const client = await postgresConn.getClient();
    try {
        winston.error("req.body: " + JSON.stringify(req.body));
        let { id_solicitud, correlativo, detalle } = req.body;
        if (!utility.isNumericValue(id_solicitud) || parseInt(id_solicitud) < 1) {
            response.resultado = 0;
            response.mensaje = "Error: el campo id_solicitud no es válido. Tipo de dato: '" + (typeof id_solicitud) + "', valor = " + id_solicitud;
            winston.error(response.mensaje);
            res.status(200).json(response);
            return;
        }

        if (!detalle || detalle.length < 1) {
            response.resultado = 0;
            response.mensaje = "Error: el array id_solicitud no es válido. Tipo de dato: '" + (typeof detalle) + "', valor = " + detalle;
            winston.error(response.mensaje);
            res.status(200).json(response);
            return;
        }

        for (let i = 0; i < detalle.length; i++) {
            if (!utility.isNumericValue(detalle[i].id_material_solicitud) || parseInt(detalle[i].id_material_solicitud) < 1) {
                response.resultado = 0;
                response.mensaje = "Error: el campo id_material_solicitud no es válido. Tipo de dato: '" + (typeof detalle[i].id_material_solicitud) + ", valor detalle[" + i + "].id_material_solicitud = " + detalle[i].id_material_solicitud;
                winston.error(response.mensaje);
                res.status(200).json(response);
                return;
            }
            /*
            if((typeof detalle[i].material_codigo_sap) !== "string"){
                response.resultado = 0;
                response.mensaje = "Error: el campo material_codigo_sap no es válido. Tipo de dato: '"+(typeof detalle[i].material_codigo_sap)+", valor detalle["+i+"].material_codigo_sap = "+detalle[i].material_codigo_sap;
                winston.error(response.mensaje);
                res.status(200).json(response);
                return;
            }

            if((typeof detalle[i].mensaje_error) !== "string"){
                response.resultado = 0;
                response.mensaje = "Error: el campo mensaje_error no es válido. Tipo de dato: '"+(typeof detalle[i].mensaje_error)+", valor detalle["+i+"].mensaje_error = "+detalle[i].mensaje_error;
                winston.error(response.mensaje);
                res.status(200).json(response);
                return;
            }
            */
        }

        await client.query("BEGIN");
        // Inicio: obteniendo Fecha Actual
        const fechaActualRes = await aprobadorSolicitudService.obtenerFechaActual(client);
        winston.info("fechaActualRes: ", fechaActualRes);
        const fechaActual = fechaActualRes[0].fecha.toISOString().replace('T', ' ').substr(0, 19);
        winston.info("fechaActual: " + fechaActual);
        // Fin: obteniendo Fecha Actual

        // Actualizando Materiales
        for (let i = 0; i < detalle.length; i++) {
            const materialSolicitudObj = new MaterialSolicitud();
            materialSolicitudObj.id = detalle[i].id_material_solicitud;
            materialSolicitudObj.material_codigo_sap = detalle[i].material_codigo_sap;
            materialSolicitudObj.mensaje_error_sap = detalle[i].mensaje_error;
            materialSolicitudObj.existe_error_sap = detalle[i].existe_error;
            const actualizarMaterialRes = await materialSolicitudService.actualizarPorRespuestaSapCreacionSolicitud(client, materialSolicitudObj);
            if (!actualizarMaterialRes) {
                response.resultado = 0;
                response.mensaje = "Error: No se pudo actualizar datos de detalle en posicion = " + i;
                winston.error(response.mensaje);
                res.status(200).json(response);
                return;
            }
        }

        const listaAprobadoresRes = await aprobadorSolicitudService.listarFlujoPorIdSolicitudOrdenadoPorOrden(client, id_solicitud);
        // Actualizando Solicitud
        const solicitudObj = new Solicitud();
        solicitudObj.id = id_solicitud;
        const nuevoEstadoSolicitudRes = await estadoSolicitudService.buscarPorIdRol(client, listaAprobadoresRes[listaAprobadoresRes.length - 1].id_rol);
        solicitudObj.estadoSolicitud = { id: nuevoEstadoSolicitudRes[0].id };
        solicitudObj.modificado_por = config.constantesDb.id_usuario_sap;
        const actualizarEstadoSolicitudRes = await solicitudService.actualizarEstado(client, solicitudObj);
        if (!actualizarEstadoSolicitudRes) {
            response.resultado = 0;
            response.mensaje = "Error: No se pudo actualizar datos de la Solicitud.";
            winston.error(response.mensaje);
            res.status(200).json(response);
            return;
        }

        // Inicio: Para Seguimiento
        /// buscamos los registros de Seguimiento
        const listaSeguimientoRes = await aprobadorSolicitudService.listarSeguimientoPorIdSolicitudOrdenadoPorId(client, id_solicitud);
        winston.info("listaSeguimientoRes: " + JSON.stringify(listaSeguimientoRes));
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
        nuevoSeguimientoObj.id_estado_real = nuevoEstadoSolicitudRes[0].id;
        nuevoSeguimientoObj.nombre_estado_real = nuevoEstadoSolicitudRes[0].nombre;
        nuevoSeguimientoObj.id_rol_real = listaAprobadoresRes[listaAprobadoresRes.length - 1].id_rol;
        // buscamos datos del Rol
        const rolRes = await rolService.buscarPorId(client, listaAprobadoresRes[listaAprobadoresRes.length - 1].id_rol);
        winston.info("rolRes[0]:", rolRes[0]);
        nuevoSeguimientoObj.nombre_rol_real = rolRes[0].nombre;
        // buscamos datos del Usuario1
        const usuarioRes = await usuarioService.buscarPorId(client, listaAprobadoresRes[listaAprobadoresRes.length - 1].id_usuario_aprobador);
        winston.info("usuarioRes[0]:", usuarioRes[0]);
        nuevoSeguimientoObj.id_usuario_real = listaAprobadoresRes[listaAprobadoresRes.length - 1].id_usuario_aprobador;
        nuevoSeguimientoObj.nombre_usuario_real = usuarioRes[0].nombre;
        nuevoSeguimientoObj.correo_usuario_real = usuarioRes[0].usuario;
        nuevoSeguimientoObj.fecha_ingreso = fechaActual;
        nuevoSeguimientoObj.motivo = "Respuesta de SAP";
        const crearSeguimientoRes = await aprobadorSolicitudService.crearSeguimiento(client, nuevoSeguimientoObj);
        if (!(crearSeguimientoRes && crearSeguimientoRes[0].id)) {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "No se pudo crear el nuevo registro de Seguimiento.";
            res.status(200).json(response);
            return;
        }
        /// Fin: Agregamos nuevo registro de Seguimiento
        // Fin:  Para Seguimiento

        // si todo salio bien entonces hacemos commit
        await client.query('COMMIT');

        try {
            var receptores = await aprobadorSolicitudService.listarParaNotificarRespuestaSAP(postgresConn, id_solicitud);

            if (receptores && receptores.length > 0) {
                let emails = '';
                receptores.forEach(element => {
                    emails = emails.concat(element.correo, ',');
                });
                console.log(emails);

                var body = '<h2>Se crearon los siguientes códigos</h2> <ul>';
                for (let i = 0; i < detalle.length; i++) {
                    body = body.concat('<li>', detalle[i].material_codigo_sap, '</li>');
                }
                body = body.concat('</ul>', '</br>', 'Favor verificar');

                let info = await EmailSender.sendMail({
                    from: config.nodemailer.sender,
                    to: emails,
                    subject: config.mailSubjects.respuestaSAP,
                    html: body,
                });

                if (info.messageId) {
                    console.log("Notificación enviada satisfactoriamente,");
                }
            } else {
                console.log("No hay usuarios para notificar.");
            }

        } catch (error) {
            winston.error("Error enviado correos luego de recibir respuesta de SAP,", error);
        }

        response.resultado = 1;
        response.mensaje = "";
        res.status(200).json(response);
    } catch (error) {
        await client.query("ROLLBACK");
        winston.error("Error en sapController.respuestaCreacionSolicitud,", error);
        response.resultado = 0;
        response.mensaje = config.mensajeError.generico;
        res.status(200).json(response);
    } finally {
        client.release();
        winston.error("***** Fin sapController.respuestaCreacionSolicitud *****");
    }
}

module.exports = sapController;