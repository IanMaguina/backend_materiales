const router = require('express').Router();

const grupoArticuloController = require('../controllers/grupoArticuloController');

router.get('/listarTodo', grupoArticuloController.listarTodo);

module.exports = router;