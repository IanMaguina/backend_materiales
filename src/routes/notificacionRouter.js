const router = require('express').Router();

const notificacionController = require('../controllers/notificacionController');

router.get('/notificarAprobacion',notificacionController.external.notificarAprobacion);
router.get('/notificarRechazo',notificacionController.external.notificarRechazo);

module.exports = router;
