const router = require('express').Router();

const rolController = require('../controllers/rolController');

router.get('/listarRolesAnteriores', rolController.listarRolesAnteriores);
router.get('/listarTodo', rolController.listarTodo);
module.exports = router;