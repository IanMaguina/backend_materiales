const router = require('express').Router();
const sapJobsController = require('../controllers/sapJobsController');

router.get('/ejecutarSapJobs', sapJobsController.ejecutarSapJobs);

module.exports = router;