const router = require('express').Router();

const estadoSolicitudController = require('../controllers/estadoSolicitudController');

router.get('/listar', estadoSolicitudController.listarTodo);

module.exports = router;