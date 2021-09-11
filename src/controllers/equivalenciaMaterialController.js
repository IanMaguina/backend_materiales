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
const equivalenciaMaterialService = require('../services/equivalenciaMaterialService');
const EquivalenciaMaterial = require('../domain/equivalenciaMaterial');

const equivalenciaMaterialController = {};

equivalenciaMaterialController.agregarEquivalenciaMaterialxRol = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al subir Anexo de Material."
        }
        winston.info("req.body: "+JSON.stringify(req.body));
        winston.info("req.files: ", JSON.stringify(req.files));
        let { id_material_solicitud, valor1, unidad_medida1, valor2, unidad_medida2, id_rol } = req.body;

        if(!utility.isNumericValue(req.body.id_material_solicitud) || req.body.id_material_solicitud < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_material_solicitud no tiene un valor válido. Tipo de dato: '"+(typeof req.body.id_material_solicitud)+"', valor = "+req.body.id_material_solicitud;
            //winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if (!utility.isNumericValue(valor1) || parseInt(valor1) < 1) {
            response.resultado = 0;
            response.mensaje = "El campo valor1 no tiene un valor válido. Tipo de dato: '" + (typeof valor1) + "', valor = " + valor1;
            winston.info("response: " + JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        if (!utility.isNumericValue(valor2) || parseInt(valor2) < 1) {
            response.resultado = 0;
            response.mensaje = "El campo valor2 no tiene un valor válido. Tipo de dato: '" + (typeof valor2) + "', valor = " + valor2;
            winston.info("response: " + JSON.stringify(response));
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


        const equivalenciaMaterialObj = new EquivalenciaMaterial();
        equivalenciaMaterialObj.id_material_solicitud = id_material_solicitud;
        equivalenciaMaterialObj.valor1 = valor1;
        equivalenciaMaterialObj.unidad_medida1 = unidad_medida1;
        equivalenciaMaterialObj.valor2 = valor2;
        equivalenciaMaterialObj.unidad_medida2 = unidad_medida2;
        equivalenciaMaterialObj.id_rol = id_rol;
        const crearEquivalencia = await equivalenciaMaterialService.agregarEquivalenciaMaterialxRol(postgresConn, equivalenciaMaterialObj);
        winston.info("crearEquivalencia: "+JSON.stringify(crearEquivalencia));
        if(crearEquivalencia && crearEquivalencia[0].id){
            response.resultado = 1;
            response.mensaje = "";
            response.id = crearEquivalencia[0].id;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en equivalencia MaterialController Agregar,", error);
        res.status(500).send(error);
    }
}

equivalenciaMaterialController.obtenerAllEquivalenciaMaterial  = async (req, res) => {
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

        const buscarRes = await equivalenciaMaterialService.buscarPorIdMaterialSolicitud(postgresConn, id_material_solicitud);
        winston.info("buscarRes: "+JSON.stringify(buscarRes));
        if(buscarRes.length < 1){
            response.resultado = 0;
            response.mensaje = "No hay archivo adjunto a la Solicitud";
            winston.info("response: "+JSON.stringify(response));
            res.status(200).json(response);
            return;
        }
        response.resultado = 1;
        response.mensaje = "";
        response.lista = buscarRes;
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en anexoMaterialController.obtenerUrl2,", error);
        res.status(500).send(error);
    }
}

equivalenciaMaterialController.borrarxIdEquivalenciaMaterial = async (req, res) => {
    const response = {
        resultado: 0,
        mensaje: "Error inesperado al borrar Equivalencia de Material."
    }
    try {
        winston.info("req.body: "+JSON.stringify(req.body));
        let { id_equivalencia_material } = req.body;
        if(!id_equivalencia_material || isNaN(id_equivalencia_material) || id_equivalencia_material < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_equivalencia_material no es válido. Tipo de dato: '"+(typeof id_equivalencia_material)+"', valor = "+id_equivalencia_material;
            res.status(200).json(response);
            return;
        }

        const borrarRes = await equivalenciaMaterialService.borrarPorIdEquivalenciaMaterial(postgresConn, id_equivalencia_material);
        if(!borrarRes){
            response.resultado = 0;
            response.mensaje = "Error, no se pudo borrar el Equivalencia de Material.";
        } else {
            response.resultado = 1;
            response.mensaje = "";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en equivalenciaMaterialController.borrarxIdEquivalenciaMaterial,", error);
        res.status(500).send(error);
    }
}

module.exports = equivalenciaMaterialController;