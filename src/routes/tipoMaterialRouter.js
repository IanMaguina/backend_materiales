const router = require('express').Router();

const tipoMaterialController = require('../controllers/tipoMaterialController');

// listar todo
router.get('/listarTodo', tipoMaterialController.listarTodo);

module.exports = router;