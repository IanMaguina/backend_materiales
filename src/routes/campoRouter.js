const router = require('express').Router();

const campoController = require('../controllers/campoController');

router.get('/listar', campoController.listar);

router.get('/listarDiccionarioDeNombres', campoController.listarDiccionarioDeNombres);

router.get('/listarTodo', campoController.listarTodo);

module.exports = router;