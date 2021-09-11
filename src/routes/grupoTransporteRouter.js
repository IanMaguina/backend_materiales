const router = require('express').Router();

const grupoTransporteController = require('../controllers/grupoTransporteController');

router.get('/listarTodo', grupoTransporteController.listarTodo);

module.exports = router;