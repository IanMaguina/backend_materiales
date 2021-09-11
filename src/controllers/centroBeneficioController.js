const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const constantes = require('../utils/constantes');
const centroBeneficioService = require('../services/centroBeneficioService');
const centroBeneficioController = {};

centroBeneficioController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Centros de Beneficio."
        };

        const centroBeneficioServiceRes = await centroBeneficioService.listarTodo(postgresConn);

        if (centroBeneficioServiceRes) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = centroBeneficioServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en centroBeneficioController.listar,", error);
        res.status(500).send(error);
    }
};

centroBeneficioController.listarPorSociedad = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Centros de Beneficio."
        };
        let { codigo_sociedad } = req.query;
        winston.info("codigo_sociedad: " + codigo_sociedad);

        if (!codigo_sociedad || codigo_sociedad == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo codigo_sociedad no tiene un valor válido. Tipo de dato : '" + (typeof codigo_sociedad) + "', valor = " + codigo_sociedad;
            res.status(200).json(response);
            return;
        }

        const centroBeneficioServiceRes = await centroBeneficioService.listarPorSociedad(postgresConn, codigo_sociedad);
        if (centroBeneficioServiceRes) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = centroBeneficioServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en centroBeneficioController.listarPorSociedad,", error);
        res.status(500).send(error);
    }
};

module.exports = centroBeneficioController;