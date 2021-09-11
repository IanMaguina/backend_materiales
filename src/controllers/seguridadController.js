const winston = require('../utils/winston');
const constantes = require('../utils/constantes');
const postgresConn = require('../connections/postgres');
const seguridadService = require('../services/seguridadService');
const verifyIdToken = require('../providers/googleProvider');

const controller = {};

controller.validarToken = async (req, res) => {

    const response = {
        resultado: 0, mensaje: "Error inesperado al validar token."
    };

    try {
        const { token } = req.query;

        //#region Validaciones al request
        if (!token || token == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo token no tiene un valor válido. Tipo de dato : '" + (typeof token) + "', valor = " + token;
            res.status(400).json(response);
            return;
        }
        //#endregion

        const tokenInfo = await verifyIdToken(token).catch(console.error);

        if (tokenInfo) {
            response.resultado = 1;
            response.mensaje = "valid_token";
            response.tokenInfo = tokenInfo;
        }
        else {
            response.resultado = 0;
            response.mensaje = "invalid_token";
        }

        res.status(200).json(response);

    } catch (error) {
        winston.info("Error en securityController.listarTodo,", error);
        res.status(500).send(error);
    }
};

module.exports = controller;