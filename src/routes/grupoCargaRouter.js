const router = require('express').Router();

const grupoCargaController = require('../controllers/grupoCargaController');

router.get('/listarTodo', grupoCargaController.listarTodo);

module.exports = router;