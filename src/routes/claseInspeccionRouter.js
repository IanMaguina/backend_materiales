const router = require('express').Router();

const claseInspeccionController = require('../controllers/claseInspeccionController');

router.get('/listarTodo', claseInspeccionController.listarTodo);

module.exports = router;