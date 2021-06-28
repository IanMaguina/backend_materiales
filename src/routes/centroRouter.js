const router = require('express').Router();

const centroController = require('../controllers/centroController');

router.get('/listar', centroController.listar);

module.exports = router;