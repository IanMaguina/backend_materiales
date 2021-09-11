const router = require('express').Router();

const responsableControlProduccionController = require('../controllers/responsableControlProduccionController');

router.get('/listarTodo', responsableControlProduccionController.listarTodo);

router.get('/listarPorCentro', responsableControlProduccionController.listarPorCentro);

module.exports = router;