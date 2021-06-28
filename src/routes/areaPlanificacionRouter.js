const router = require('express').Router();

const areaPlanificacionController = require('../controllers/areaPlanificacionController');

router.get('/listar', areaPlanificacionController.listar);

module.exports = router;