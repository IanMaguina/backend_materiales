const router = require('express').Router();

const almacenController = require('../controllers/almacenController');

router.get('/listar', almacenController.listar);

module.exports = router;