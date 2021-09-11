const router = require('express').Router();

const categoriaValoracionController = require('../controllers/categoriaValoracionController');

router.get('/listarTodo', categoriaValoracionController.listarTodo);
router.get('/listarPorTipoMaterial', categoriaValoracionController.listarPorTipoMaterial);

module.exports = router;