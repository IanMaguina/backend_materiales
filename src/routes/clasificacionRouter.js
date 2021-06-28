const router = require('express').Router();

const clasificacionController = require('../controllers/clasificacionController');

router.get('/listarTodo', clasificacionController.listarTodo);

module.exports = router;