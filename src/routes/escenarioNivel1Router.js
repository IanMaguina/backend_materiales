const router = require('express').Router();

const escenarioNivel1Controller = require('../controllers/escenarioNivel1Controller');

// listar por id Sociedad
router.get('/listarPorIdSociedad', escenarioNivel1Controller.listarPorIdSociedad)

module.exports = router;