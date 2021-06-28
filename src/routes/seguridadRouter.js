const router = require('express').Router();

const seguridadController = require('../controllers/seguridadController');

router.get('/validarToken', seguridadController.validarToken);

module.exports = router;
