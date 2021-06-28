const router = require('express').Router();

const grupoMaterial1Controller = require('../controllers/grupoMaterial1Controller');

router.get('/listarTodo', grupoMaterial1Controller.listarTodo);

module.exports = router;