const router = require('express').Router();

const jerarquiaProductoController = require('../controllers/jerarquiaProductoController');

router.get('/listarTodo', jerarquiaProductoController.listarTodo);

module.exports = router;