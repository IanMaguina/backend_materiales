const router = require('express').Router();

const grupoImputacionMaterialController = require('../controllers/grupoImputacionMaterialController');

router.get('/listarTodo', grupoImputacionMaterialController.listarTodo);

module.exports = router;