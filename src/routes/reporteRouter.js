const router = require('express').Router();

const reporteController = require('../controllers/reporteController');

router.post('/porcentajeSolicitudesPorEstadoDashboard', reporteController.porcentajeSolicitudesPorEstadoDashboard);
router.post('/cantidadSolicitudesPendientes', reporteController.cantidadSolicitudesPendientes);
router.post('/tiempoPromedioAtencion', reporteController.tiempoPromedioAtencion);
router.post('/porcentajeAvance', reporteController.porcentajeAvance);
router.post('/cantidadSolicitudesPorArea', reporteController.cantidadSolicitudesPorArea);
router.post('/tiempoAtencionPorGestor', reporteController.tiempoAtencionPorGestor);
router.post('/cantidadSolicitudesPorMotivoRechazo', reporteController.cantidadSolicitudesPorMotivoRechazo);
router.post('/cantidadSolicitudesPorTipo', reporteController.cantidadSolicitudesPorTipo);
router.post('/porcentajeSolicitudesPorEstadoReporte', reporteController.porcentajeSolicitudesPorEstadoReporte);
router.post('/cantidadSolicitudesPorEstado', reporteController.cantidadSolicitudesPorEstado);
router.post('/listadoSolicitudes', reporteController.listadoSolicitudes);
router.post('/tiempoAtencionPorEstado', reporteController.tiempoAtencionPorEstado);
router.post('/solicitudesYaFiltradas', reporteController.solicitudesYaFiltradas);

module.exports = router;