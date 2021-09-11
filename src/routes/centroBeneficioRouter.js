const router = require('express').Router();

const centroBeneficioController = require('../controllers/centroBeneficioController');

router.get('/listarTodo', centroBeneficioController.listarTodo);
router.get('/listarPorSociedad', centroBeneficioController.listarPorSociedad);

module.exports = router;