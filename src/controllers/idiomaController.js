const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const idiomaService =  require('../services/idiomaService');
const idiomaController = {};

idiomaController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Idioma."
        };

        const listaRes = await idiomaService.listarTodo(postgresConn);
        if(listaRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = listaRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en idiomaController.listarTodo,",error);
        res.status(500).send(error);
    }
}

module.exports = idiomaController;