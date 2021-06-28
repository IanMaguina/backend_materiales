const router = require('express').Router();

const grupoCompraController = require('../controllers/grupoCompraController');

router.get('/listarTodo', grupoCompraController.listarTodo);

module.exports = router;