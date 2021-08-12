const config = require('../config');
const multer = require('multer');
const path = require('path');
const URLSafeBase64 = require('urlsafe-base64');
const crypto = require('crypto');
const router = require('express').Router();
const anexoSolicitudController = require('../controllers/anexoSolicitudController');
const anexoMaterialController = require('../controllers/anexoMaterialController');
const equivalenciaMaterialController = require('../controllers/equivalenciaMaterialController');

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, config.uploads.ruta)
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + "-" + crypto.randomBytes(16).toString("hex") + path.extname(file.originalname))
    }
});

const uploadFile = multer({
    storage: storage
}).fields([ { name: 'archivo', maxCount: 1 } ]);

const solicitudController = require('../controllers/solicitudController');
const materialSolicitudController = require('../controllers/materialSolicitudController');

router.post('/crearCabecera', solicitudController.crearCabecera);

router.post('/contarFilasPorFiltros', solicitudController.contarFilasPorFiltros);

router.post('/buscarPorFiltros', solicitudController.buscarPorFiltros);

router.post('/obtenerDatosDeSolicitud', solicitudController.obtenerDatosDeSolicitud);

router.post('/actualizarCabecera', solicitudController.actualizarCabecera);

router.post('/anularSolicitud', solicitudController.anularSolicitud);

router.post('/aprobacionRechazoSolicitud', solicitudController.aprobacionRechazoSolicitud);

router.post('/rechazoSolicitudADemanda', solicitudController.rechazoSolicitudADemanda);

router.get('/listarSeguimiento', solicitudController.listarSeguimiento);

router.get('/listarFlujo', solicitudController.listarFlujo);

router.get('/cantidadSolicitudesPorUsuario', solicitudController.cantidadSolicitudesPorUsuario);

router.get('/cantidadDeAprobacionesPorUsuario', solicitudController.cantidadDeAprobacionesPorUsuario);

router.get('/cantidadDePendientesPorUsuario', solicitudController.cantidadDePendientesPorUsuario);

router.post('/subirAnexoSolicitud', uploadFile, anexoSolicitudController.subir2);
router.post('/subirAnexoSolicitudxRol', uploadFile, anexoSolicitudController.subirAnexoSolicitudxRol);

router.post('/obtenerUrlAnexoSolicitud', anexoSolicitudController.obtenerUrl2);
router.post('/obtenerAllUrlAnexoSolicitud', anexoSolicitudController.obtenerAllUrlAnexoSolicitud);

router.post('/finalizarSolicitud', solicitudController.finalizarSolicitud);

router.post('/borrarAnexoSolicitud', anexoSolicitudController.borrar);
router.post('/borrarAnexoxIdAnexoSolicitud', anexoSolicitudController.borrarAnexoxIdAnexoSolicitud);

//#region Materiales 
router.get('/:id_solicitud/materialSolicitud/listarMateriales', materialSolicitudController.external.listar);

router.get('/:id_solicitud/materialSolicitud/obtenerMaterial/:id_material_solicitud', materialSolicitudController.external.obtenerMaterial);

router.post('/:id_solicitud/materialSolicitud/agregarMaterial', materialSolicitudController.external.agregarMaterial);

router.put('/:id_solicitud/materialSolicitud/:id_material_solicitud/actualizarMaterial', materialSolicitudController.external.actualizarMaterial);

 router.post('/:id_solicitud/materialSolicitud/:id_material_solicitud/eliminarMaterial', materialSolicitudController.external.eliminarMaterial);

router.post('/:id_solicitud/materialSolicitud/agregarMateriales', materialSolicitudController.external.agregarMateriales);

router.get('/enviarSAP/:id_solicitud', materialSolicitudController.external.enviarSAP);

router.post('/subirAnexoMaterial', uploadFile, anexoMaterialController.subir2);
router.post('/subirAnexoMaterialxRol', uploadFile, anexoMaterialController.subirAnexoMaterialxRol);

router.post('/obtenerUrlAnexoMaterial', anexoMaterialController.obtenerUrl2);
router.post('/obtenerAllUrlAnexoMaterial', anexoMaterialController.obtenerAllUrlAnexoMaterial);

router.post('/borrarAnexoMaterial', anexoMaterialController.borrar);
router.post('/borrarxIdMaterialAnexo', anexoMaterialController.borrarxIdMaterialAnexo);

router.post('/contarMisSolicitudes', solicitudController.contarMisSolicitudes);
router.post('/buscarMisSolicitudes', solicitudController.buscarMisSolicitudes);

router.post('/contarMisPendientes', solicitudController.contarMisPendientes);
router.post('/buscarMisPendientes', solicitudController.buscarMisPendientes);
//#endregion

router.post('/agregarEquivalenciaMaterialxRol', equivalenciaMaterialController.agregarEquivalenciaMaterialxRol);
router.post('/obtenerAllEquivalenciaMaterial', equivalenciaMaterialController.obtenerAllEquivalenciaMaterial);
router.post('/borrarxIdEquivalenciaMaterial', equivalenciaMaterialController.borrarxIdEquivalenciaMaterial);

router.post('/:id_solicitud/materialSolicitud/crearAmpliacion', materialSolicitudController.external.crearAmpliacion);
router.put('/:id_solicitud/materialSolicitud/:id_material_solicitud/actualizarAmpliacion', materialSolicitudController.external.actualizarAmpliacion);
router.post('/:id_solicitud/materialSolicitud/agregarAmpliaciones', materialSolicitudController.external.agregarAmpliaciones);

router.post('/:id_solicitud/materialSolicitud/crearModificacion', materialSolicitudController.external.crearModificacion);
router.put('/:id_solicitud/materialSolicitud/:id_material_solicitud/actualizarModificacion', materialSolicitudController.external.actualizarModificacion);
router.post('/:id_solicitud/materialSolicitud/agregarModificaciones', materialSolicitudController.external.agregarModificaciones);

router.post('/:id_solicitud/materialSolicitud/crearBloqueo', materialSolicitudController.external.crearBloqueo);
router.put('/:id_solicitud/materialSolicitud/:id_material_solicitud/actualizarBloqueo', materialSolicitudController.external.actualizarBloqueo);
router.post('/:id_solicitud/materialSolicitud/agregarBloqueos', materialSolicitudController.external.agregarBloqueos);

module.exports = router;