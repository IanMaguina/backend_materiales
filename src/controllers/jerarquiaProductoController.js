const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const jerarquiaProductoService = require('../services/jerarquiaProductoService');
const jerarquiaProductoController = {};

jerarquiaProductoController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Jerarquia Producto."
        };

        const listaRes = await jerarquiaProductoService.listarTodo(postgresConn);
        if(listaRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = listaRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en jerarquiaProductoController.listarTodo,",error);
        res.status(500).send(error);
    }
}

module.exports = jerarquiaProductoController;