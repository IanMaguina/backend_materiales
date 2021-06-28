const router = require('express').Router();

const organizacionVentaController = require('../controllers/organizacionVentaController');

router.get('/listarTodo', organizacionVentaController.listarTodo);
router.get('/listarPorSociedad', organizacionVentaController.listarPorSociedad);

module.exports = router;