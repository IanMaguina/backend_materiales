const router = require('express').Router();
const config = require('../config');
const multer = require('multer');
const path = require('path');
const URLSafeBase64 = require('urlsafe-base64');
const crypto = require('crypto');
const archivoController = require('../controllers/archivoController');

const storage = multer.diskStorage({
    destination: config.uploads.ruta,
    filename: (req, file, cb) =>  {
        //const fecha = new Date();
        //const fechaStr = "" + fecha.getFullYear() + fecha.getMonth() + fecha.getDate() + fecha.getHours() + fecha.getMinutes() + fecha.getSeconds() + fecha.getMilliseconds() + "_";
        
        cb(null, new Date().getTime() + "_" + URLSafeBase64.encode(crypto.randomBytes(16)) + path.extname(file.originalname));
    }
});

const uploadFile = multer({
    storage: storage
}).single('archivo');

router.post('/agregar', uploadFile, archivoController.agregar);

module.exports = router;