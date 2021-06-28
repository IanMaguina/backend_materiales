const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const path = require('path');
const fetch = require('node-fetch');
//const { FormData } = require('formdata-node');
const FormData = require('form-data');
const fs = require('fs');
const fse = require('fs-extra');
const gcStorage = require('../utils/gcp/storage');
const config = require('../config');
const utility = require('../utils/utility');
const gcpFileUpload = require('../utils/gcp/fileUpload');
const anexoSolicitudService = require('../services/anexoSolicitudService');
const AnexoSolicitud = require('../domain/anexoSolicitud');

const anexoSolicitudController = {};

anexoSolicitudController.subir = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al subir Anexo de Solicitud."
        }
        winston.info("req.body: "+JSON.stringify(req.body));
        winston.info("req.files: ", JSON.stringify(req.files));

        if(!utility.isNumericValue(req.body.id_solicitud) || parseInt(req.body.id_solicitud) < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no tiene un valor válido. Tipo de dato: '"+(typeof req.body.id_solicitud)+"', valor = "+req.body.id_solicitud;
            //winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }

        /*
        const form = new FormData();
        form.set("ruta", config.gcpCloudStorage.subirArchivo.params.ruta);
        form.set("bucket", config.gcpCloudStorage.subirArchivo.params.bucket);
        //form.set("file", createReadStream(req.files.archivo[0].path), req.files.archivo[0].filename, { type: "application/octet-stream" });
        //form.set("file", createReadStream(req.files.archivo[0].path));
        winston.info("req.files.archivo[0].path: "+req.files.archivo[0].path);
        winston.info("req.files.archivo[0].filename: "+req.files.archivo[0].filename);
        form.set("file", createReadStream(req.files.archivo[0].path), req.files.archivo[0].filename);
        form.set("proyecto", config.gcpCloudStorage.subirArchivo.params.proyecto);

        const subirArchivoRes = await fetch(config.gcpCloudStorage.subirArchivo.url, {
            method: 'POST',
            headers: {
                'Authorization': config.gcpCloudStorage.subirArchivo.token
            },
            body: form
        });
        //const data = await subirArchivoRes.json();
        //winston.info("subirArchivoRes:"+ JSON.stringify(subirArchivoRes));
        console.log(subirArchivoRes);
        */

        const form = new FormData();
        form.append('ruta', config.gcpCloudStorage.subirArchivo.params.ruta);
        form.append('bucket', config.gcpCloudStorage.subirArchivo.params.bucket);
        
        form.append('file', fs.readFileSync(req.files.archivo[0].path), {
            contentType: 'application/octet-stream',
            name: 'file',
            filename: req.files.archivo[0].filename,
          });
        form.append('proyecto', config.gcpCloudStorage.subirArchivo.params.proyecto);

        let options = {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        }

        options.headers.Authorization = config.gcpCloudStorage.subirArchivo.token;
        console.log("options:", options);
        const subirArchivoRes = await fetch(config.gcpCloudStorage.subirArchivo.url, options);

        console.log("subirArchivoRes:", subirArchivoRes);
        const data = await subirArchivoRes.json();
        console.log("data:", data);
        winston.info("data: "+JSON.stringify(data));

        if(data.codigo !== 1) {
            response.resultado = 0;
            response.mensaje = data.mensaje;
            res.status(200).json(response);
            return;
        }

        const anexoSolicitudObj = new AnexoSolicitud();
        anexoSolicitudObj.id_solicitud = req.body.id_solicitud;
        anexoSolicitudObj.ruta_anexo = data.resultado.url;
        anexoSolicitudObj.nombre = req.files.archivo[0].filename;
        const crearAnexoRes = await anexoSolicitudService.crear(postgresConn, anexoSolicitudObj);
        winston.info("crearAnexoRes: "+JSON.stringify(crearAnexoRes));
        if(crearAnexoRes && crearAnexoRes[0].id){
            response.resultado = 1;
            response.mensaje = "";
            response.id = crearAnexoRes[0].id;
        }

        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en anexoSolicitudController.subir,", error);
        res.status(500).send(error);
    }
}

anexoSolicitudController.obtenerUrl  = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener url de Anexo de Solicitud."
        }
        winston.info("req.body: "+JSON.stringify(req.body));
        let { id_solicitud } = req.body;
        if(!id_solicitud || isNaN(id_solicitud) || id_solicitud < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no es válido. Tipo de dato: '"+(typeof id_solicitud)+"', valor = "+id_solicitud;
            return res.status(200).json(response);
        }

        const buscarRes = await anexoSolicitudService.buscarPorIdSolicitud(postgresConn, id_solicitud);
        winston.info("buscarRes: "+JSON.stringify(buscarRes));
        if(buscarRes.length < 1){
            response.resultado = 0;
            response.mensaje = "No hay archivo adjunto a la Solicitud";
            winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }

        winston.info("filename: "+config.gcpCloudStorage.generarUrl.params.filename + buscarRes[0].nombre);

        let options = {
            method: 'POST',
            headers: {
                'Authorization': config.gcpCloudStorage.generarUrl.token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: config.gcpCloudStorage.generarUrl.params.filename + buscarRes[0].nombre,
                bucket: config.gcpCloudStorage.generarUrl.params.bucket,
                proyecto: config.gcpCloudStorage.generarUrl.params.proyecto
            })
        }

        const generarUrlRes = await fetch(config.gcpCloudStorage.generarUrl.url, options);
        const data = await generarUrlRes.json();
        winston.info("data: "+JSON.stringify(data));
        if(data.codigo !== 1){
            response.resultado = 0;
            response.mensaje = data.mensaje;
            res.status(200).json(response);
            return;
        }

        // si todo saliio bien
        response.resultado = 1;
        response.mensaje = "";
        response.url = data.resultado.url;
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en anexoSolicitudController.obtenerUrl,", error);
        res.status(500).send(error);
    }
}

anexoSolicitudController.subir2 = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al subir Anexo de Solicitud."
        }

        winston.info("req.body: "+JSON.stringify(req.body));
        winston.info("req.files: ", JSON.stringify(req.files));

        if(!utility.isNumericValue(req.body.id_solicitud) || parseInt(req.body.id_solicitud) < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no tiene un valor válido. Tipo de dato: '"+(typeof req.body.id_solicitud)+"', valor = "+req.body.id_solicitud;
            //winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }

        const buffer = fs.readFileSync(req.files.archivo[0].path);

        const myFile = {
            originalname: req.files.archivo[0].filename,
            buffer: buffer
        }

        const remoteUrl = await gcpFileUpload(myFile);
        winston.info("remoteUrl:", remoteUrl);
        if(!remoteUrl){
            response.resultado = 0;
            response.mensaje = "Error, remoteUrl no tiene un valor válido. valor = " + remoteUrl;
            //winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }

        const anexoSolicitudObj = new AnexoSolicitud();
        anexoSolicitudObj.id_solicitud = req.body.id_solicitud;
        anexoSolicitudObj.ruta_anexo = remoteUrl;
        anexoSolicitudObj.nombre = req.files.archivo[0].filename;
        const crearAnexoRes = await anexoSolicitudService.crear(postgresConn, anexoSolicitudObj);
        winston.info("crearAnexoRes: "+JSON.stringify(crearAnexoRes));
        if(crearAnexoRes && crearAnexoRes[0].id){
            response.resultado = 1;
            response.mensaje = "";
            response.id = crearAnexoRes[0].id;
        }
        await fse.unlink(req.files.archivo[0].path);
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en anexoSolicitudController.subir2,", error);
        res.status(500).send(error);
    }
}

anexoSolicitudController.obtenerUrl2  = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener url de Anexo de Solicitud."
        }
        winston.info("req.body: "+JSON.stringify(req.body));
        let { id_solicitud } = req.body;
        if(!id_solicitud || isNaN(id_solicitud) || id_solicitud < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no es válido. Tipo de dato: '"+(typeof id_solicitud)+"', valor = "+id_solicitud;
            return res.status(200).json(response);
        }

        const buscarRes = await anexoSolicitudService.buscarPorIdSolicitud(postgresConn, id_solicitud);
        winston.info("buscarRes: "+JSON.stringify(buscarRes));
        if(buscarRes.length < 1){
            response.resultado = 0;
            response.mensaje = "No hay archivo adjunto a la Solicitud";
            winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }

        // These options will allow temporary read access to the file
        const options = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + 7200000, // 2 horas
        };

        // Get a v4 signed URL for reading the file
        const [gcsUrl] = await gcStorage
            .bucket(config.gcpCloudStorage.bucket)
            .file(buscarRes[0].nombre)
            .getSignedUrl(options);
        winston.info("gcsUrl: "+gcsUrl);
        if(!gcsUrl){
            response.resultado = 0;
            response.mensaje = "No se genero url para el archivo: " + buscarRes[0].nombre;
            winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }

        response.resultado = 1;
        response.mensaje = "";
        response.url = gcsUrl;
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en anexoSolicitudController.obtenerUrl2,", error);
        res.status(500).send(error);
    }
}

anexoSolicitudController.borrar = async (req, res) => {
    const response = {
        resultado: 0,
        mensaje: "Error inesperado al borrar Anexo de Solicitud."
    }
    try {
        winston.info("req.body: "+JSON.stringify(req.body));
        let { id_solicitud } = req.body;
        if(!id_solicitud || isNaN(id_solicitud) || id_solicitud < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no es válido. Tipo de dato: '"+(typeof id_solicitud)+"', valor = "+id_solicitud;
            res.status(200).json(response);
            return;
        }

        const borrarRes = await anexoSolicitudService.borrarPorIdSolicitud(postgresConn, id_solicitud);
        if(!borrarRes){
            response.resultado = 0;
            response.mensaje = "Error, no se pudo borrar el Anexo de Solicitud.";
        } else {
            response.resultado = 1;
            response.mensaje = "";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en anexoSolicitudController.borrar,", error);
        res.status(500).send(error);
    }
}

anexoSolicitudController.subirAnexoSolicitudxRol = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al subir Anexo de Solicitud."
        }

        winston.info("req.body: "+JSON.stringify(req.body));
        winston.info("req.files: ", JSON.stringify(req.files));
        let { id_material_solicitud, id_rol ,etiqueta} = req.body;

        if(!utility.isNumericValue(req.body.id_solicitud) || parseInt(req.body.id_solicitud) < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no tiene un valor válido. Tipo de dato: '"+(typeof req.body.id_solicitud)+"', valor = "+req.body.id_solicitud;
            //winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if (!utility.isNumericValue(id_rol) || parseInt(id_rol) < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_rol no tiene un valor válido. Tipo de dato: '" + (typeof id_rol) + "', valor = " + id_rol;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }

        const buffer = fs.readFileSync(req.files.archivo[0].path);

        const myFile = {
            originalname: req.files.archivo[0].filename,
            buffer: buffer
        }

        const remoteUrl = await gcpFileUpload(myFile);
        winston.info("remoteUrl:", remoteUrl);
        if(!remoteUrl){
            response.resultado = 0;
            response.mensaje = "Error, remoteUrl no tiene un valor válido. valor = " + remoteUrl;
            //winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }

        const anexoSolicitudObj = new AnexoSolicitud();
        anexoSolicitudObj.id_solicitud = req.body.id_solicitud;
        anexoSolicitudObj.ruta_anexo = remoteUrl;
        anexoSolicitudObj.id_rol = id_rol;
        anexoSolicitudObj.nombre = req.files.archivo[0].filename;
        anexoSolicitudObj.etiqueta = (etiqueta?etiqueta:req.files.archivo[0].filename);
        const crearAnexoRes = await anexoSolicitudService.crearxRol(postgresConn, anexoSolicitudObj);
        winston.info("crearAnexoRes: "+JSON.stringify(crearAnexoRes));
        if(crearAnexoRes && crearAnexoRes[0].id){
            response.resultado = 1;
            response.mensaje = "";
            response.id = crearAnexoRes[0].id;
        }
        await fse.unlink(req.files.archivo[0].path);
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en anexoSolicitudController.subir2,", error);
        res.status(500).send(error);
    }
}

anexoSolicitudController.obtenerAllUrlAnexoSolicitud  = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener url de Anexo de Solicitud."
        }
        winston.info("req.body: "+JSON.stringify(req.body));
        let { id_solicitud } = req.body;
        if(!id_solicitud || isNaN(id_solicitud) || id_solicitud < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no es válido. Tipo de dato: '"+(typeof id_solicitud)+"', valor = "+id_solicitud;
            return res.status(200).json(response);
        }

        const buscarRes = await anexoSolicitudService.buscarPorIdSolicitud(postgresConn, id_solicitud);
        winston.info("buscarRes: "+JSON.stringify(buscarRes));
        if(buscarRes.length < 1){
            response.resultado = 0;
            response.mensaje = "No hay archivo adjunto a la Solicitud";
            winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }

        // These options will allow temporary read access to the file
        const options = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + 7200000, // 2 horas
        };
        let anexos=[];
        if (buscarRes.length>0){
            for (let x=0;x<buscarRes.length;x++){
                let anexoSolicitudObj = new AnexoSolicitud();
                let gcsUrl = await gcStorage
                .bucket(config.gcpCloudStorage.bucket)
                .file(buscarRes[x].nombre)
                .getSignedUrl(options);
            
                anexoSolicitudObj.id=buscarRes[x].id;
                anexoSolicitudObj.id_solicitud=buscarRes[x].id_solicitud;
                anexoSolicitudObj.nombre=buscarRes[x].nombre;
                anexoSolicitudObj.ruta_anexo=buscarRes[x].ruta_anexo;
                anexoSolicitudObj.id_rol=buscarRes[x].id_rol;
                anexoSolicitudObj.etiqueta=buscarRes[x].etiqueta;
                anexoSolicitudObj.url=gcsUrl;
                anexoSolicitudObj.rol={id:buscarRes[x].id_rol, nombre:buscarRes[x].nombre_rol}
                anexos.push(anexoSolicitudObj);

            }
        }

/*         if(!gcsUrl){
            response.resultado = 0;
            response.mensaje = "No se genero url para el archivo: " + buscarRes[0].nombre;
            winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        } */

        response.resultado = 1;
        response.mensaje = "";
        response.lista = anexos;
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en anexoSolicitudController.obtenerUrl2,", error);
        res.status(500).send(error);
    }
}

anexoSolicitudController.borrarAnexoxIdAnexoSolicitud = async (req, res) => {
    const response = {
        resultado: 0,
        mensaje: "Error inesperado al borrar Anexo de Solicitud."
    }
    try {
        winston.info("req.body: "+JSON.stringify(req.body));
        let { id_anexo_solicitud } = req.body;
        if(!id_anexo_solicitud || isNaN(id_anexo_solicitud) || id_anexo_solicitud < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_anexo_solicitud no es válido. Tipo de dato: '"+(typeof id_anexo_solicitud)+"', valor = "+id_anexo_solicitud;
            res.status(200).json(response);
            return;
        }

        const borrarRes = await anexoSolicitudService.borrarPorIdAnexoSolicitud(postgresConn, id_anexo_solicitud);
        if(!borrarRes){
            response.resultado = 0;
            response.mensaje = "Error, no se pudo borrar el Anexo de Solicitud.";
        } else {
            response.resultado = 1;
            response.mensaje = "";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en anexoSolicitudController.borrar,", error);
        res.status(500).send(error);
    }
}

module.exports = anexoSolicitudController;