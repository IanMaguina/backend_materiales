const router = require('express').Router();

const idiomaController = require('../controllers/idiomaController');

router.get('/listarTodo', idiomaController.listarTodo);

module.exports = router;