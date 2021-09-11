const router = require('express').Router();

const motivoRechazoController = require('../controllers/motivoRechazoController');

router.get('/listarTodo', motivoRechazoController.listarTodo);

module.exports = router;