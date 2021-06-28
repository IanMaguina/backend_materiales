const winston = require('../utils/winston');
const path = require('path');
const multer = require('multer');
//const crypto = require('crypto');
//const dateFormat = require('dateformat');
const archivoController = {};

archivoController.agregar = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al agregar archivo."
        }
        winston.info("req.file:", req.file);
        //winston.info("nombre archivo: "+path.basename(req.file.path));
        if(req.file.path){
            response.resultado = 1;
            response.mensaje = "";
            response.ruta_documento = path.basename(req.file.path);
        }

        //winston.info("req: "+JSON.stringify(req));
        //console.log("req.file: ", req.file);
        res.status(200).json(response)
        
    } catch (error) {
        winston.info("Error en archivoController.agregar,", error);
        res.status(500).send(error);
    }
}

module.exports = archivoController;