const winston = require('../utils/winston');
const postgresConn = require('../connections/postgres');
const config = require('../config');
const enums = require('../utils/enums');
const EmailSender = require('../workers/mailer');
const aprobadorSolicitudService = require('../services/aprobadorSolicitudService');
const solicitudService = require('../services/solicitudService');
const materialSolicitudService = require('../services/materialSolicitudService');

const controller = { internal: {}, external: {} };

/*
    Funciones públicas invocadas por el router
*/
controller.external.notificarAprobacion = async (req, res) => {
    try {

        const { id_solicitud, id_rol } = req.query;
        const response = await notificarAprobacion(id_solicitud, id_rol);

        res.status(200).json(response);

    } catch (error) {
        winston.info("Error en notificacionController.external.notificarAprobacion. Details: ", error);
        res.status(500).send(error);
    }
};

controller.external.notificarRechazo = async (req, res) => {
    try {

        const { id_solicitud, id_rol } = req.query;
        const response = await notificarRechazo(id_solicitud, id_rol);

        res.status(200).json(response);

    } catch (error) {
        winston.info("Error en notificacionController.external.notificarRechazo. Details: ", error);
        res.status(500).send(error);
    }
};

/*
    Funciones públicas invocadas por otros controllers
*/
controller.internal.notificarAprobacion = async (id_solicitud, id_rol) => {
    return await notificarAprobacion(id_solicitud, id_rol);
};

controller.internal.notificarRechazo = async (id_solicitud, id_rol, nombre_motivo_rechazo, motivo) => {
    return await notificarRechazo(id_solicitud, id_rol, nombre_motivo_rechazo, motivo);
};

controller.internal.notificarRespuestaSAP = async (id_solicitud, detalle) => {
    return await notificarRespuestaSAP(id_solicitud, detalle);
};

controller.internal.notificarEliminacionMaterial = async (id_solicitud, material) => {
    return await notificarEliminacionMaterial(id_solicitud, material);
};

controller.internal.notificarFinalizacion = async (id_solicitud, id_rol) => {
    return await notificarFinalizacion(id_solicitud, id_rol);
};

/*
    Funciones privadas
*/
async function notificarAprobacion(id_solicitud, id_rol) {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al notificar aprobación."
        };

        const notificador = await aprobadorSolicitudService.obtenerNotificador(postgresConn, id_solicitud, id_rol);

        if (notificador && notificador.aprobar_enviar_correo) {
            const receptores = await aprobadorSolicitudService.obtenerDestinatarios(postgresConn, id_solicitud, notificador.orden + 1);

            if (receptores.length > 0) {
                const solicitud = await solicitudService.obtenerParaNotificarAprobacion(postgresConn, id_solicitud);

                if (solicitud) {
                    let emails = '';
                    receptores.forEach(element => {
                        emails = emails.concat(element.usuario, ',');
                    });
                    emails += 'vrcisnerosc@gmail.com';

                    let html = "<b>Solicitud aprobada</b><br><br>";
                    const materiales = await materialSolicitudService.listarParaNotificar(postgresConn, id_solicitud);

                    if (materiales) {
                        html += '<b>Lista de materiales:</b> ';
                        html += '<ul>';
                        materiales.forEach(element => {
                            html += '<li>';
                            html += element.denominacion;
                            html += '</li>';
                        });

                        html += '</ul><br><br>';
                    }
                    let link = config.mailSubjects.baseUrl.replace('{0}', enums.escenarioNivel1[solicitud.codigo].urlControlador)
                    link = link.replace('{1}', solicitud.codigo);
                    link = link.replace('{2}', id_solicitud);

                    html += link;

                    let subject = config.mailSubjects.aprobacion.replace('{0}', ("[" + obtener_tipo_solicitud(solicitud.id_tipo_solicitud) + "]"));
                    subject = subject.replace('{1}', (id_solicitud + " - " + solicitud.descripcion));

                    let info = await EmailSender.sendMail({
                        from: config.nodemailer.sender,
                        to: emails,
                        subject: subject,
                        html: html
                    });

                    if (info.messageId) {
                        response.resultado = 1;
                        response.mensaje = "notificación enviada satisfactoriamente";
                    }
                }

            } else {
                response.mensaje = "No existen usuarios para notificar."
            }
        } else {
            response.mensaje = "No está activa la configuración de notificar."
        }

        return response;
    } catch (error) {
        winston.info("Error en notificacionController.internal.notificarAprobacion. Details: ", error);
        throw error;
    }
};

async function notificarRechazo(id_solicitud, id_rol, nombre_motivo_rechazo, motivo) {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al notificar rechazo."
        };

        const notificador = await aprobadorSolicitudService.obtenerNotificador(postgresConn, id_solicitud, id_rol);

        if (notificador && notificador.rechazar_enviar_correo) {
            const receptores = await aprobadorSolicitudService.obtenerDestinatarios(postgresConn, id_solicitud, notificador.orden - 1);

            if (receptores.length) {
                const solicitud = await solicitudService.obtenerParaNotificarRechazo(postgresConn, id_solicitud);

                let emails = '';
                receptores.forEach(element => {
                    emails = emails.concat(element.usuario, ',');
                });
                emails += 'vrcisnerosc@gmail.com';

                let html = "<b>Solicitud rechazada</b><br><br>";
                if (solicitud) {
                    html += '<b>Motivo Rechazo:</b> ';
                    html += nombre_motivo_rechazo;
                    html += '<br>';
                    html += '<b>Descripción:</b> ';
                    html += motivo;
                    html += '<br>';

                    const materiales = await materialSolicitudService.listarParaNotificar(postgresConn, id_solicitud);

                    if (materiales) {
                        html += '<b>Lista de materiales:</b> ';
                        html += '<ul>';
                        materiales.forEach(element => {
                            html += '<li>';
                            html += element.denominacion;
                            html += '</li>';
                        });

                        html += '</ul><br><br>';
                    }
                    let link = config.mailSubjects.baseUrl.replace('{0}', enums.escenarioNivel1[solicitud.codigo].urlControlador)
                    link = link.replace('{1}', solicitud.codigo);
                    link = link.replace('{2}', id_solicitud);

                    html += link;
                }
                let subject = config.mailSubjects.rechazo.replace('{0}', ("[" + obtener_tipo_solicitud(solicitud.id_tipo_solicitud) + "]"));
                subject = subject.replace('{1}', (id_solicitud + " - " + solicitud.descripcion));

                let info = await EmailSender.sendMail({
                    from: config.nodemailer.sender,
                    to: emails,
                    subject: subject,
                    html: html
                });

                if (info.messageId) {
                    response.resultado = 1;
                    response.mensaje = "notificación enviada satisfactoriamente";
                }
            } else {
                response.mensaje = "No existen usuarios para notificar."
            }
        } else {
            response.mensaje = "No está activa la configuración de notificar."
        }

        return response;
    } catch (error) {
        winston.info("Error en notificacionController.internal.notificarRechazo. Details: ", error);
        throw error;
    }
};

async function notificarRespuestaSAP(id_solicitud, detalle) {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al notificar respuesta SAP."
        };

        var receptores = await aprobadorSolicitudService.listarEmailsInternosExternos(postgresConn, id_solicitud);

        if (receptores && receptores.length > 0) {
            const solicitud = await solicitudService.obtenerParaNotificarAprobacion(postgresConn, id_solicitud);

            if (solicitud) {
                let emails = '';
                receptores.forEach(element => {
                    emails = emails.concat(element.correo, ',');
                });
                emails += 'vrcisnerosc@gmail.com';

                var body = '<h2>Se crearon los siguientes códigos</h2> <ul>';
                for (let i = 0; i < detalle.length; i++) {
                    body = body.concat('<li>', detalle[i].material_codigo_sap, '</li>');
                }
                body = body.concat('</ul>', '</br>', 'Favor verificar');

                let subject = config.mailSubjects.respuestaSAP.replace('{0}', ("[" + obtener_tipo_solicitud(solicitud.id_tipo_solicitud) + "]"));
                subject = subject.replace('{1}', (id_solicitud + " - " + solicitud.descripcion));

                let info = await EmailSender.sendMail({
                    from: config.nodemailer.sender,
                    to: emails,
                    subject: subject,
                    html: body,
                });

                if (info.messageId) {
                    response.resultado = 1;
                    response.mensaje = "Notificación enviada satisfactoriamente";
                }
            }
        } else {
            response.mensaje = "No existen usuarios para notificar."
        }

        return response;
    } catch (error) {
        winston.info("Error en notificacionController.internal.notificarRespuestaSAP. Details: ", error);
        throw error;
    }
};

async function notificarEliminacionMaterial(id_solicitud, material) {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al notificar eliminación de material."
        };

        const rol_actual_response = await aprobadorSolicitudService.obtenerRolEstaAqui(postgresConn, id_solicitud);

        if (rol_actual_response && rol_actual_response.id_rol !== 1) {
            const receptores = await aprobadorSolicitudService.obtenerDestinatariosPorRol(postgresConn, id_solicitud, 1);

            if (receptores.length > 0) {
                const solicitud = await solicitudService.obtenerParaNotificarAprobacion(postgresConn, id_solicitud);

                if (solicitud) {
                    let emails = '';
                    receptores.forEach(element => {
                        emails = emails.concat(element.correo_usuario_real, ',');
                    });
                    emails += 'vrcisnerosc@gmail.com';

                    let html = "<b>Material eliminado</b><br><br>";

                    html += '<b>Se eliminó el siguiente material:</b> ';
                    html += '<ul>';

                    html += '<li>Denominación: ' + material.denominacion + '</li>';
                    html += '<li>Centro: ' + material.centro_codigo_sap + '</li>';
                    html += '<li>Almacén: ' + material.almacen_codigo_sap + '</li>';

                    html += '</ul><br><br>';

                    let subject = config.mailSubjects.eliminacion.replace('{0}', ("[" + obtener_tipo_solicitud(solicitud.id_tipo_solicitud) + "]"));
                    subject = subject.replace('{1}', material.denominacion);

                    let info = await EmailSender.sendMail({
                        from: config.nodemailer.sender,
                        to: emails,
                        subject: subject,
                        html: html
                    });

                    if (info.messageId) {
                        response.resultado = 1;
                        response.mensaje = "notificación enviada satisfactoriamente";
                    }
                }
            } else {
                response.mensaje = "No existen usuarios para notificar."
            }
        } else {
            response.resultado = 1;
            response.mensaje = "notificación no enviada por tratarse de un solicitante";
        }

        return response;
    } catch (error) {
        winston.info("Error en notificacionController.internal.notificarEliminacion. Details: ", error);
        throw error;
    }
};

async function notificarFinalizacion(id_solicitud) {
    try {
        const response = { resultado: 0, mensaje: "Error inesperado al notificar finalización." };

        var receptores = await aprobadorSolicitudService.listarEmailsInternosExternos(postgresConn, id_solicitud);

        if (receptores && receptores.length > 0) {
            const solicitud = await solicitudService.obtenerParaNotificarAprobacion(postgresConn, id_solicitud);

            let emails = '';
            receptores.forEach(element => {
                emails = emails.concat(element.correo, ',');
            });
            emails += 'vrcisnerosc@gmail.com';

            let html = "<b>Solicitud finalizada</b><br><br>";
            if (solicitud) {
                const materiales = await materialSolicitudService.listarParaNotificar(postgresConn, id_solicitud);

                if (materiales) {
                    html += '<b>Lista de materiales:</b> ';
                    html += '<ul>';
                    materiales.forEach(element => {
                        html += '<li>';
                        html += element.denominacion;
                        html += '</li>';
                    });

                    html += '</ul><br><br>';
                }
            }

            let subject = config.mailSubjects.finalizacion.replace('{0}', ("[" + obtener_tipo_solicitud(solicitud.id_tipo_solicitud) + "]"));
            subject = subject.replace('{1}', (id_solicitud + " - " + solicitud.descripcion));

            let info = await EmailSender.sendMail({
                from: config.nodemailer.sender,
                to: emails,
                subject: subject,
                html: html,
            });

            if (info.messageId) {
                console.log("Notificación enviada satisfactoriamente,");
            }
        } else {
            response.mensaje = "No existen usuarios para notificar."
        }
    } catch (error) {
        winston.info("Error en notificacionController.internal.notificarFinalizacion. Details: ", error);
        throw error;
    }
};

function obtener_tipo_solicitud(id_tipo_solicitud) {
    switch (id_tipo_solicitud) {
        case enums.tipo_solicitud.creacion: return "Creación"; break;
        case enums.tipo_solicitud.ampliacion: return "Ampliación"; break;
        case enums.tipo_solicitud.modificacion: return "Modificación"; break;
        case enums.tipo_solicitud.bloqueo: return "Bloqueo"; break;
        default: return ""; break;
    }
};

module.exports = controller;