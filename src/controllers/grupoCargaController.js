const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const grupoCargaService = require('../services/grupoCargaService');
const grupoCargaController = {};

grupoCargaController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Grupo Carga."
        };

        const listaRes = await grupoCargaService.listarTodo(postgresConn);
        if(listaRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = listaRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en grupoCargaController.listarTodo,",error);
        res.status(500).send(error);
    }
}

module.exports = grupoCargaController;