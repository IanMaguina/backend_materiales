const router = require('express').Router();

const areaUsuarioController = require('../controllers/areaUsuarioController');

// listar todo Area Usuario
router.get('/listarTodo', areaUsuarioController.listarTodo);

module.exports = router;