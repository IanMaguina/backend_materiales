const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const constantes = require('../utils/constantes');
const categoriaValoracionService = require('../services/categoriaValoracionService');
const categoriaValoracionController = {};

categoriaValoracionController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Categoria Valoracion."
        };

        const listaRes = await categoriaValoracionService.listarTodo(postgresConn);
        if(listaRes){
            response.resultado = 1;
            response.mensaje = "";        
            response.lista = listaRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en categoriaValoracionController.listarTodo,",error);
        res.status(500).send(error);
    }
}

categoriaValoracionController.listarPorTipoMaterial = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Categoria Valoracion."
        };
        let { tipo_material } = req.query;
        winston.info("tipo_material: " + tipo_material);

        if (!tipo_material || tipo_material == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo tipo_material no tiene un valor válido. Tipo de dato : '" + (typeof tipo_material) + "', valor = " + tipo_material;
            res.status(200).json(response);
            return;
        }

        const listaRes = await categoriaValoracionService.listarPorTipoMaterial(postgresConn, tipo_material);
        if (listaRes) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = listaRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en categoriaValoracionController.listarPorTipoMaterial,", error);
        res.status(500).send(error);
    }
};

module.exports = categoriaValoracionController;