const router = require('express').Router();

const perfilControlFabricacionController = require('../controllers/perfilControlFabricacionController');

router.get('/listarTodo', perfilControlFabricacionController.listarTodo);

router.get('/listarPorCentro', perfilControlFabricacionController.listarPorCentro);

module.exports = router;