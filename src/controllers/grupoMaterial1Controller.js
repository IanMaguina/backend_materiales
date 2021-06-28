const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const grupoMaterial1Service = require('../services/grupoMaterial1Service');
const grupoMaterial1Controller = {};

grupoMaterial1Controller.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Grupo Material 1."
        };

        const listaRes = await grupoMaterial1Service.listarTodo(postgresConn);
        if(listaRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = listaRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en grupoMaterial1Controller.listarTodo,",error);
        res.status(500).send(error);
    }
}

module.exports = grupoMaterial1Controller;