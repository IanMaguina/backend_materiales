const router = require('express').Router();

const tipoSolicitudController = require('../controllers/tipoSolicitudController');

// listar todo
router.get('/listarTodo', tipoSolicitudController.listarTodo);

module.exports = router;