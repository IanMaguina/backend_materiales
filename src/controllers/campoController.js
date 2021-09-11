const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const campoService = require('../services/campoService');
const Campo = require('../domain/campo');
const { round } = require('js-big-decimal');
const campoController = {};

campoController.listar = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Campos."
        };

        let { id_escenario_nivel3, id_rol, id_tipo_solicitud } = req.query;

        winston.info("id_escenario_nivel3: " + id_escenario_nivel3);
        winston.info("id_rol: " + id_rol);
        winston.info("id_tipo_solicitud: " + id_tipo_solicitud);

        const campoServiceRes = await campoService.listar(postgresConn, id_escenario_nivel3, id_rol, id_tipo_solicitud);

        if (campoServiceRes) {
            response.resultado = 1;
            response.mensaje = "";

            const campos = [];

            campoServiceRes.forEach(element => {

                campos.push(new Campo({
                    id: element.id_campo_vista,
                    nombre: element.nombre_campo,
                    regla_campo: element.regla_campo,
                    orden: element.orden_campo,
                    tipo_objeto: element.tipo_objeto,
                    valor_defecto: element.valor_defecto,
                    tabla_maestra: element.tabla_maestra,
                    tipo_dato: element.tipo_dato,
                    longitud: Number(element.longitud),
                    longitud_decimal: element.longitud_decimal,
                    etiqueta: element.etiqueta,
                    codigo_interno: element.codigo_interno
                }));
            });

            response.lista = campos;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en campoController.listarTodo,", error);
        res.status(500).send(error);
    }
};

campoController.listarDiccionarioDeNombres = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Campos."
        };

        let { id_escenario_nivel3, id_rol, id_tipo_solicitud } = req.query;

        const campoServiceRes = await campoService.listarDiccionarioDeNombres(postgresConn, id_escenario_nivel3, id_rol, id_tipo_solicitud);

        if (campoServiceRes) {
            response.resultado = 1;
            response.mensaje = "";

            var dictionary = {};

            campoServiceRes.forEach(element => {
                dictionary[element.nombre] = "";
            });

            response.lista = dictionary;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en campoController.listarDiccionarioDeNombres,", error);
        res.status(500).send(error);
    }
};

campoController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Campos."
        };

        const campoServiceRes = await campoService.listarTodo(postgresConn);

        if (campoServiceRes) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = campoServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en campoController.listarTodo,", error);
        res.status(500).send(error);
    }
};

campoController.listarCampoReglasxEscenario3 = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Campos."
        };

        let { id_escenario_nivel3, id_rol, id_tipo_solicitud } = req.query;

        winston.info("id_escenario_nivel3: " + id_escenario_nivel3);
        winston.info("id_rol: " + id_rol);
        winston.info("id_tipo_solicitud: " + id_tipo_solicitud);

        const campoServiceRes = await campoService.listarCampoReglasxEscenario3(postgresConn, id_escenario_nivel3, id_rol, id_tipo_solicitud);

        if (campoServiceRes) {
            response.resultado = 1;
            response.mensaje = "";

            const campos = [];

            campoServiceRes.forEach(element => {

                campos.push(new Campo({
                    id: element.id_campo_vista,
                    nombre: element.nombre_campo,
                    regla_campo: element.regla_campo,
                    orden: element.orden_campo,
                    tipo_objeto: element.tipo_objeto,
                    valor_defecto: element.valor_defecto,
                    tabla_maestra: element.tabla_maestra,
                    tipo_dato: element.tipo_dato,
                    longitud: Number(element.longitud),
                    longitud_decimal: element.longitud_decimal,
                    etiqueta: element.etiqueta,
                    codigo_interno: element.codigo_interno
                }));
            });

            response.lista = campos;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en campoController.listarTodo,", error);
        res.status(500).send(error);
    }
};
module.exports = campoController;