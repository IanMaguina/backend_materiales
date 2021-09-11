const router = require('express').Router();

const vistaPortalController = require('../controllers/vistaPortalController');

router.get('/listar', vistaPortalController.listar);

module.exports = router;