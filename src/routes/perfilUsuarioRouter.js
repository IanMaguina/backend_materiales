const router = require('express').Router();

const perfilUsuarioController = require('../controllers/perfilUsuarioController');

// listar todo Perfil Usuario
router.get('/listarTodo', perfilUsuarioController.listarTodo);

module.exports = router;