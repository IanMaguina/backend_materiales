const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const Usuario = require('../domain/usuario');
const { StaticPool }= require("node-worker-threads-pool");
const path = require('path');
const emailValidatorFilePath = path.join(__dirname, '../workers/emailValidator.js');
const escenarioNivel1Service = require('../services/escenarioNivel1Service');
const perfilUsuarioService = require('../services/perfilUsuarioService');
const usuarioPerfilService = require('../services/usuarioPerfilService');
const usuarioService =  require('../services/usuarioService');
const pool = new StaticPool({
    size: 4,
    task: emailValidatorFilePath,
    workerData: "workerData!",
});

const usuarioController = {};

usuarioController.crear = async (req, res) => {
    const client = await postgresConn.getClient();
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al crear Usuario."
        };
        let { usuario, nombre, id_perfil_usuario, id_area_usuario } = req.body;
        winston.info("req.body: "+JSON.stringify(req.body));
        let esEmailValido = await pool.exec(usuario);
        winston.info("esEmailValido: "+esEmailValido);
        if(!esEmailValido){
            response.resultado = 0;
            response.mensaje = "El campo usuario no es válido. Tipo de dato: '"+(typeof usuario)+"', valor = "+usuario;
            res.status(200).json(response)
            return;            
        }
        if((typeof nombre) !== 'string'){
            response.resultado = 0;
            response.mensaje = "El campo nombre no es válido. Tipo de dato: '"+(typeof nombre)+"', valor = "+nombre;
            return res.status(200).json(response);
        }
        if(!id_area_usuario || isNaN(id_area_usuario) || id_area_usuario < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_area_usuario no es válido. Tipo de dato: '"+(typeof id_area_usuario)+"', valor = "+id_area_usuario;
            return res.status(200).json(response);
        }
        await client.query("BEGIN");
        const buscarUsuarioRes = await usuarioService.buscarPorUsuario(client, usuario);
        winston.info("buscarUsuarioRes: "+JSON.stringify(buscarUsuarioRes));
        if(buscarUsuarioRes.length > 0){
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "Ya existe un usuario registrado con: "+usuario;
            res.status(200).json(response);
            return;
        }
        const objUsuario = new Usuario();
        objUsuario.usuario = usuario;
        objUsuario.nombre = nombre;
        objUsuario.area_usuario = { id: id_area_usuario };
        objUsuario.activo = true;
        const crearUsuarioRes = await usuarioService.crear(client, objUsuario);
        winston.info("id del nuevo usuario: "+crearUsuarioRes[0].id);
        if(crearUsuarioRes[0].id){
            await client.query('COMMIT');
            response.resultado = 1;
            response.mensaje = "";
            response.id = crearUsuarioRes[0].id;
        } else {
            await client.query("ROLLBACK");
            response.resultado = 0,
            response.mensaje = "Error al intentar crear Usuario."
        }
        res.status(200).json(response);
    } catch (error) {
        await client.query("ROLLBACK");
        winston.info("Error en usuarioController.crear,",error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
}

usuarioController.listarTodo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Usuarios."
        };
        const usuarioServiceRes = await usuarioService.listarTodo(postgresConn);
        if(usuarioServiceRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = usuarioServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en usuarioController.listarTodo,",error);
        res.status(500).send(error);
    }
}

usuarioController.actualizarActivo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al actualizar el campo 'activo' del usuario."
        };
        let { id_usuario, activo } = req.body;
        if(!id_usuario || isNaN(id_usuario) || id_usuario < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no es válido. Tipo de dato: '"+(typeof id_usuario)+"', valor = "+id_usuario;
            return res.status(200).json(response);
        }
        if(activo === undefined){
            response.resultado = 0;
            response.mensaje = "El campo activo no es válido. Tipo de dato: '"+(typeof activo)+"', valor = "+activo;
            return res.status(200).json(response);
        }
        const usuarioObj = new Usuario();
        usuarioObj.id = id_usuario;
        usuarioObj.activo = activo;
        const updateRes = await usuarioService.actualizarActivo(postgresConn, usuarioObj);
        if(updateRes){
            response.resultado = 1;
            response.mensaje = "";
            response.id = id_usuario;
        } else {
            response.resultado = 0;
            response.mensaje = "Error al momento de Actualizar el campo 'activo' de Usuario";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en usuarioController.actualizarActivo, ", error);
        res.status(500).send(error);
    }
}

usuarioController.listarPorFiltros = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Estrategias."
        };
        let { usuario, nombre, id_perfil_usuario, id_area_usuario } = req.body;
        winston.info("req.body: "+JSON.stringify(req.body));
        /*
        if(usuario){
            let esEmailValido = await pool.exec(usuario);
            winston.info("esEmailValido: "+esEmailValido);
            if(!esEmailValido){
                response.resultado = 0;
                response.mensaje = "El campo usuario no es válido. Tipo de dato: '"+(typeof usuario)+"', valor = "+usuario;
                res.status(200).json(response)
                return;            
            }
        }
        */
        const buscarUsuarioRes = await usuarioService.listarPorFiltros(postgresConn, req.body);
        if(buscarUsuarioRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = buscarUsuarioRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en usuarioController.listarPorFiltros,",error);
        res.status(500).send(error);
    }
}

usuarioController.actualizar = async (req, res) => {
    const client = await postgresConn.getClient();
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al actualizar Usuario."
        };
        let { id_usuario, usuario, nombre, id_area_usuario } = req.body;
        winston.info("req.body:", JSON.stringify(req.body));
        if(!id_usuario || isNaN(id_usuario) || id_usuario < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no es válido. Tipo de dato: '"+(typeof id_usuario)+"', valor = "+id_usuario;
            res.status(200).json(response);
            return;
        }
        
        let esEmailValido = await pool.exec(usuario);
        winston.info("esEmailValido: "+esEmailValido);
        if(!esEmailValido){
            response.resultado = 0;
            response.mensaje = "El campo usuario no es válido. Tipo de dato: '"+(typeof usuario)+"', valor = "+usuario;
            res.status(200).json(response)
            return;            
        }
        if(!nombre || (typeof nombre) !== "string"){
            response.resultado = 0;
            response.mensaje = "El campo nombre no es válido. Tipo de dato: '"+(typeof nombre)+"', valor = "+nombre;
            res.status(200).json(response)
            return; 
        }
        if(!id_area_usuario || isNaN(id_area_usuario) || id_area_usuario < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_area_usuario no es válido. Tipo de dato: '"+(typeof id_area_usuario)+"', valor = "+id_area_usuario;
            res.status(200).json(response);
            return;
        }
        await client.query("BEGIN");
        const buscarUsuarioRes = await usuarioService.buscarPorUsuario(client, usuario);
        if(buscarUsuarioRes && buscarUsuarioRes.length > 0){
            for(let i=0;i < buscarUsuarioRes.length;i++){
                if(buscarUsuarioRes[i].id != id_usuario && buscarUsuarioRes[i].usuario == usuario){
                    await client.query("ROLLBACK");
                    response.resultado = 0,
                    response.mensaje = "No puedes actualizar, ya existe un usuario con el correo "+usuario;
                    res.status(200).json(response);
                    return;
                }
            }            
        }
        const usuarioObj = new Usuario();
        usuarioObj.id = id_usuario;
        usuarioObj.usuario = usuario;
        usuarioObj.nombre = nombre;
        //usuarioObj.perfil_usuario = { id: id_perfil_usuario };
        usuarioObj.area_usuario = { id: id_area_usuario };
        const actualizarRes = await usuarioService.actualizar(client, usuarioObj);
        if(actualizarRes){
            await client.query('COMMIT');
            response.resultado = 1;
            response.mensaje = "";
        } else {
            await client.query("ROLLBACK");
            response.resultado = 0,
            response.mensaje = "Error al intentar actualizar el Usuario.";
        }
        res.status(200).json(response);
    } catch (error) {
        await client.query("ROLLBACK");
        winston.info("Error en usuarioController.actualizar,", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
}

usuarioController.buscarDatosDeEstrategiaDeUsuario = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al buscar Datos de Estrategia de Usuario."
        };
        let { correo } = req.query;
        winston.info("req.query: "+JSON.stringify(req.query));
        let esEmailValido = await pool.exec(correo);
        winston.info("esEmailValido: "+esEmailValido);
        if(!esEmailValido){
            response.resultado = 0;
            response.mensaje = "El campo correo no es válido. Tipo de dato: '"+(typeof correo)+"', valor = "+correo;
            res.status(200).json(response)
            return;            
        }

        // lista de Estrategias diferentes en el que esta el usuario
        /*
        const listaEstrategiasRes = await usuarioService.listarIdEscenarioYIdTipoSolicitudDeUsuario(postgresConn, correo);
        let listaDatosDeEstrategiaDeUsuarioRes = null;
        let usuario = {};
        if(listaEstrategiasRes.length > 0){
            listaDatosDeEstrategiaDeUsuarioRes = await usuarioService.listarDatosEstrategiaDeUsuario(postgresConn, correo);
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
            usuario.estrategias = [];
            for(let i=0;i < listaEstrategiasRes.length; i++){                
                for(let j=0;j < listaDatosDeEstrategiaDeUsuarioRes.length; j++){
                    if(listaEstrategiasRes[i].id_escenario_nivel3 == listaDatosDeEstrategiaDeUsuarioRes[j].id_escenario_nivel3
                        && listaEstrategiasRes[i].id_tipo_solicitud == listaDatosDeEstrategiaDeUsuarioRes[j].id_tipo_solicitud){
                        // agregando Estrategias
                        let estrategia = {
                            escenario_nivel3: {
                                id: listaDatosDeEstrategiaDeUsuarioRes[j].id_escenario_nivel3,
                                nombre: listaDatosDeEstrategiaDeUsuarioRes[j].escenario_nivel3_nombre
                            },
                            tipo_solicitud: {
                                id: listaDatosDeEstrategiaDeUsuarioRes[j].id_tipo_solicitud,
                                nombre: listaDatosDeEstrategiaDeUsuarioRes[j].tipo_solicitud_nombre
                            },
                            roles: []
                        }
                        usuario.estrategias.push(estrategia);
                        break;
                    }
                }
            }

            for(let i=0;i < usuario.estrategias.length; i++){
                for(let j=0;j < listaDatosDeEstrategiaDeUsuarioRes.length; j++){
                    if(usuario.estrategias[i].escenario_nivel3.id == listaDatosDeEstrategiaDeUsuarioRes[j].id_escenario_nivel3
                        && usuario.estrategias[i].tipo_solicitud.id == listaDatosDeEstrategiaDeUsuarioRes[j].id_tipo_solicitud){
                        // agregando Roles
                        let rol = {
                            id: listaDatosDeEstrategiaDeUsuarioRes[j].id_rol,
                            nombre: listaDatosDeEstrategiaDeUsuarioRes[j].rol_nombre
                        }
                        usuario.estrategias[i].roles.push(rol);
                    }
                }
            }
        }
        */

        // cambio de logica, se agrupara primero por Tipo de Solicitud, Rol, luego se agregan las Estrategias a los roles
        let listaTipoSolictudRes = await usuarioService.listarIdTiposSolicitudDeUsuario(postgresConn, correo);
        //let listaRolesRes = await usuarioService.listarIdRolesDeUsuario(postgresConn, correo);
        //let listaEscenarioNivel3Res = await usuarioService.listarIdEscenarioNivel3DeUsuario(postgresConn, correo);
        let listaTipoSolicitudYRolAgrupadoRes = await usuarioService.listarIdTipoSolicitudYIdRolAgrupadoDeUsuario(postgresConn, correo);

        //let listaIdTipoSolicitudAgregados = [];

        let listaDatosDeEstrategiaDeUsuarioRes = null;
        let usuario = {};
        if(listaTipoSolictudRes.length > 0){
            listaDatosDeEstrategiaDeUsuarioRes = await usuarioService.listarDatosEstrategiaDeUsuario(postgresConn, correo);
            let listaPerfilesRes = await usuarioService.listarPerfilesPorCorreo(postgresConn, correo);
            usuario.id = listaDatosDeEstrategiaDeUsuarioRes[0].id;
            usuario.usuario = listaDatosDeEstrategiaDeUsuarioRes[0].usuario;
            usuario.nombre = listaDatosDeEstrategiaDeUsuarioRes[0].nombre;
            usuario.perfil_usuario = listaPerfilesRes
            usuario.area_usuario = {
                id: listaDatosDeEstrategiaDeUsuarioRes[0].id_area_usuario,
                nombre: listaDatosDeEstrategiaDeUsuarioRes[0].area_usuario_nombre
            }
            usuario.tipo_solicitudes = [];
            usuario.lista_nivel1 = [];

            for(let i=0;i < listaTipoSolictudRes.length; i++){
                for(let j=0;j < listaDatosDeEstrategiaDeUsuarioRes.length; j++){
                    if(listaTipoSolictudRes[i].id_tipo_solicitud == listaDatosDeEstrategiaDeUsuarioRes[j].id_tipo_solicitud){
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

            winston.info("usuario.tipo_solicitudes = "+JSON.stringify(usuario.tipo_solicitudes));
            winston.info("listaTipoSolicitudYRolAgrupadoRes = "+JSON.stringify(listaTipoSolicitudYRolAgrupadoRes));
            for(let i=0;i < usuario.tipo_solicitudes.length; i++){
                for(let indice=0;indice < listaTipoSolicitudYRolAgrupadoRes.length; indice++){
                    //winston.info("usuario.tipo_solicitudes["+i+"].id = "+usuario.tipo_solicitudes[i].id);
                    //winston.info("listaTipoSolicitudYRolAgrupadoRes["+indice+"].id_tipo_solicitud = "+listaTipoSolicitudYRolAgrupadoRes[indice].id_tipo_solicitud);
                    if(usuario.tipo_solicitudes[i].id == listaTipoSolicitudYRolAgrupadoRes[indice].id_tipo_solicitud){
                        // agregando Rol
                        for(let k=0;k < listaDatosDeEstrategiaDeUsuarioRes.length; k++){
                            //winston.info("antes de agregar Rol");
                            //winston.info("usuario.tipo_solicitudes["+i+"].id = "+usuario.tipo_solicitudes[i].id);
                            //winston.info("listaDatosDeEstrategiaDeUsuarioRes["+k+"].id_tipo_solicitud = "+listaDatosDeEstrategiaDeUsuarioRes[k].id_tipo_solicitud);
                            //console.log("antes de agregar Rol");
                            //console.log("usuario.tipo_solicitudes["+i+"].id = "+usuario.tipo_solicitudes[i].id);
                            //console.log("listaDatosDeEstrategiaDeUsuarioRes["+k+"].id_tipo_solicitud = "+listaDatosDeEstrategiaDeUsuarioRes[k].id_tipo_solicitud);
                            if(usuario.tipo_solicitudes[i].id == listaDatosDeEstrategiaDeUsuarioRes[k].id_tipo_solicitud
                                && listaTipoSolicitudYRolAgrupadoRes[indice].id_rol == listaDatosDeEstrategiaDeUsuarioRes[k].id_rol){
                                //winston.info("agregando roles");
                                //console.log("agregando roles");
                                let rol  = {
                                    id: listaTipoSolicitudYRolAgrupadoRes[indice].id_rol,
                                    nombre: listaDatosDeEstrategiaDeUsuarioRes[k].rol_nombre,
                                    escenariosNivel3: []
                                }
                                usuario.tipo_solicitudes[i].roles.push(rol);
                                break;
                            }
                            //console.log("k = "+k)
                        }
                    }
                    //console.log("indice = "+indice);
                }
                //console.log("i = "+i);
            }

            for(let i=0;i < usuario.tipo_solicitudes.length; i++){
                for(let j=0;j < usuario.tipo_solicitudes[i].roles.length; j++){
                    for(let k=0;k < listaDatosDeEstrategiaDeUsuarioRes.length; k++){
                        if(usuario.tipo_solicitudes[i].id == listaDatosDeEstrategiaDeUsuarioRes[k].id_tipo_solicitud
                            && usuario.tipo_solicitudes[i].roles[j].id == listaDatosDeEstrategiaDeUsuarioRes[k].id_rol){
                            // agregando Escenario Nivel 3
                            let escenario_nivel3 = {
                                id: listaDatosDeEstrategiaDeUsuarioRes[k].id_escenario_nivel3,
                                nombre: listaDatosDeEstrategiaDeUsuarioRes[k].escenario_nivel3_nombre
                            }
                           // usuario.tipo_solicitudes[i].roles[j].escenariosNivel3.push(escenario_nivel3);
                        }
                    }
                }
            }

            // agregamos lista de niveles 1 unicos, sin id
            let listaCodigoNivele1UnicosRes = await usuarioService.listarCodigoNivel1UnicoByCorreo(postgresConn, correo);
            let listaNivel1Res = await escenarioNivel1Service.listarTodo(postgresConn);
            for(let i=0; i < listaCodigoNivele1UnicosRes.length; i++){
                for(let j=0;j < listaNivel1Res.length; j++){
                    if(listaNivel1Res[j].codigo == listaCodigoNivele1UnicosRes[i].codigo){
                        let escenario_nivel1 = {
                            codigo: listaNivel1Res[j].codigo,
                            nombre: listaNivel1Res[j].nombre,
                            tipo_solicitudes: []
                        }
                        usuario.lista_nivel1.push(escenario_nivel1);
                        break;
                    }
                }
            }

            let listaNivel1YTipoSolicitudRes = await usuarioService.distinctCodigoNivel1YTipoSolicitudByCorreo(postgresConn, correo);
            for(let i=0;i < usuario.lista_nivel1.length; i++){
                for(let j=0;j < listaNivel1YTipoSolicitudRes.length; j++){
                    if(usuario.lista_nivel1[i].codigo == listaNivel1YTipoSolicitudRes[j].nivel1_codigo){
                        let tipo_solicitud = {
                            id: listaNivel1YTipoSolicitudRes[j].id_tipo_solicitud,
                            nombre: listaNivel1YTipoSolicitudRes[j].tipo_solicitud_nombre
                        }
                        usuario.lista_nivel1[i].tipo_solicitudes.push(tipo_solicitud);
                    }
                }
            }
        }
        
        response.resultado = 1;
        response.mensaje = "";
        response.usuario = usuario;
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en usuarioController.buscarDatosDeEstrategiaDeUsuario,",error);
        res.status(500).send(error);
    }
}

usuarioController.listarPerfilesPendientes = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error al momento de listar Perfiles pendientes de Usuario."
        };
        let { id_usuario } = req.query;
        winston.info("req.query: "+JSON.stringify(req.query));
        if(!id_usuario || isNaN(id_usuario) || id_usuario < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no es válido. Tipo de dato: '"+(typeof id_usuario)+"', valor = "+id_usuario;
            return res.status(200).json(response);
        }
        const listaRes = await perfilUsuarioService.listarPerfilesPendientesPorIdUsuario(postgresConn, id_usuario);
        if(listaRes){
            response.resultado = 1,
            response.mensaje = "";
            response.lista = listaRes;
        } else {
            response.resultado = 0,
            response.mensaje = "Error al intentar buscar Perfiles de Usuario.";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en usuarioController.listarPerfilesPendientes,",error);
        res.status(500).send(error);
    }
}

usuarioController.listarPerfiles = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error al momento de listar Perfiles pendientes de Usuario."
        };
        let { id_usuario } = req.query;
        winston.info("req.query: "+JSON.stringify(req.query));
        if(!id_usuario || isNaN(id_usuario) || id_usuario < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no es válido. Tipo de dato: '"+(typeof id_usuario)+"', valor = "+id_usuario;
            return res.status(200).json(response);
        }
        const listaRes = await perfilUsuarioService.listarPorIdUsuario(postgresConn, id_usuario);
        if(listaRes){
            response.resultado = 1,
            response.mensaje = "";
            response.lista = listaRes;
        } else {
            response.resultado = 0,
            response.mensaje = "Error al intentar buscar Perfiles de Usuario.";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en usuarioController.listarPerfiles,",error);
        res.status(500).send(error);
    }
}

usuarioController.asignarPerfilAUsuario = async (req, res) => {
    const client = await postgresConn.getClient();
    try {
        const response = {
            resultado: 0,
            mensaje: "Error al momento de asignar Perfil a Usuario."
        };
        let { id_usuario, id_perfil_usuario } = req.body;
        if(!id_usuario || isNaN(id_usuario) || id_usuario < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no es válido. Tipo de dato: '"+(typeof id_usuario)+"', valor = "+id_usuario;
            return res.status(200).json(response);
        }
        if(!id_perfil_usuario || isNaN(id_perfil_usuario) || id_perfil_usuario < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_perfil_usuario no es válido. Tipo de dato: '"+(typeof id_perfil_usuario)+"', valor = "+id_perfil_usuario;
            return res.status(200).json(response);
        }

        // buscamos si ya existe
        const buscarRes = await usuarioPerfilService.buscar(client, id_usuario, id_perfil_usuario);
        winston.info("buscarRes: ", buscarRes);
        if(buscarRes && buscarRes.length > 0){
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "Ya esta asignado el Perfil al Usuario.";
            res.status(200).json(response);
            return;
        }

        const crearRes = await usuarioPerfilService.crear(client, id_usuario, id_perfil_usuario);
        if(crearRes && crearRes[0].id_usuario){
            await client.query('COMMIT');
            response.resultado = 1;
            response.mensaje = "";
        } else {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "Error al momento de guardar la asignacion de Perfil a Usuario.";
            res.status(200).json(response);
            return;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en usuarioController.asignarPerfilAUsuario,",error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
}

usuarioController.eliminarPerfilDeUsuario = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error al momento de desasignar Perfil a Usuario."
        };
        let { id_usuario, id_perfil_usuario } = req.body;
        if(!id_usuario || isNaN(id_usuario) || id_usuario < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no es válido. Tipo de dato: '"+(typeof id_usuario)+"', valor = "+id_usuario;
            return res.status(200).json(response);
        }
        if(!id_perfil_usuario || isNaN(id_perfil_usuario) || id_perfil_usuario < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_perfil_usuario no es válido. Tipo de dato: '"+(typeof id_perfil_usuario)+"', valor = "+id_perfil_usuario;
            return res.status(200).json(response);
        }

        // borramos
        const borrarRes = await usuarioPerfilService.borrar(postgresConn, id_usuario, id_perfil_usuario);
        if(borrarRes){
            response.resultado = 1;
            response.mensaje = "";
        } else {
            response.resultado = 0;
            response.mensaje = "Error al momento de borrar Perfil a Usuario.";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en usuarioController.eliminarPerfilDeUsuario,",error);
        res.status(500).send(error);
    }
}

module.exports = usuarioController;