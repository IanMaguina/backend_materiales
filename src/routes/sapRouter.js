const router = require('express').Router();
const sapController = require('../controllers/sapController');

router.post('/respuestaCreacionSolicitud', sapController.respuestaCreacionSolicitud);

module.exports = router;