const router = require('express').Router();

const sociedadController = require('../controllers/sociedadController');

// listar todo
router.get('/listarTodo', sociedadController.listarTodo);
router.get('/listar', sociedadController.listar);

module.exports = router;
