const router = require('express').Router();

const ramoController = require('../controllers/ramoController');

router.get('/listarTodo', ramoController.listarTodo);

module.exports = router;