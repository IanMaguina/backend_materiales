const router = require('express').Router();

const canalDistribucionController = require('../controllers/canalDistribucionController');

router.get('/listarTodo', canalDistribucionController.listarTodo);

module.exports = router;