const router = require('express').Router();

const grupoTipoPosicionController = require('../controllers/grupoTipoPosicionController');

router.get('/listarTodo', grupoTipoPosicionController.listarTodo);

module.exports = router;