const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const grupoImputacionMaterialService = require('../services/grupoImputacionMaterialService');
const grupoImputacionMaterialController = {};

grupoImputacionMaterialController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Grupo Imputacion Material."
        };

        const listaRes = await grupoImputacionMaterialService.listarTodo(postgresConn);
        if(listaRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = listaRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en grupoImputacionMaterialController.listarTodo,",error);
        res.status(500).send(error);
    }
}

module.exports = grupoImputacionMaterialController;