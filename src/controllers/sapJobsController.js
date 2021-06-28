const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const utility = require('../utils/utility');
const config = require('../config');
const MaterialSolicitud = require('../domain/materialSolicitud');
const Solicitud = require('../domain/solicitud');
const AprobadorSolicitud = require('../domain/aprobadorSolicitud');
const sapJobsService = require('../providers/cpsaaDemonioApiProvider');
const aprobadorSolicitudService = require('../services/aprobadorSolicitudService');
const EmailSender = require('../workers/mailer');

const sapJobsController = {};

sapJobsController.ejecutarSapJobs = async (req, res) => {
    winston.error("***** Inicio sapJobsController.ejecutarSapJobs *****");
    winston.error("***** Inicio sapJobsController.ejecutarSapJobs *****");
    winston.error("***** Inicio sapJobsController.ejecutarSapJobs *****");
    const response = {
        resultado: 0,
        mensaje: "Error inesperado en sapJobsController.ejecutarSapJobs"
    }
    const client = await postgresConn.getClient();
    try {
        const ejecutarSapJobs = await sapJobsService.JobsCargaMaestros(client);
        await client.query('COMMIT');
        response.resultado = 1;
        response.mensaje = "OK";
        res.status(200).json(response);
    } catch (error) {
        await client.query("ROLLBACK");
        winston.error("Error en sapJobsController.respuestaCreacionSolicitud,", error);
        response.resultado = 0;
        response.mensaje = config.mensajeError.generico;
        res.status(200).json(response);
    }
}

module.exports = sapJobsController;