const router = require('express').Router();

const materialSolicitudController = require('../controllers/materialSolicitudController');

router.get('/validarDenominacion', materialSolicitudController.external.consultaNombreMaterialSAP);
router.get('/existeDenominacion', materialSolicitudController.external.existeDenominacion);
router.get('/existeDenominacionEnDb', materialSolicitudController.external.existeDenominacionEnDb);
router.get('/consultaNombreMaterialSAP', materialSolicitudController.external.consultaNombreMaterialSAP);
router.post('/consultaCodigoMaterialSAP', materialSolicitudController.external.consultaCodigoMaterialSAP);
router.get('/existePadreAmpliacion', materialSolicitudController.external.existePadreAmpliacion);
router.get('/existeHijosAmpliacion', materialSolicitudController.external.existeHijosAmpliacion);
router.get('/esPadre', materialSolicitudController.external.esPadre);
module.exports = router;