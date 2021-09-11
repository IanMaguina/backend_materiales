const router = require('express').Router();

const escenarioNivel2Controller = require('../controllers/escenarioNivel2Controller');

// listar por id escenario nivel 1
router.get('/listarPorIdEscenarioNivel1', escenarioNivel2Controller.listarPorIdEscenarioNivel1);

module.exports = router;