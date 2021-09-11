const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const partidaArancelariaService = require('../services/partidaArancelariaService');
const partidaArancelariaController = {};

partidaArancelariaController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Partida Arancelaria."
        };

        const listaRes = await partidaArancelariaService.listarTodo(postgresConn);
        if(listaRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = listaRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en partidaArancelariaController.listarTodo,",error);
        res.status(500).send(error);
    }
};

partidaArancelariaController.listarPorCodigo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Partida Arancelaria."
        };

        const { codigo } = req.query;
        const listaRes = await partidaArancelariaService.listarPorCodigo(postgresConn, codigo);
        if(listaRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = listaRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en partidaArancelariaController.listarPorCodigo,",error);
        res.status(500).send(error);
    }
}

module.exports = partidaArancelariaController;