const router = require('express').Router();

const unidadMedidaController = require('../controllers/unidadMedidaController');

router.get('/listarTodo', unidadMedidaController.listarTodo);

module.exports = router;