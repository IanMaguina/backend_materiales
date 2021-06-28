const router = require('express').Router();

const partidaArancelariaController = require('../controllers/partidaArancelariaController');

router.get('/listarTodo', partidaArancelariaController.listarTodo);
router.get('/listarPorCodigo', partidaArancelariaController.listarPorCodigo);

module.exports = router;