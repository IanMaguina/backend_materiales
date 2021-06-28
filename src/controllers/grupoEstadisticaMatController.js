const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const grupoEstadisticaMatService =  require('../services/grupoEstadisticaMatService');
const grupoEstadisticaMatController = {};

grupoEstadisticaMatController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Grupo Estadistica Mat."
        };

        const listaRes = await grupoEstadisticaMatService.listarTodo(postgresConn);
        if(listaRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = listaRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en grupoEstadisticaMatController.listarTodo,",error);
        res.status(500).send(error);
    }
}

module.exports = grupoEstadisticaMatController;