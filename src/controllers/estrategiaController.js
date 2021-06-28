const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const Estrategia = require('../domain/estrategia');
const estrategiaService = require('../services/estrategiaService');
const rolService = require('../services/rolService');
const estrategiaRolService = require('../services/estrategiaRolService');
const estrategiaCorreoService = require('../services/estrategiaCorreoService');
const EstrategiaRol = require('../domain/estrategiaRol');
const EstrategiaCorreo = require('../domain/estrategiaCorreo');
const EstrategiaRolUsuario = require('../domain/estrategiaRolUsuario');
const estrategiaRolUsuarioService = require('../services/estrategiaRolUsuarioService');
const usuarioService = require('../services/usuarioService');

const estrategiaController = {};

estrategiaController.listarPorFiltros = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Estrategias."
        };
        let { id_sociedad, id_escenario_nivel1, id_escenario_nivel2, id_escenario_nivel3, id_tipo_solicitud } = req.body;
        winston.info("req.body: "+JSON.stringify(req.body));
        const estrategiaServiceRes = await estrategiaService.listarPorFiltros(postgresConn, req.body);
        if(estrategiaServiceRes){
            if(estrategiaServiceRes.length > 0){
                let listaIdsEstrategia = [];
                for(let i=0;i < estrategiaServiceRes.length;i++){
                    listaIdsEstrategia.push(estrategiaServiceRes[i].id);
                }
                const listaIdsConSumaIdRolXEstrategia = await estrategiaService.listarIdsConSumaDeIdRolActivosDeEstrategia(postgresConn, listaIdsEstrategia);
                if(listaIdsConSumaIdRolXEstrategia && listaIdsConSumaIdRolXEstrategia.length > 0){
                    let entroBucle = false;
                    for(let i=0;i < estrategiaServiceRes.length;i++){
                        for(let j=0;j < listaIdsConSumaIdRolXEstrategia.length;j++){
                            if(estrategiaServiceRes[i].id == listaIdsConSumaIdRolXEstrategia[j].id){
                                estrategiaServiceRes[i].tiene_roles = listaIdsConSumaIdRolXEstrategia[j].suma > 0 ? true : false;
                                entroBucle = true;
                            }
                        }
                    }
                    if(entroBucle === false){
                        response.resultado = 0;
                        response.mensaje = "No se completo el campo tiene_roles.";
                        res.status(200).json(response);
                        return;
                    }
                } else {
                    response.resultado = 0;
                    response.mensaje = "Error al buscar Roles de una Estrategia para completar el campo tiene_roles.";
                    res.status(200).json(response);
                    return;
                }
                winston.info("listaIdsConSumaIdRolXEstrategia: "+JSON.stringify(listaIdsConSumaIdRolXEstrategia));
            }
            response.resultado = 1;
            response.mensaje = "";
            response.lista = estrategiaServiceRes;
        }
        winston.info("estrategiaServiceRes:"+JSON.stringify(estrategiaServiceRes));
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en estrategiaController.listarPorFiltros,",error);
        res.status(500).send(error);
    }
}

estrategiaController.crear = async (req, res) => {
    const client = await postgresConn.getClient();
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al crear Estrategia."
        };
        let { id_escenario_nivel3, id_tipo_solicitud } = req.body;
        winston.info("id_escenario_nivel3: "+id_escenario_nivel3);
        winston.info("id_tipo_solicitud: "+id_tipo_solicitud);
        if(!id_escenario_nivel3 || isNaN(id_escenario_nivel3) || id_escenario_nivel3 < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_escenario_nivel3 no es válido. Tipo de dato: '"+(typeof id_escenario_nivel3)+"', valor = "+id_escenario_nivel3;
            return res.status(200).json(response);
        }
        if(!id_tipo_solicitud || isNaN(id_tipo_solicitud) || id_tipo_solicitud < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_tipo_solicitud no es válido. Tipo de dato: '"+(typeof id_tipo_solicitud)+"', valor = "+id_tipo_solicitud;
            return res.status(200).json(response);
        }
        await client.query("BEGIN");
        const buscarConFiltrosRes = await estrategiaService.listarPorFiltros(client, req.body);
        if(buscarConFiltrosRes && buscarConFiltrosRes.length > 0){
            await client.query("ROLLBACK");
            winston.info("buscarConFiltrosRes:", buscarConFiltrosRes);
            response.resultado = 0;
            response.mensaje = "Ya existe una estrategia con id_escenario_nivel3 = "+id_escenario_nivel3+" y id_tipo_solicitud = "+id_tipo_solicitud;
            res.status(200).json(response);
            return;
        }
        const estrategia = new Estrategia();
        estrategia.escenario_nivel3 = { id: id_escenario_nivel3 };
        estrategia.tipo_solicitud = { id: id_tipo_solicitud };
        estrategia.usuario_enviar_correo = { id: null }
        const estrategiaServiceRes = await estrategiaService.crear(postgresConn, estrategia);
        winston.info("id de la nueva estrategia: "+estrategiaServiceRes[0].id);
        if(estrategiaServiceRes && estrategiaServiceRes[0].id){
            await client.query('COMMIT');
            response.resultado = 1;
            response.mensaje = "";
            response.id = estrategiaServiceRes[0].id;
        } else {
            await client.query("ROLLBACK");
            response.resultado = 0;
            response.mensaje = "Error al intentar crear Estrategia.";
        }
        res.status(200).json(response);
    } catch (error) {
        await client.query("ROLLBACK");
        winston.info("Error en estrategiaController.crear,",error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
}

estrategiaController.listarRolesQueFaltanEnEstrategia = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Roles que faltan en la Estrategia."
        };
        let { id_estrategia } = req.query;
        winston.info("id_estrategia:", id_estrategia);
        const listaEstrategiaRol = await estrategiaService.listarEstrategiaRolPorIdEstrategia(postgresConn, id_estrategia);
        winston.info("listaEstrategiaRol:", listaEstrategiaRol);
        let idsRolesActuales = [];
        for(let i=0;i < listaEstrategiaRol.length;i++){
            idsRolesActuales.push(listaEstrategiaRol[i].id_rol);
        }
        winston.info("idsRolesActuales:", idsRolesActuales);
        const listaRolesFaltantes = await rolService.listarNoEstanEnLaListaIds(postgresConn, idsRolesActuales);
        if(listaRolesFaltantes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = listaRolesFaltantes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en estrategiaController.listarRolesQueFaltanEnEstrategia,",error);
        res.status(500).send(error);
    }
}

estrategiaController.listarEstrategiaRolYRolPorId = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Roles de Estrategia."
        };
        let { id_estrategia } = req.query;
        winston.info("id_estrategia:", id_estrategia);
        const estrategiaServiceRes = await estrategiaService.listarEstrategiaRolYRolPorId(postgresConn, id_estrategia);
        if(estrategiaServiceRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = estrategiaServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en estrategiaController.listarEstrategiaRolYRolPorId,", error);
        res.status(500).send(error);
    }
}

estrategiaController.crearEstrategiaRol = async (req, res) => {
    const client = await postgresConn.getClient();
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al crear EstrategiaRol."
        };
        let { orden, id_rol, id_estrategia } = req.body;
        winston.info("req.body:", req.body);
        winston.info("orden: "+orden);
        winston.info("id_rol: "+id_rol);
        winston.info("id_estrategia: "+id_estrategia);
        //winston.info("activo: "+activo);
        if(!orden || isNaN(orden) || orden < 1){
            response.resultado = 0;
            response.mensaje = "El campo orden no es válido. Tipo de dato: '"+(typeof orden)+"', valor = "+orden;
            return res.status(200).json(response);
        }
        if(!id_rol || isNaN(id_rol) || id_rol < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_rol no es válido. Tipo de dato: '"+(typeof id_rol)+"', valor = "+id_rol;
            return res.status(200).json(response);
        }
        if(!id_estrategia || isNaN(id_estrategia) || id_estrategia < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_estrategia no es válido. Tipo de dato: '"+(typeof id_estrategia)+"', valor = "+id_estrategia;
            return res.status(200).json(response);
        }
        /*
        if(typeof activo !== 'boolean'){
            response.resultado = 0;
            response.mensaje = "El campo activo no es válido, debe ser del tipo de dato 'boolean'. Tipo de dato: '"+(typeof activo)+"', valor = "+activo;
            return res.status(200).json(response);
        }
        */
        await client.query("BEGIN");
        const estrategiaRolExistente = await estrategiaRolService.listarPorIdRolYIdEstrategiaYOrden(client, id_rol, id_estrategia, orden);
        if(estrategiaRolExistente && estrategiaRolExistente.length > 0){
            await client.query("ROLLBACK");
            winston.info("estrategiaRolExistente:", estrategiaRolExistente);
            response.resultado = 0;
            response.mensaje = "Ya existe una estrategiaRol con id_rol = "+id_rol+", id_estrategia = "+id_estrategia+" y el orden = "+orden;
            return res.status(200).json(response);
        }
        const estrategiaRol = new EstrategiaRol();
        estrategiaRol.orden = orden;
        estrategiaRol.rol = { id: id_rol };
        estrategiaRol.estrategia = { id: id_estrategia };
        estrategiaRol.activo = true;
        const estrategiaRolRes = await estrategiaRolService.crear(client, estrategiaRol);
        winston.info("id de la nueva estrategiaRol:", estrategiaRolRes[0].id);
        if(estrategiaRolRes && estrategiaRolRes[0].id){
            await client.query('COMMIT');
            response.resultado = 1;
            response.mensaje = "";
            response.id = estrategiaRolRes[0].id;
        } else {
            await client.query("ROLLBACK");
            response.resultado = 0,
            response.mensaje = "Error al intentar crear EstrategiaRol."
        }
        res.status(200).json(response);
    } catch (error) {
        await client.query("ROLLBACK");
        winston.info("Error en estrategiaController.crearEstrategiaRol,", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
}

estrategiaController.listarUsuariosActivosDeEstrategiaRolPorIdEstrategiaRol = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Usuarios de EstrategiaRol."
        };
        let { id_estrategia_rol } = req.query;
        const estrategiaRolServiceRes = await estrategiaRolService.listarUsuariosActivosPorId(postgresConn, id_estrategia_rol);
        if(estrategiaRolServiceRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = estrategiaRolServiceRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en estrategiaController.listarUsuariosActivosDeEstrategiaRolPorIdEstrategiaRol,", error);
        res.status(500).send(error);
    }
}

estrategiaController.actualizarActivoDeEstrategiaRol = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al actualizar estado de EstrategiaRol."
        };
        let { id_estrategia_rol, activo } = req.body;
        if(!id_estrategia_rol || isNaN(id_estrategia_rol) || id_estrategia_rol < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_estrategia_rol no es válido. Tipo de dato: '"+(typeof id_estrategia_rol)+"', valor = "+id_estrategia_rol;
            return res.status(200).json(response);
        }
        if(activo === undefined){
            response.resultado = 0;
            response.mensaje = "El campo activo no es válido. Tipo de dato: '"+(typeof activo)+"', valor = "+activo;
            return res.status(200).json(response);
        }
        const estrategiaRol = new EstrategiaRol();
        estrategiaRol.id = id_estrategia_rol;
        estrategiaRol.activo = activo;
        const estrategiaRolServiceRes = await estrategiaRolService.actualizarActivo(postgresConn, estrategiaRol);
        if(estrategiaRolServiceRes){
            response.resultado = 1;
            response.mensaje = "";
            response.id = id_estrategia_rol;
        } else {
            response.resultado = 0;
            response.mensaje = "Error al momento de Actualizar el campo 'activo' de EstrategiaRol";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en estrategiaController.actualizarActivoDeEstrategiaRol,", error);
        res.status(500).send(error);
    }
}

estrategiaController.actualizarRolesDeEstrategia = async (req, res) => {
    const client = await postgresConn.getClient();
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al actualizar EstrategiaRol."
        };
        let crearEstrategiaRolRes;
        let { id_estrategia, lista } = req.body;
        winston.info("req.body:", JSON.stringify(req.body));
        if(!id_estrategia || isNaN(id_estrategia) || id_estrategia < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_estrategia no es válido. Tipo de dato: '"+(typeof id_estrategia)+"', valor = "+id_estrategia;
            return res.status(200).json(response);
        }
        if(!lista || !Array.isArray(lista)){
            response.resultado = 0;
            response.mensaje = "El campo lista no es válido. Tipo de dato: '"+(typeof lista)+"', valor = "+lista;
            return res.status(200).json(response);
        }
        await client.query("BEGIN");
        let listaActual = await estrategiaRolService.listarPorIdEstrategia(client, id_estrategia);
        winston.info("listaActual:", listaActual);
        for(let i=0;i < lista.length;i++){
            let encontrado = false;
            for(let j=0;j < listaActual.length;j++){
                if(lista[i].id == listaActual[j].id){
                    if(lista[i].rol.id != listaActual[j].id_rol){
                        await client.query("ROLLBACK");
                        response.resultado = 0,
                        response.mensaje = `El id rol del elemento lista[${i}].rol.id = ${lista[i].rol.id} es diferente al de la base de datos listaActual[${j}].id_rol = ${listaActual[j].id_rol}`
                        +`para el caso de id_estrategia_rol = ${listaActual[j].id}`;
                        res.status(200).json(response);
                    }
                    if(lista[i].orden != listaActual[j].orden || lista[i].activo !== listaActual[j].activo){
                        const estrategiaRol = new EstrategiaRol();
                        estrategiaRol.id = listaActual[j].id;
                        estrategiaRol.orden = lista[i].orden;
                        estrategiaRol.activo = lista[i].activo;
                        // si un elemento de la "nueva lista" sí esta en la "lista actual" y ha cambiado algun dato(orden o activo), hacer update a orden y activo(estado)
                        // update
                        const actualizar = await estrategiaRolService.actualizar(client, estrategiaRol);
                        winston.info(`lista[${i}], listaActual[${j}], actualizar: ${actualizar}`);
                        if(!actualizar){
                            await client.query("ROLLBACK");
                            response.resultado = 0,
                            response.mensaje = "Error al intentar actualizar Rol de Estrategia."
                            res.status(200).json(response);
                            return;
                        }
                    }
                    encontrado = true;
                }
            }

            // si un elemento de la "nueva lista" no esta en la "lista actual", insert
            if(encontrado === false){
                const estrategiaRol = new EstrategiaRol();
                estrategiaRol.orden = lista[i].orden;
                //estrategiaRol.activo = lista[i].activo;
                estrategiaRol.activo = true; // en teoria siempre se crea un nuevo registro en estado activo
                estrategiaRol.rol = { id: lista[i].rol.id };
                estrategiaRol.estrategia = { id: id_estrategia };
                crearEstrategiaRolRes = await estrategiaRolService.crear(client, estrategiaRol);
                winston.info("id nuevo de estrategiaRol:", crearEstrategiaRolRes);
                if(!crearEstrategiaRolRes || !crearEstrategiaRolRes[0].id){
                    await client.query("ROLLBACK");
                    response.resultado = 0,
                    response.mensaje = "Error al intentar crear EstrategiaRol."
                    res.status(200).json(response);
                    return;
                }
            }
        }

        // Si despues de todo el recorrido de la lista termina bien, commitear los cambios
        await client.query('COMMIT');
        response.resultado = 1;
        response.mensaje = "";
        res.status(200).json(response);
    } catch (error) {
        await client.query("ROLLBACK");
        winston.info("Error en estrategiaController.actualizarRolesDeEstrategia,", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
}

estrategiaController.listarUsuarioConRolPorIdEstrategia = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Usuarios con Rol."
        };
        let { id_estrategia } =  req.query;
        winston.info("req.query:", JSON.stringify(req.query));
        if(!id_estrategia || isNaN(id_estrategia) || id_estrategia < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_estrategia no es válido. Tipo de dato: '"+(typeof id_estrategia)+"', valor = "+id_estrategia;
            return res.status(200).json(response);
        }
        const listaResult = await estrategiaRolUsuarioService.listarPorIdEstrategia(postgresConn, id_estrategia);
        if(listaResult){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = listaResult;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en estrategiaController.listarUsuarioConRolPorIdEstrategia,", error);
        res.status(500).send(error);
    }
}

estrategiaController.listarRolesActivosDeEstrategiaSinUsuarioExceptoSolicitantePorId = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Usuarios con Rol."
        };
        let { id_estrategia } =  req.query;
        winston.info("req.query:", JSON.stringify(req.query));
        if(!id_estrategia || isNaN(id_estrategia) || id_estrategia < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_estrategia no es válido. Tipo de dato: '"+(typeof id_estrategia)+"', valor = "+id_estrategia;
            return res.status(200).json(response);
        }
        const listaResult = await rolService.listarRolesActivosDeEstrategiaSinUsuarioExceptoSolicitantePorIdEstrategia(postgresConn, id_estrategia);
        if(listaResult){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = listaResult;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en estrategiaController.listarRolesActivosDeEstrategiaSinUsuarioExceptoSolicitantePorId,", error);
        res.status(500).send(error);
    }
}

estrategiaController.listarUsuariosQueNoEstanAsignadosAUnaEstrategiaPorId = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Usuarios que no estan asignados a una Estrategia."
        };
        let { id_estrategia } =  req.query;
        winston.info("req.query:", JSON.stringify(req.query));
        if(!id_estrategia || isNaN(id_estrategia) || id_estrategia < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_estrategia no es válido. Tipo de dato: '"+(typeof id_estrategia)+"', valor = "+id_estrategia;
            return res.status(200).json(response);
        }
        //const listaUsuariosRes = await usuarioService.listarUsuariosQueNoEstanAsignadosAUnaEstrategiaRolPorIdEstrategia(postgresConn, id_estrategia);
        //Cambiamos el metodo que obtiene la lista de usuarios por cambios en reglas de negocio
        const listaUsuariosRes = await usuarioService.listarParaEstrategia(postgresConn);
        if(listaUsuariosRes){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = listaUsuariosRes;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en estrategiaController.listarUsuariosQueNoEstanAsignadosAUnaEstrategiaPorId,", error);
        res.status(500).send(error);
    }
}

estrategiaController.agregarUsuarioARolDeEstrategia = async (req, res) => {
    const client = await postgresConn.getClient();
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al agregar Usuario al Rol de una Estrategia."
        };
        let { id_usuario, id_estrategia_rol } = req.body;
        winston.info("req.body:", JSON.stringify(req.body));
        if(!id_usuario || isNaN(id_usuario) || id_usuario < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no es válido. Tipo de dato: '"+(typeof id_usuario)+"', valor = "+id_usuario;
            res.status(200).json(response);
            return;
        }
        if(!id_estrategia_rol || isNaN(id_estrategia_rol) || id_estrategia_rol < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_estrategia_rol no es válido. Tipo de dato: '"+(typeof id_estrategia_rol)+"', valor = "+id_estrategia_rol;
            res.status(200).json(response);
            return;
        }
        await client.query("BEGIN");
        /*
        // Logica anterior
        const buscarEstrategaRolRes = await estrategiaRolService.buscarPorId(client, id_estrategia_rol);
        if(buscarEstrategaRolRes){
            if(buscarEstrategaRolRes.length > 0){
                if(buscarEstrategaRolRes[0].id_estrategia){
                    winston.info("buscarEstrategaRolRes[0].id_estrategia:", buscarEstrategaRolRes[0].id_estrategia);
                    const buscarUsuaarioEnEstrategia = await estrategiaRolUsuarioService.listarSoloEstrategiaRolUsuarioPorIdEstrategia(client, buscarEstrategaRolRes[0].id_estrategia);
                    for(let i=0;i < buscarUsuaarioEnEstrategia.length;i++){
                        if(buscarUsuaarioEnEstrategia[i].id_usuario == id_usuario){
                            await client.query("ROLLBACK");
                            response.resultado = 0,
                            response.mensaje = `No se puede agregar el usuario con id ${id_usuario} a esta Estrategia porque ya esta asignado a un Rol de este.`
                            res.status(200).json(response);
                            return;
                        }
                    }
                }
                if(buscarEstrategaRolRes[0].id_rol > 0 && buscarEstrategaRolRes[0].id_rol != 1){ // Si no es rol Solicitante
                    const buscarEstrategiaRolUsuarioRes = await estrategiaRolUsuarioService.listarPorIdEstrategiaRol(client, id_estrategia_rol); // buscamos si hay usuarios con ese Rol en la Estrategia                
                    if(buscarEstrategiaRolUsuarioRes.length > 0){ // Se valida que no haya usuarios para Roles diferente a Solicitante en la Estrategia
                        await client.query("ROLLBACK");
                        response.resultado = 0,
                        response.mensaje = "No se puede agregar otro usuario a este Rol, solo se pueden agregar varios usuarios al Rol Solicitante para una Estrategia."
                        res.status(200).json(response);
                        return;
                    }                    
                } else {
                    const buscarEstrategiaRolUsuarioRes = await estrategiaRolUsuarioService.listarPorIdEstrategiaRol(client, id_estrategia_rol);
                    // buscar si el usuario que se desea agregar ya existe en EstrategiaRolUsuario
                    for(let i=0;i < buscarEstrategiaRolUsuarioRes.length;i++){
                        if(id_usuario == buscarEstrategiaRolUsuarioRes[i].id_usuario){
                            await client.query("ROLLBACK");
                            response.resultado = 0,
                            response.mensaje = `El usuario con id ${id_usuario} ya esta asociado al Rol y Estrategia. id_estrategia_rol= ${id_estrategia_rol}`;
                            res.status(200).json(response);
                            return;
                        }
                    }
                }
            } else {
                await client.query("ROLLBACK");
                response.resultado = 0,
                response.mensaje = "No se encontro EstrategaRol con el id "+id_estrategia_rol;
                res.status(200).json(response);
                return;
            }
        } else {
            await client.query("ROLLBACK");
            response.resultado = 0,
            response.mensaje = "Error al intentar buscar Rol de Estrategia."
            res.status(200).json(response);
            return;
        }
        
        const estrategiaRolUsuario = new EstrategiaRolUsuario();
        estrategiaRolUsuario.usuario = { id: id_usuario };
        estrategiaRolUsuario.estrategia_rol = { id: id_estrategia_rol };
        estrategiaRolUsuario.activo = true;
        const agregarUsuarioRes = await estrategiaRolUsuarioService.crear(client, estrategiaRolUsuario);
        winston.info("retornamos el id_usuario para verificar si se inserto correctamente, agregarUsuarioRes[0].id_usuario:", agregarUsuarioRes[0].id_usuario);
        if(agregarUsuarioRes && agregarUsuarioRes[0].id_usuario){
            await client.query('COMMIT');
            response.resultado = 1;
            response.mensaje = "";
        } else {
            await client.query("ROLLBACK");
            response.resultado = 0,
            response.mensaje = "Error al intentar crear Estrategia."
        }
        res.status(200).json(response);
        */

        /* 
        // Segunda logica: solo permite que el Usuario este en un Rol de la Estrategia
        const buscarEstrategaRolRes = await estrategiaRolService.buscarPorId(client, id_estrategia_rol);
        winston.info("buscarEstrategaRolRes: "+JSON.stringify(buscarEstrategaRolRes));
        let listaRolxUsuario = await estrategiaRolUsuarioService.listarEstrategiaRolUsuarioYEstrategiaRolPorIdEstrategia(client, buscarEstrategaRolRes[0].id_estrategia);
        winston.info("listaRolxUsuario: "+JSON.stringify(listaRolxUsuario));
        let accion = null;

        let listaIdRolesEstaUsuario = [];// lista donde se guardara los ids Roles donde se encuentre el usuario
        let coincideUsuarioYRol = false;
        let idCoincideUsuarioYRol = 0;
        for(let i=0;i < listaRolxUsuario.length; i++){
            if(id_usuario == listaRolxUsuario[i].id_usuario){//Usuario si esta en la Estrategia
                listaIdRolesEstaUsuario.push(listaRolxUsuario[i].id_rol);
                if(listaRolxUsuario[i].id_rol == buscarEstrategaRolRes[0].id_rol){
                    coincideUsuarioYRol = true;
                    idCoincideUsuarioYRol = i;				
                }
            }
        }

        if(listaIdRolesEstaUsuario.length > 0){
            if(coincideUsuarioYRol){
                if(listaRolxUsuario[idCoincideUsuarioYRol].activo === true){					
                    accion = 'mensajeError1';//Mensaje de Error: el usuario ya pertenece al Rol de la Estrategia
                } else {
                    accion = 'actualizar';//actualizar: activo = true; tabla EstrategiaRolUsuario
                }
            } else {
                accion = 'mensajeError2';//Mensaje de Error: el usuario ya pertenece a otro Rol de la Estrategia
            }
        } else {
            accion = 'crear';// crear, activo = true
        }

        // Validar accion
        winston.info("accion: "+accion);
        if(accion == "crear"){
            const estrategiaRolUsuario = new EstrategiaRolUsuario();
            estrategiaRolUsuario.usuario = { id: id_usuario };
            estrategiaRolUsuario.estrategia_rol = { id: id_estrategia_rol };
            estrategiaRolUsuario.activo = true;
            const agregarUsuarioRes = await estrategiaRolUsuarioService.crear(client, estrategiaRolUsuario);
            winston.info("retornamos el id_usuario para verificar si se inserto correctamente, agregarUsuarioRes[0].id_usuario:", agregarUsuarioRes[0].id_usuario);
            if(agregarUsuarioRes && agregarUsuarioRes[0].id_usuario){
                await client.query('COMMIT');
                response.resultado = 1;
                response.mensaje = "";
            } else {
                await client.query("ROLLBACK");
                response.resultado = 0,
                response.mensaje = "Error al intentar agregar Usuario al Rol de la Estrategia.";
            }
        } else if (accion == "actualizar"){
            const estrategiaRolUsuario = new EstrategiaRolUsuario();
            estrategiaRolUsuario.usuario = { id: id_usuario };
            estrategiaRolUsuario.estrategia_rol = { id: id_estrategia_rol };
            estrategiaRolUsuario.activo = true;
            const actualizar = await estrategiaRolUsuarioService.actualizarActivo(client, estrategiaRolUsuario);
            if(actualizar){
                await client.query('COMMIT');
                response.resultado = 1;
                response.mensaje = "";
            } else {
                await client.query("ROLLBACK");
                response.resultado = 0,
                response.mensaje = "Error al intentar actualizar Usuario al Rol de la Estrategia.";
            }
        } else if (accion == "mensajeError1"){
            await client.query("ROLLBACK");
            response.resultado = 0,
            response.mensaje = "Error, el usuario ya pertenece al Rol de la Estrategia.";
        }  else if (accion == "mensajeError2"){
            await client.query("ROLLBACK");
            response.resultado = 0,
            response.mensaje = "Error,el usuario ya pertenece a otro Rol de la Estrategia.";
        } else {
            await client.query("ROLLBACK");
            response.resultado = 0,
            response.mensaje = "Error no controlado al realizar la accion de agregar Usuario al Rol de la Estrategia.";
        }
        */

        // Nueva logica: que permita agregar usuarios a la estrategia, no importa si el mismo usuario esta en la estrategia
        //// buscar si el usuario ya esta asignado al Rol de la Estrategia
        const busquedaRes = await estrategiaRolUsuarioService.buscarPorId(client, id_estrategia_rol, id_usuario);
        winston.info("busquedaRes: "+JSON.stringify(busquedaRes));
        if(busquedaRes.length > 0){
            await client.query("ROLLBACK");
            response.resultado = 0,
            response.mensaje = "Error, ya esta agregado el Usuario al Rol de la Estrategia.";
            res.status(200).json(response);
            return;
        }

        // agregar
        const estrategiaRolUsuario = new EstrategiaRolUsuario();
        estrategiaRolUsuario.usuario = { id: id_usuario };
        estrategiaRolUsuario.estrategia_rol = { id: id_estrategia_rol };
        estrategiaRolUsuario.activo = true;
        const agregarUsuarioRes = await estrategiaRolUsuarioService.crear(client, estrategiaRolUsuario);
        winston.info("retornamos el id_usuario para verificar si se inserto correctamente, agregarUsuarioRes[0].id_usuario:", agregarUsuarioRes[0].id_usuario);
        if(agregarUsuarioRes && agregarUsuarioRes[0].id_usuario){
            await client.query('COMMIT');
            response.resultado = 1;
            response.mensaje = "";
        } else {
            await client.query("ROLLBACK");
            response.resultado = 0,
            response.mensaje = "Error al intentar agregar Usuario al Rol de la Estrategia.";
        }

        res.status(200).json(response);
    } catch (error) {
        await client.query("ROLLBACK");
        winston.info("Error en estrategiaController.agregarUsuarioARolDeEstrategia,", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
}

estrategiaController.actualizarActivoDeEstrategiaRolUsuario = async (req, res) => {
    const client = await postgresConn.getClient();
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al actualizar estado de Usuario en un Rol de una Estrategia."
        };
        let { id_usuario, id_estrategia_rol, activo } = req.body;
        winston.info("req.body:", JSON.stringify(req.body));
        if(!id_usuario || isNaN(id_usuario) || id_usuario < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no es válido. Tipo de dato: '"+(typeof id_usuario)+"', valor = "+id_usuario;
            res.status(200).json(response);
            return;
        }
        if(!id_estrategia_rol || isNaN(id_estrategia_rol) || id_estrategia_rol < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_estrategia_rol no es válido. Tipo de dato: '"+(typeof id_estrategia_rol)+"', valor = "+id_estrategia_rol;
            res.status(200).json(response);
            return;
        }
        if(activo === undefined){
            response.resultado = 0;
            response.mensaje = "El campo activo no es válido. Tipo de dato: '"+(typeof activo)+"', valor = "+activo;
            return res.status(200).json(response);
        }
        await client.query("BEGIN");
        const buscarEstrategiaRolUsuarioRes = await estrategiaRolUsuarioService.buscarPorId(client, id_estrategia_rol, id_usuario);
        if(buscarEstrategiaRolUsuarioRes.length < 1){
            await client.query("ROLLBACK");
            winston.info("buscarEstrategiaRolUsuarioRes:", buscarEstrategiaRolUsuarioRes);
            response.resultado = 0;
            response.mensaje = `No existe un Rol con Estrategia con id_estrategia_rol = ${id_estrategia_rol} y con id_usuario = ${id_usuario}`;
            res.status(200).json(response);
            return;
        }
        const estrategiaRolUsuario = new EstrategiaRolUsuario();
        estrategiaRolUsuario.activo = activo;
        estrategiaRolUsuario.estrategia_rol = { id: id_estrategia_rol };
        estrategiaRolUsuario.usuario = { id: id_usuario };
        //const estrategiaRolUsuarioServiceRes = await estrategiaRolUsuarioService.actualizarActivo(client, estrategiaRolUsuario);
        // cambiado 2021-03-18 (YYYY-MM-DD)
        const estrategiaRolUsuarioServiceRes = await estrategiaRolUsuarioService.borrar(client, estrategiaRolUsuario);
        winston.info("estrategiaRolUsuarioServiceRes: "+estrategiaRolUsuarioServiceRes);
        if(estrategiaRolUsuarioServiceRes){
            await client.query('COMMIT');
            response.resultado = 1;
            response.mensaje = "";
        } else {
            await client.query("ROLLBACK");
            response.resultado = 0,
            response.mensaje = "Error al intentar actualizar campo activo de Usuario de un Rol de una Estrategia."
        }
        res.status(200).json(response);
    } catch (error) {
        await client.query("ROLLBACK");
        winston.info("Error en estrategiaController.actualizarActivoDeEstrategiaRolUsuario,", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
}

estrategiaController.crearEstrategiaCorreo = async (req, res) => {
    const client = await postgresConn.getClient();
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al crear EstrategiaRol."
        };
        let { id_estrategia, correo, nombre } = req.body;
        nombre=(nombre?nombre:"");
        winston.info("id_estrategia: "+id_estrategia);
        if(!id_estrategia || isNaN(id_estrategia) || id_estrategia < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_estrategia no es válido. Tipo de dato: '"+(typeof id_estrategia)+"', valor = "+id_estrategia;
            return res.status(200).json(response);
        }
        await client.query("BEGIN");
        const estrategiaCorreo = new EstrategiaCorreo();
        estrategiaCorreo.correo = correo;
        estrategiaCorreo.nombre = nombre;
        estrategiaCorreo.id_estrategia = id_estrategia ;
        const estrategiaCorreoRes = await estrategiaCorreoService.crear(client, estrategiaCorreo);
        winston.info("id de la nueva estrategiaCorreo:", estrategiaCorreoRes[0].id);
        if(estrategiaCorreoRes && estrategiaCorreoRes[0].id){
            await client.query('COMMIT');
            response.resultado = 1;
            response.mensaje = "";
            response.id = estrategiaCorreoRes[0].id;
        } else {
            await client.query("ROLLBACK");
            response.resultado = 0,
            response.mensaje = "Error al intentar crear EstrategiaCorreo."
        }
        res.status(200).json(response);
    } catch (error) {
        await client.query("ROLLBACK");
        winston.info("Error en estrategiaController.crear EstrategiaCorreo,", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
}

estrategiaController.listarEstrategiaCorreo = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al listar Usuarios que no estan asignados a una Estrategia."
        };
        let { id_estrategia } =  req.query;
        winston.info("req.query:", JSON.stringify(req.query));
        if(!id_estrategia || isNaN(id_estrategia) || id_estrategia < 1){
            response.resultado = 0;
            response.mensaje = "El campo id_estrategia no es válido. Tipo de dato: '"+(typeof id_estrategia)+"', valor = "+id_estrategia;
            return res.status(200).json(response);
        }
        const listaResult = await estrategiaCorreoService.listarPorIdEstrategia(postgresConn, id_estrategia);
        if(listaResult){
            response.resultado = 1;
            response.mensaje = "";
            response.lista = listaResult;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en estrategiaController.listarUsuariosQueNoEstanAsignadosAUnaEstrategiaPorId,", error);
        res.status(500).send(error);
    }
}

estrategiaController.eliminarPorId = async (req, res) => {
    const response = {
        resultado: 0,
        mensaje: "Error inesperado al borrar eliminarPorId."
    }
    try {
        winston.info("req.body: "+JSON.stringify(req.body));
        let { id } = req.body;
        if(!id || isNaN(id) || id < 1){
            response.resultado = 0;
            response.mensaje = "El campo id no es válido. Tipo de dato: '"+(typeof id)+"', valor = "+id;
            res.status(200).json(response);
            return;
        }

        const borrarRes = await estrategiaCorreoService.eliminarPorId(postgresConn, id);
        if(!borrarRes){
            response.resultado = 0;
            response.mensaje = "Error, no se pudo borrar el correo de estrategia.";
        } else {
            response.resultado = 1;
            response.mensaje = "";
        }
        res.status(200).json(response);
    } catch (error) {
        winston.error("Error en estrategiaController.borrar,", error);
        res.status(500).send(error);
    }
}
module.exports = estrategiaController;