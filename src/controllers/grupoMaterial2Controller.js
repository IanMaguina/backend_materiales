const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const grupoMaterial2Service = require('../services/grupoMaterial2Service');
const grupoMaterial2Controller = {};

grupoMaterial2Controller.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Grupo Material 2."
        };

        const listaRes = await grupoMaterial2Service.listarTodo(postgresConn);
        if(listaRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = listaRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en grupoMaterial2Controller.listarTodo,",error);
        res.status(500).send(error);
    }
}

module.exports = grupoMaterial2Controller;