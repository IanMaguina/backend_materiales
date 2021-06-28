const router = require('express').Router();

const grupoEstadisticaMatController = require('../controllers/grupoEstadisticaMatController');

router.get('/listarTodo', grupoEstadisticaMatController.listarTodo);

module.exports = router;