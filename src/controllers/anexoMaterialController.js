const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const fse = require('fs-extra');
const gcStorage = require('../utils/gcp/storage');
const config = require('../config');
const utility = require('../utils/utility');
const gcpFileUpload = require('../utils/gcp/fileUpload');
const anexoMaterialService = require('../services/anexoMaterialService');
const AnexoMaterial = require('../domain/anexoMaterial');

const anexoMaterialController = {};

anexoMaterialController.subir = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al subir Anexo de Material."
        }
        winston.info("req.body: "+JSON.stringify(req.body));
        winston.info("req.files: ", JSON.stringify(req.files));

        if(!utility.isNumericValue(req.body.id_material_solicitud) || req.body.id_material_solicitud < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_material_solicitud no tiene un valor válido. Tipo de dato: '"+(typeof req.body.id_material_solicitud)+"', valor = "+req.body.id_material_solicitud;
            //winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }

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
        winston.info("options:", options);
        const subirArchivoRes = await fetch(config.gcpCloudStorage.subirArchivo.url, options);
        winston.info("subirArchivoRes:", subirArchivoRes);
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

        const anexoMaterialObj = new AnexoMaterial();
        anexoMaterialObj.id_material_solicitud = req.body.id_material_solicitud;
        anexoMaterialObj.ruta_anexo = data.resultado.url;
        anexoMaterialObj.nombre = req.files.archivo[0].filename;
        const crearAnexoRes = await anexoMaterialService.crear(postgresConn, anexoMaterialObj);
        winston.info("crearAnexoRes: "+JSON.stringify(crearAnexoRes));
        if(crearAnexoRes && crearAnexoRes[0].id){
            response.resultado = 1;
            response.mensaje = "";
            response.id = crearAnexoRes[0].id;
        }

        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en anexoMaterialController.subir,", error);
        res.status(500).send(error);
    }
}

anexoMaterialController.subir2 = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al subir Anexo de Material."
        }
        winston.info("req.body: "+JSON.stringify(req.body));
        winston.info("req.files: ", JSON.stringify(req.files));

        if(!utility.isNumericValue(req.body.id_material_solicitud) || req.body.id_material_solicitud < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_material_solicitud no tiene un valor válido. Tipo de dato: '"+(typeof req.body.id_material_solicitud)+"', valor = "+req.body.id_material_solicitud;
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

        const anexoMaterialObj = new AnexoMaterial();
        anexoMaterialObj.id_material_solicitud = req.body.id_material_solicitud;
        anexoMaterialObj.ruta_anexo = remoteUrl;
        anexoMaterialObj.nombre = req.files.archivo[0].filename;
        const crearAnexoRes = await anexoMaterialService.crear(postgresConn, anexoMaterialObj);
        winston.info("crearAnexoRes: "+JSON.stringify(crearAnexoRes));
        if(crearAnexoRes && crearAnexoRes[0].id){
            response.resultado = 1;
            response.mensaje = "";
            response.id = crearAnexoRes[0].id;
        }
        await fse.unlink(req.files.archivo[0].path);
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en anexoMaterialController.subir2,", error);
        res.status(500).send(error);
    }
}

anexoMaterialController.obtenerUrl2  = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener url de Anexo de Material."
        }
        winston.info("req.body: "+JSON.stringify(req.body));
        let { id_material_solicitud } = req.body;
        if(!id_material_solicitud || isNaN(id_material_solicitud) || id_material_solicitud < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_material_solicitud no es válido. Tipo de dato: '"+(typeof id_material_solicitud)+"', valor = "+id_material_solicitud;
            return res.status(200).json(response);
        }

        const buscarRes = await anexoMaterialService.buscarPorIdMaterialSolicitud(postgresConn, id_material_solicitud);
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
        winston.error("Error en anexoMaterialController.obtenerUrl2,", error);
        res.status(500).send(error);
    }
}

anexoMaterialController.borrar = async (req, res) => {
    const response = {
        resultado: 0,
        mensaje: "Error inesperado al borrar Anexo de Material."
    }
    try {
        winston.info("req.body: "+JSON.stringify(req.body));
        let { id_material_solicitud } = req.body;
        if(!id_material_solicitud || isNaN(id_material_solicitud) || id_material_solicitud < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_material_solicitud no es válido. Tipo de dato: '"+(typeof id_material_solicitud)+"', valor = "+id_material_solicitud;
            res.status(200).json(response);
            return;
        }

        const borrarRes = await anexoMaterialService.borrarPorIdMaterialSolicitud(postgresConn, id_material_solicitud);
        if(!borrarRes){
            response.resultado = 0;
            response.mensaje = "Error, no se pudo borrar el Anexo de Material.";
        } else {
            response.resultado = 1;
            response.mensaje = "";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en anexoMaterialController.borrar,", error);
        res.status(500).send(error);
    }
}

anexoMaterialController.subirAnexoMaterialxRol = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al subir Anexo de Material."
        }
        winston.info("req.body: "+JSON.stringify(req.body));
        winston.info("req.files: ", JSON.stringify(req.files));
        let { id_material_solicitud, id_rol,etiqueta } = req.body;

        if(!utility.isNumericValue(req.body.id_material_solicitud) || req.body.id_material_solicitud < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_material_solicitud no tiene un valor válido. Tipo de dato: '"+(typeof req.body.id_material_solicitud)+"', valor = "+req.body.id_material_solicitud;
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

        const anexoMaterialObj = new AnexoMaterial();
        anexoMaterialObj.id_material_solicitud = id_material_solicitud;
        anexoMaterialObj.id_rol = id_rol;
        anexoMaterialObj.ruta_anexo = remoteUrl;
        anexoMaterialObj.nombre = req.files.archivo[0].filename;
        anexoMaterialObj.etiqueta = (etiqueta?etiqueta:req.files.archivo[0].filename);
        const crearAnexoRes = await anexoMaterialService.crearxRol(postgresConn, anexoMaterialObj);
        winston.info("crearAnexoRes: "+JSON.stringify(crearAnexoRes));
        if(crearAnexoRes && crearAnexoRes[0].id){
            response.resultado = 1;
            response.mensaje = "";
            response.id = crearAnexoRes[0].id;
        }
        await fse.unlink(req.files.archivo[0].path);
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en anexoMaterialController.subir2,", error);
        res.status(500).send(error);
    }
}

anexoMaterialController.obtenerAllUrlAnexoMaterial  = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener url de Anexo de Material."
        }
        winston.info("req.body: "+JSON.stringify(req.body));
        let { id_material_solicitud } = req.body;
        if(!id_material_solicitud || isNaN(id_material_solicitud) || id_material_solicitud < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_material_solicitud no es válido. Tipo de dato: '"+(typeof id_material_solicitud)+"', valor = "+id_material_solicitud;
            return res.status(200).json(response);
        }

        const buscarRes = await anexoMaterialService.buscarPorIdMaterialSolicitud(postgresConn, id_material_solicitud);
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
                let anexoMaterialObj = new AnexoMaterial();
                let gcsUrl = await gcStorage
                .bucket(config.gcpCloudStorage.bucket)
                .file(buscarRes[x].nombre)
                .getSignedUrl(options);
            
                anexoMaterialObj.id=buscarRes[x].id;
                anexoMaterialObj.id_material_solicitud=buscarRes[x].id_material_solicitud;
                anexoMaterialObj.nombre=buscarRes[x].nombre;
                anexoMaterialObj.ruta_anexo=buscarRes[x].ruta_anexo;
                anexoMaterialObj.id_rol=buscarRes[x].id_rol;
                anexoMaterialObj.etiqueta=buscarRes[x].etiqueta;
                anexoMaterialObj.url=gcsUrl;
                anexoMaterialObj.rol={id:buscarRes[x].id_rol, nombre:buscarRes[x].nombre_rol}
                anexos.push(anexoMaterialObj);

            }
        }
        response.resultado = 1;
        response.mensaje = "";
        response.lista = anexos;
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en anexoMaterialController.obtenerUrl2,", error);
        res.status(500).send(error);
    }
}

anexoMaterialController.borrarxIdMaterialAnexo = async (req, res) => {
    const response = {
        resultado: 0,
        mensaje: "Error inesperado al borrar Anexo de Material."
    }
    try {
        winston.info("req.body: "+JSON.stringify(req.body));
        let { id_anexo_material } = req.body;
        if(!id_anexo_material || isNaN(id_anexo_material) || id_anexo_material < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_anexo_material no es válido. Tipo de dato: '"+(typeof id_anexo_material)+"', valor = "+id_anexo_material;
            res.status(200).json(response);
            return;
        }

        const borrarRes = await anexoMaterialService.borrarPorIdAnexoMaterial(postgresConn, id_anexo_material);
        if(!borrarRes){
            response.resultado = 0;
            response.mensaje = "Error, no se pudo borrar el Anexo de Material.";
        } else {
            response.resultado = 1;
            response.mensaje = "";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en anexoMaterialController.borrar,", error);
        res.status(500).send(error);
    }
}

module.exports = anexoMaterialController;