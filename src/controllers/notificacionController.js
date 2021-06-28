const winston = require('../utils/winston');
const postgresConn = require('../connections/postgres');
const aprobadorSolicitudService = require('../services/aprobadorSolicitudService');
const EmailSender = require('../workers/mailer');
const config = require('../config');
const solicitudService = require('../services/solicitudService');
const materialSolicitudService = require('../services/materialSolicitudService');
const enums = require('../utils/enums');

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
    return notificarAprobacion(id_solicitud, id_rol);
};

controller.internal.notificarRechazo = async (id_solicitud, id_rol, nombre_motivo_rechazo, motivo) => {
    return notificarRechazo(id_solicitud, id_rol, nombre_motivo_rechazo, motivo);
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

                let emails = '';
                receptores.forEach(element => {
                    emails = emails.concat(element.usuario, ',');
                });
                //emails += 'vrcisnerosc@gmail.com';

                let html = "<b>Solicitud aprobada</b><br><br>";
                if (solicitud) {
                    const materiales = await materialSolicitudService.listarParaNotificarRechazo(postgresConn, id_solicitud);

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
                
                let info = await EmailSender.sendMail({
                    from: config.nodemailer.sender,
                    to: emails,
                    subject: config.mailSubjects.aprobacion.replace('{0}', id_solicitud),
                    //text: "Hello world?", // plain text body
                    html: html
                });

                if (info.messageId) {
                    response.resultado = 1;
                    response.mensaje = "notificación enviada satisfactoriamente";
                }
            } else {
                response.mensaje = "No hay usuarios para notificar."
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
                //emails += 'vrcisnerosc@gmail.com';

                let html = "<b>Solicitud rechazada</b><br><br>";
                if (solicitud) {
                    html += '<b>Motivo Rechazo:</b> ';
                    html += nombre_motivo_rechazo;
                    html += '<br>';
                    html += '<b>Descripción:</b> ';
                    html += motivo;
                    html += '<br>';

                    const materiales = await materialSolicitudService.listarParaNotificarRechazo(postgresConn, id_solicitud);

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

                let info = await EmailSender.sendMail({
                    from: config.nodemailer.sender,
                    to: emails,
                    subject: config.mailSubjects.rechazo.replace('{0}', id_solicitud),
                    //text: "Hello world?", // plain text body
                    html: html
                });

                if (info.messageId) {
                    response.resultado = 1;
                    response.mensaje = "notificación enviada satisfactoriamente";
                }
            } else {
                response.mensaje = "No hay usuarios para notificar."
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

module.exports = controller;