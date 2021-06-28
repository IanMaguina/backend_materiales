const router = require('express').Router();

const rolController = require('../controllers/rolController');

router.get('/listarRolesAnteriores', rolController.listarRolesAnteriores);

module.exports = router;