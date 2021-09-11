const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const reporteService = require('../services/reporteService');
const controller = {};

controller.porcentajeSolicitudesPorEstadoDashboard = async (req, res) => {
    try {
        const response = { resultado: 0, mensaje: "No se encontraron resultados." };

        const filtros = { id_rol, id_tipo_solicitud, id_area_usuario, fecha_inicio, fecha_fin } = req.body;

        const total_solicitudes = await reporteService.obtener_total_solicitudes_dashboard(postgresConn, filtros);
        const solicitudes = await reporteService.listar_solicitudes_por_estado_dashboard(postgresConn, filtros);
        let lista = [];

        solicitudes.forEach(element => {
            const obj = {
                id_estado_solicitud: element.id,
                nombre: element.nombre,
                porcentaje: 0
            };

            if (total_solicitudes && total_solicitudes.count > 0) {
                obj.porcentaje = element.count / total_solicitudes.count * 100.0;
                lista.push(obj);
            }
        });

        response.resultado = 1;
        response.mensaje = "";
        response.lista = lista;

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en reporteController.porcentajeSolicitudesPorEstadoDashboard,", error);
        res.status(500).send(error);
    }
};

controller.cantidadSolicitudesPendientes = async (req, res) => {
    try {
        const response = { resultado: 0, mensaje: "No se encontraron resultados." };

        const filtros = { id_rol, id_tipo_solicitud, id_area_usuario, fecha_inicio, fecha_fin } = req.body;

        const total_solicitudes = await reporteService.obtener_total_solicitudes_pendientes(postgresConn, filtros);

        response.resultado = 1;
        response.mensaje = "";
        response.total_solicitudes = total_solicitudes.count;

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en reporteController.cantidadSolicitudesPendientes,", error);
        res.status(500).send(error);
    }
};

controller.tiempoPromedioAtencion = async (req, res) => {
    try {
        const response = { resultado: 0, mensaje: "No se encontraron resultados." };

        const filtros = { id_rol, id_tipo_solicitud, id_area_usuario, fecha_inicio, fecha_fin } = req.body;

        const promedio_atencion = await reporteService.obtener_promedio_atencion(postgresConn, filtros);

        if (promedio_atencion) {
            response.resultado = 1;
            response.mensaje = "";
            response.promedio_atencion = promedio_atencion.promedio ?? 0;
        }

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en reporteController.tiempoPromedioAtencion,", error);
        res.status(500).send(error);
    }
};

controller.porcentajeAvance = async (req, res) => {
    try {
        const response = { resultado: 0, mensaje: "No se encontraron resultados." };

        const filtros = { id_rol, id_tipo_solicitud, id_area_usuario, fecha_inicio, fecha_fin } = req.body;

        const total_solicitudes = await reporteService.obtener_total_solicitudes_dashboard(postgresConn, filtros);
        const total_solicitudes_finalizadas = await reporteService.obtener_total_solicitudes_finalizadas(postgresConn, filtros);

        if (total_solicitudes && total_solicitudes.count > 0) {
            response.resultado = 1;
            response.mensaje = "";
            response.porcentaje = total_solicitudes_finalizadas.count / total_solicitudes.count * 100.0;
        }

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en reporteController.porcentajeAvance,", error);
        res.status(500).send(error);
    }
};

controller.cantidadSolicitudesPorArea = async (req, res) => {
    try {
        const response = { resultado: 0, mensaje: "No se encontraron resultados." };

        const filtros = { id_rol, id_tipo_solicitud, id_area_usuario, fecha_inicio, fecha_fin } = req.body;

        const result = await reporteService.listar_solicitudes_por_area(postgresConn, filtros);

        if (result) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = result;
        }

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en reporteController.cantidadSolicitudesPorArea,", error);
        res.status(500).send(error);
    }
};

controller.tiempoAtencionPorGestor = async (req, res) => {
    try {
        const response = { resultado: 0, mensaje: "No se encontraron resultados." };

        const filtros = { id_rol, id_tipo_solicitud, id_area_usuario, fecha_inicio, fecha_fin } = req.body;

        const result = await reporteService.listar_tiempo_atencion_por_gestor(postgresConn, filtros);

        if (result) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = result;
        }

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en reporteController.tiempoAtencionPorGestor,", error);
        res.status(500).send(error);
    }
};

controller.cantidadSolicitudesPorMotivoRechazo = async (req, res) => {
    try {
        const response = { resultado: 0, mensaje: "No se encontraron resultados." };

        const filtros = { id_rol, id_tipo_solicitud, id_area_usuario, fecha_inicio, fecha_fin } = req.body;

        const result = await reporteService.listar_solicitudes_por_motivo_rechazo(postgresConn, filtros);

        if (result) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = result;
        }

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en reporteController.cantidadSolicitudesPorMotivoRechazo,", error);
        res.status(500).send(error);
    }
};

controller.cantidadSolicitudesPorTipo = async (req, res) => {
    try {
        const response = { resultado: 0, mensaje: "No se encontraron resultados." };

        const filtros = { id_rol, id_tipo_solicitud, id_area_usuario, fecha_inicio, fecha_fin } = req.body;

        const result = await reporteService.listar_solicitudes_por_tipo(postgresConn, filtros);

        if (result) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = result;
        }

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en reporteController.cantidadSolicitudesPorTipo,", error);
        res.status(500).send(error);
    }
};

controller.porcentajeSolicitudesPorEstadoReporte = async (req, res) => {
    try {
        const response = { resultado: 0, mensaje: "No se encontraron resultados." };

        const filtros = { fecha_inicio, fecha_fin, anho, id_sociedad, id_usuario, id_area_usuario, id_tipo_solicitud, id_escenario_nivel3, centro_codigo_sap } = req.body;

        const total_solicitudes = await reporteService.obtener_total_solicitudes_cantidad(postgresConn, filtros);
        const solicitudes = await reporteService.listar_solicitudes_por_estado_cantidad(postgresConn, filtros);
        let lista = [];

        solicitudes.forEach(element => {
            const obj = {
                id_estado_solicitud: element.id,
                nombre: element.nombre,
                porcentaje: 0
            };

            if (total_solicitudes && total_solicitudes.count > 0) {
                obj.porcentaje = element.count / total_solicitudes.count * 100.0;
                lista.push(obj);
            }
        });

        response.resultado = 1;
        response.mensaje = "";
        response.lista = lista;

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en reporteController.porcentajeSolicitudesPorEstadoReporte,", error);
        res.status(500).send(error);
    }
};

controller.cantidadSolicitudesPorEstado = async (req, res) => {
    try {
        const response = { resultado: 0, mensaje: "No se encontraron resultados." };

        const filtros = { fecha_inicio, fecha_fin, anho, id_sociedad, id_usuario, id_area_usuario, id_tipo_solicitud, id_escenario_nivel3, centro_codigo_sap } = req.body;

        const result = await reporteService.listar_solicitudes_por_estado_cantidad(postgresConn, filtros);

        if (result) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = result;
        }

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en reporteController.cantidadSolicitudesPorEstado,", error);
        res.status(500).send(error);
    }
};

controller.listadoSolicitudes = async (req, res) => {
    try {
        const response = { resultado: 0, mensaje: "No se encontraron resultados." };

        const filtros = { fecha_inicio, fecha_fin, anho, id_sociedad, id_usuario, id_area_usuario, id_tipo_solicitud, id_escenario_nivel3, centro_codigo_sap } = req.body;
        
        const result = await reporteService.listar_solicitudes_filtros_cantidad(postgresConn, filtros);

        if (result) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = result;
        }

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en reporteController.listadoSolicitudes,", error);
        res.status(500).send(error);
    }
};

controller.tiempoAtencionPorEstado = async (req, res) => {
    try {
        const response = { resultado: 0, mensaje: "No se encontraron resultados." };

        const filtros = { fecha_inicio, fecha_fin, id_sociedad, id_usuario, id_area_usuario, id_tipo_solicitud, id_escenario_nivel3, id_estado_solicitud, centro_codigo_sap } = req.body;

        const result = await reporteService.listar_promedio_atencion_estado(postgresConn, filtros);

        if (result) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = result;
        }

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en reporteController.tiempoAtencionPorEstado,", error);
        res.status(500).send(error);
    }
};

controller.solicitudesYaFiltradas = async (req, res) => {
    try {
        const response = { resultado: 0, mensaje: "No se encontraron resultados." };

        const filtros = { fecha_inicio, fecha_fin, id_sociedad, id_usuario, id_area_usuario, id_tipo_solicitud, id_escenario_nivel3, id_estado_solicitud, centro_codigo_sap } = req.body;

        const result = await reporteService.listar_solicitudes_filtros_tiempo(postgresConn, filtros);

        if (result) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = result;
        }

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en reporteController.solicitudesYaFiltradas,", error);
        res.status(500).send(error);
    }
};

module.exports = controller;