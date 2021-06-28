const router = require('express').Router();

const escenarioNivel3Controller = require('../controllers/escenarioNivel3Controller');

// listar por id escenario nivel 2
router.get('/listarPorIdEscenarioNivel2', escenarioNivel3Controller.listarPorIdEscenarioNivel2);
router.get('/listarTodo', escenarioNivel3Controller.listarTodo);
router.post('/buscarPorUsuarioRolYTipoSolicitud', escenarioNivel3Controller.buscarPorUsuarioRolYTipoSolicitud);
router.get('/listarPorIdEscenarioNivel3', escenarioNivel3Controller.listarPorIdEscenarioNivel3);
router.get('/listarPorFiltros', escenarioNivel3Controller.listarPorFiltros);
router.get('/listarPorIdSociedad', escenarioNivel3Controller.listarPorIdSociedad);

module.exports = router;