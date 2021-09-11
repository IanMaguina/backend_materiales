const router = require('express').Router();

const grupoMaterial2Controller = require('../controllers/grupoMaterial2Controller');

router.get('/listarTodo', grupoMaterial2Controller.listarTodo);

module.exports = router;