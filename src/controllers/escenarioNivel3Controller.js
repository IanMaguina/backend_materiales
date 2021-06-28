const postgresConn = require('../connections/postgres');
const constantes = require('../utils/constantes');
const winston = require('../utils/winston');
const { StaticPool } = require("node-worker-threads-pool");
const path = require('path');
const emailValidatorFilePath = path.join(__dirname, '../workers/emailValidator.js');
const usuarioService = require('../services/usuarioService');
const escenarioNivel3Service = require('../services/escenarioNivel3Service');
const pool = new StaticPool({
    size: 4,
    task: emailValidatorFilePath,
    workerData: "workerData!",
});
const controller = {};

controller.listarPorIdEscenarioNivel2 = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Escenarios de Nivel 3."
        };
        let { id_escenario_nivel2 } = req.query;
        winston.info("id_escenario_nivel2: " + id_escenario_nivel2);
        if (!id_escenario_nivel2 || id_escenario_nivel2 == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo id_escenario_nivel2 no tiene un valor válido. Tipo de dato : '" + (typeof id_escenario_nivel2) + "', valor = " + id_escenario_nivel2;
            res.status(200).json(response);
            return;
        }
        const escenarioNivel3ServiceRes = await escenarioNivel3Service.listarPorIdEscenarioNivel2(postgresConn, id_escenario_nivel2);
        if (escenarioNivel3ServiceRes) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = escenarioNivel3ServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en escenarioNivel3Controller.listarPorIdEscenarioNivel2,", error);
        res.status(500).send(error);
    }
};

controller.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Escenarios de Nivel 3."
        };

        const escenarioNivel3ServiceRes = await escenarioNivel3Service.listarTodo(postgresConn);
        if (escenarioNivel3ServiceRes) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = escenarioNivel3ServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en escenarioNivel3Controller.listarTodo,", error);
        res.status(500).send(error);
    }
};

controller.buscarPorUsuarioRolYTipoSolicitud = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al buscar Escenario Nivel 3 de Usuario."
        };
        let { correo, id_rol, id_tipo_solicitud } = req.body;
        winston.info("req.body: " + JSON.stringify(req.body));
        let esEmailValido = await pool.exec(correo);
        winston.info("esEmailValido: " + esEmailValido);
        if (!esEmailValido) {
            response.resultado = 0;
            response.mensaje = "El campo correo no es válido. Tipo de dato: '" + (typeof correo) + "', valor = " + correo;
            res.status(200).json(response)
            return;
        }

        if (!id_rol || isNaN(id_rol) || id_rol < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_rol no es válido. Tipo de dato: '" + (typeof id_rol) + "', valor = " + id_rol;
            res.status(200).json(response);
            return;
        }
        if (!id_tipo_solicitud || isNaN(id_tipo_solicitud) || id_tipo_solicitud < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_tipo_solicitud no es válido. Tipo de dato: '" + (typeof id_tipo_solicitud) + "', valor = " + id_tipo_solicitud;
            res.status(200).json(response);
            return;
        }

        let listaTipoSolictudRes = await usuarioService.listarIdTiposSolicitudDeUsuario(postgresConn, correo);
        let listaTipoSolicitudYRolAgrupadoRes = await usuarioService.listarIdTipoSolicitudYIdRolAgrupadoDeUsuario(postgresConn, correo);

        let listaDatosDeEstrategiaDeUsuarioRes = null;
        let usuario = {};
        if (listaTipoSolictudRes.length > 0) {
            listaDatosDeEstrategiaDeUsuarioRes = await usuarioService.listarDatosEstrategiaDeUsuario(postgresConn, correo);
            /*
            usuario.id = listaDatosDeEstrategiaDeUsuarioRes[0].id;
            usuario.usuario = listaDatosDeEstrategiaDeUsuarioRes[0].usuario;
            usuario.nombre = listaDatosDeEstrategiaDeUsuarioRes[0].nombre;
            usuario.perfil_usuario = {
                id: listaDatosDeEstrategiaDeUsuarioRes[0].id_perfil_usuario,
                nombre: listaDatosDeEstrategiaDeUsuarioRes[0].perfil_usuario_nombre
            }
            usuario.area_usuario = {
                id: listaDatosDeEstrategiaDeUsuarioRes[0].id_area_usuario,
                nombre: listaDatosDeEstrategiaDeUsuarioRes[0].area_usuario_nombre
            }
            */
            usuario.tipo_solicitudes = [];

            for (let i = 0; i < listaTipoSolictudRes.length; i++) {
                for (let j = 0; j < listaDatosDeEstrategiaDeUsuarioRes.length; j++) {
                    if (listaTipoSolictudRes[i].id_tipo_solicitud == listaDatosDeEstrategiaDeUsuarioRes[j].id_tipo_solicitud) {
                        // agregando Tipo Solicitud
                        let tipo_solicitud = {
                            id: listaDatosDeEstrategiaDeUsuarioRes[j].id_tipo_solicitud,
                            nombre: listaDatosDeEstrategiaDeUsuarioRes[j].tipo_solicitud_nombre,
                            roles: []
                        }
                        usuario.tipo_solicitudes.push(tipo_solicitud);
                        break;
                    }
                }
            }

            winston.info("usuario.tipo_solicitudes = " + JSON.stringify(usuario.tipo_solicitudes));
            winston.info("listaTipoSolicitudYRolAgrupadoRes = " + JSON.stringify(listaTipoSolicitudYRolAgrupadoRes));
            for (let i = 0; i < usuario.tipo_solicitudes.length; i++) {
                for (let indice = 0; indice < listaTipoSolicitudYRolAgrupadoRes.length; indice++) {
                    //winston.info("usuario.tipo_solicitudes["+i+"].id = "+usuario.tipo_solicitudes[i].id);
                    //winston.info("listaTipoSolicitudYRolAgrupadoRes["+indice+"].id_tipo_solicitud = "+listaTipoSolicitudYRolAgrupadoRes[indice].id_tipo_solicitud);
                    if (usuario.tipo_solicitudes[i].id == listaTipoSolicitudYRolAgrupadoRes[indice].id_tipo_solicitud) {
                        // agregando Rol
                        for (let k = 0; k < listaDatosDeEstrategiaDeUsuarioRes.length; k++) {
                            //winston.info("antes de agregar Rol");
                            //winston.info("usuario.tipo_solicitudes["+i+"].id = "+usuario.tipo_solicitudes[i].id);
                            //winston.info("listaDatosDeEstrategiaDeUsuarioRes["+k+"].id_tipo_solicitud = "+listaDatosDeEstrategiaDeUsuarioRes[k].id_tipo_solicitud);
                            console.log("antes de agregar Rol");
                            console.log("usuario.tipo_solicitudes[" + i + "].id = " + usuario.tipo_solicitudes[i].id);
                            console.log("listaDatosDeEstrategiaDeUsuarioRes[" + k + "].id_tipo_solicitud = " + listaDatosDeEstrategiaDeUsuarioRes[k].id_tipo_solicitud);
                            if (usuario.tipo_solicitudes[i].id == listaDatosDeEstrategiaDeUsuarioRes[k].id_tipo_solicitud
                                && listaTipoSolicitudYRolAgrupadoRes[indice].id_rol == listaDatosDeEstrategiaDeUsuarioRes[k].id_rol) {
                                //winston.info("agregando roles");
                                console.log("agregando roles");
                                let rol = {
                                    id: listaTipoSolicitudYRolAgrupadoRes[indice].id_rol,
                                    nombre: listaDatosDeEstrategiaDeUsuarioRes[k].rol_nombre,
                                    escenariosNivel3: []
                                }
                                usuario.tipo_solicitudes[i].roles.push(rol);
                                break;
                            }
                            console.log("k = " + k)
                        }
                    }
                    console.log("indice = " + indice);
                }
                console.log("i = " + i);
            }

            for (let i = 0; i < usuario.tipo_solicitudes.length; i++) {
                for (let j = 0; j < usuario.tipo_solicitudes[i].roles.length; j++) {
                    for (let k = 0; k < listaDatosDeEstrategiaDeUsuarioRes.length; k++) {
                        if (usuario.tipo_solicitudes[i].id == listaDatosDeEstrategiaDeUsuarioRes[k].id_tipo_solicitud
                            && usuario.tipo_solicitudes[i].roles[j].id == listaDatosDeEstrategiaDeUsuarioRes[k].id_rol) {
                            // agregando Escenario Nivel 3
                            let escenario_nivel3 = {
                                id: listaDatosDeEstrategiaDeUsuarioRes[k].id_escenario_nivel3,
                                nombre: listaDatosDeEstrategiaDeUsuarioRes[k].escenario_nivel3_nombre
                            }
                            usuario.tipo_solicitudes[i].roles[j].escenariosNivel3.push(escenario_nivel3);
                        }
                    }
                }
            }
        }

        let datosResponse = [];
        // filtramos con los parametros
        winston.info("usuario.tipo_solicitudes.length: " + usuario.tipo_solicitudes.length);
        if (usuario.tipo_solicitudes.length > 0) {
            for (let i = 0; i < usuario.tipo_solicitudes.length; i++) {
                if (usuario.tipo_solicitudes[i].id == id_tipo_solicitud) {
                    for (let j = 0; j < usuario.tipo_solicitudes[i].roles.length; j++) {
                        if (usuario.tipo_solicitudes[i].roles[j].id == id_rol) {
                            datosResponse = usuario.tipo_solicitudes[i].roles[j].escenariosNivel3;
                            break;
                        }
                    }
                }
            }
        }

        response.resultado = 1;
        response.mensaje = "";
        response.escenariosNivel3 = datosResponse;
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en escenarioNivel3Controller.buscarPorUsuarioRolYTipoSolicitud,", error);
        res.status(500).send(error);
    }
};

controller.listarPorIdEscenarioNivel3 = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Escenarios de Nivel 3."
        };

        const { id_escenario_nivel3 } = req.query;

        if (!id_escenario_nivel3 || id_escenario_nivel3 == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo id_escenario_nivel3 no tiene un valor válido. Tipo de dato : '" + (typeof id_escenario_nivel3) + "', valor = " + id_escenario_nivel3;
            res.status(200).json(response);
            return;
        }

        const escenarioNivel3ServiceRes = await escenarioNivel3Service.listarPorIdEscenarioNivel3(postgresConn, id_escenario_nivel3);
        if (escenarioNivel3ServiceRes) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = escenarioNivel3ServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en escenarioNivel3Controller.listarTodo,", error);
        res.status(500).send(error);
    }
};

controller.listarPorFiltros = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Escenarios de Nivel 3."
        };

        const { id_usuario, id_rol, id_tipo_solicitud, codigo_escenario_nivel1 } = req.query;

        /** importante */
        /** codigo_escenario_nivel1 no se usa */
        
        //#region Validaciones al request
        if (!id_usuario || isNaN(id_usuario) || id_usuario < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no es válido. Tipo de dato: '" + (typeof id_usuario) + "', valor = " + id_usuario;
            res.status(200).json(response);
            return;
        }

        if (!id_rol || isNaN(id_rol) || id_rol < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_rol no es válido. Tipo de dato: '" + (typeof id_rol) + "', valor = " + id_rol;
            res.status(200).json(response);
            return;
        }

        if (!id_tipo_solicitud || isNaN(id_tipo_solicitud) || id_tipo_solicitud < 1) {
            response.resultado = 0;
            response.mensaje = "El campo id_tipo_solicitud no es válido. Tipo de dato: '" + (typeof id_tipo_solicitud) + "', valor = " + id_tipo_solicitud;
            res.status(200).json(response);
            return;
        }
        //#endregion

        const escenarioNivel3ServiceRes = await escenarioNivel3Service.listarPorFiltros(postgresConn, id_usuario, id_rol, id_tipo_solicitud, codigo_escenario_nivel1);
        if (escenarioNivel3ServiceRes) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = escenarioNivel3ServiceRes;
        }

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en escenarioNivel3Controller.listarTodo,", error);
        res.status(500).send(error);
    }
};

controller.listarPorIdSociedad = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Escenarios de Nivel 3."
        };

        const { id_sociedad } = req.query;
        
        if (!id_sociedad || id_sociedad == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo id_sociedad no tiene un valor válido. Tipo de dato : '" + (typeof id_sociedad) + "', valor = " + id_sociedad;
            res.status(200).json(response);
            return;
        }
        const escenarioNivel3ServiceRes = await escenarioNivel3Service.listarPorIdSociedad(postgresConn, id_sociedad);
        if (escenarioNivel3ServiceRes) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = escenarioNivel3ServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en escenarioNivel3Controller.listarPorIdSociedad,", error);
        res.status(500).send(error);
    }
};

module.exports = controller;