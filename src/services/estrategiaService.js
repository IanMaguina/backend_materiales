const winston = require('../utils/winston');
const Sociedad = require('../domain/sociedad');
const EscenarioNivel1 = require('../domain/escenarioNivel1');
const EscenarioNivel2 = require('../domain/escenarioNivel2');
const EscenarioNivel3 = require('../domain/escenarioNivel3');
const TipoSolicitud = require('../domain/tipoSolicitud');
//const Usuario = require('../domain/usuario');
const Rol = require('../domain/rol');
const EstrategiaRol = require('../domain/estrategiaRol');
const Estrategia = require('../domain/estrategia');
const estrategiaService = {};

function extractEstrategiaRolFromResposne(aRow){
    const rol = new Rol();
    rol.id = aRow.id_rol;
    rol.nombre = aRow.rol_nombre;
    const estrategia = new Estrategia();
    estrategia.id = aRow.id_estrategia;
    const estrategiaRol = new EstrategiaRol();
    estrategiaRol.id = aRow.id;
    estrategiaRol.orden = aRow.orden;
    estrategiaRol.rol = rol;
    estrategiaRol.estrategia = estrategia;
    estrategiaRol.activo = aRow.activo;
    return estrategiaRol;
}

function extractEstrategiaFromResposne(aRow){
    const tipoSolicitud = new TipoSolicitud();
    tipoSolicitud.id = aRow.id_tipo_solicitud ? aRow.id_tipo_solicitud : null;
    tipoSolicitud.nombre = aRow.tipo_solicitud_nombre ? aRow.tipo_solicitud_nombre : null;
    const sociedad = new Sociedad();
    sociedad.id = aRow.id_sociedad;
    sociedad.codigo_sap = aRow.sociedad_codigo_sap;
    const escenarioNivel1 = new EscenarioNivel1();
    escenarioNivel1.id = aRow.id_escenario_nivel1;
    escenarioNivel1.codigo = aRow.escenario_nivel1_codigo;
    escenarioNivel1.nombre = aRow.escenario_nivel1_nombre;
    escenarioNivel1.sociedad = sociedad;
    const escenarioNivel2 = new EscenarioNivel2();
    escenarioNivel2.id = aRow.id_escenario_nivel2;
    escenarioNivel2.codigo = aRow.escenario_nivel2_codigo;
    escenarioNivel2.nombre = aRow.escenario_nivel2_nombre;
    escenarioNivel2.escenario_nivel1 = escenarioNivel1;
    const escenarioNivel3 = new EscenarioNivel3();
    escenarioNivel3.id = aRow.id_escenario_nivel3;
    escenarioNivel3.codigo = aRow.escenario_nivel3_codigo;
    escenarioNivel3.nombre = aRow.escenario_nivel3_nombre;
    escenarioNivel3.escenario_nivel2 = escenarioNivel2;
    const estrategia = new Estrategia();
    estrategia.id = aRow.id;
    estrategia.escenario_nivel3 = escenarioNivel3;
    estrategia.tipo_solicitud = tipoSolicitud;
    return estrategia;
}

estrategiaService.listarPorFiltros = async (conn, filtros) => {
    try {
        let queryFinal;
        let selectQuery = "SELECT estrategia.*, en3.codigo as escenario_nivel3_codigo, en3.nombre as escenario_nivel3_nombre"
        +", en3.id_escenario_nivel2, en2.codigo as escenario_nivel2_codigo, en2.nombre as escenario_nivel2_nombre"
        +", en2.id_escenario_nivel1, en1.codigo as escenario_nivel1_codigo, en1.nombre as escenario_nivel1_nombre"
        +", en1.id_sociedad, sociedad.codigo_sap as sociedad_codigo_sap"
        +", tipo_solic.nombre as tipo_solicitud_nombre"
        let fromQuery = " FROM dino.testrategia estrategia"
        +" JOIN dino.tescenario_nivel3 en3 ON en3.id=estrategia.id_escenario_nivel3"
        +" JOIN dino.tescenario_nivel2 en2 ON en2.id=en3.id_escenario_nivel2"
        +" JOIN dino.tescenario_nivel1 en1 ON en1.id=en2.id_escenario_nivel1"
        +" JOIN dino.tsociedad sociedad ON sociedad.id=en1.id_sociedad"
        +" JOIN dino.ttipo_solicitud tipo_solic ON tipo_solic.id=estrategia.id_tipo_solicitud"
        let whereCondition = "";
        let queryParameters = [];
        let parameterNames = [];// array donde guardamos si existe o no existe un campo del filtro
        if(filtros.id_sociedad){
            parameterNames.push("id_sociedad");
        }
        if(filtros.id_escenario_nivel1){
            parameterNames.push("id_escenario_nivel1");
        }
        if(filtros.id_escenario_nivel2){
            parameterNames.push("id_escenario_nivel2");
        }
        if(filtros.id_escenario_nivel3){
            parameterNames.push("id_escenario_nivel3");
        }
        if(filtros.id_tipo_solicitud){
            parameterNames.push("id_tipo_solicitud");
        }

        if(parameterNames.length > 0){
            whereCondition = " WHERE";
        }

        let i=0;
        for(;i < parameterNames.length;){
            if(i > 0){
                whereCondition = whereCondition + " AND"
            }
            if(parameterNames[i] == "id_sociedad"){
                whereCondition = whereCondition + " sociedad.id=$"+(i+1);
                queryParameters.push(filtros.id_sociedad);
            } else if(parameterNames[i] == "id_escenario_nivel1"){
                whereCondition = whereCondition + " en1.id=$"+(i+1);
                queryParameters.push(filtros.id_escenario_nivel1);
            } else if(parameterNames[i] == "id_escenario_nivel2"){
                whereCondition = whereCondition + " en2.id=$"+(i+1);
                queryParameters.push(filtros.id_escenario_nivel2);
            } else if(parameterNames[i] == "id_escenario_nivel3"){
                whereCondition = whereCondition + " en3.id=$"+(i+1);
                queryParameters.push(filtros.id_escenario_nivel3);
            } else if(parameterNames[i] == "id_tipo_solicitud"){
                whereCondition = whereCondition + " tipo_solic.id=$"+(i+1);
                queryParameters.push(filtros.id_tipo_solicitud);
            }
            i = i + 1;
        }
        queryFinal = selectQuery + fromQuery + whereCondition;
        const queryResponse = await conn.query(queryFinal, queryParameters);
        const response = [];
        for(let i=0;i < queryResponse.rows.length;i++){
            response.push(extractEstrategiaFromResposne(queryResponse.rows[i]));
        }
        return response;
    } catch (error) {
        //winston.info("Error en estrategiaService.listarPorFiltros, ");
        error.stack = "\nError en estrategiaService.listarPorFiltros, " + error.stack;
        throw error;
    }
}

estrategiaService.crear = async (conn, estrategia) => {
    try {
        const queryResponse = await conn.query("INSERT INTO dino.testrategia (id_escenario_nivel3, id_tipo_solicitud, id_usuario_enviar_correo) VALUES($1, $2, $3) RETURNING id",
        [estrategia.escenario_nivel3.id, estrategia.tipo_solicitud.id, estrategia.usuario_enviar_correo.id]);
        return queryResponse.rows;
    } catch (error) {
        //winston.info("Error en estrategiaService.crear, ");
        error.stack ="\nError en estrategiaService.crear, "+error.stack;
        throw error;
    }
}

estrategiaService.listarEstrategiaRolPorIdEstrategia = async (conn, id_estrategia) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.testrategia_rol est_rol where est_rol.id_estrategia=$1",[id_estrategia]);
        return queryResponse.rows;
    } catch (error) {
        winston.info("Error en estrategiaService.listarEstrategiaRolPorIdEstrategia, ");
        throw error;
    }
}

estrategiaService.listarEstrategiaRolYRolPorId = async (conn, id_estrategia) => {
    try {
        const queryResponse = await conn.query("SELECT est_rol.*, rol.nombre as rol_nombre FROM dino.testrategia_rol est_rol join dino.trol rol on rol.id=est_rol.id_rol where est_rol.id_estrategia=$1 order by est_rol.orden",[id_estrategia]);
        const response = [];
        for(let i=0;i < queryResponse.rows.length;i++){
            response.push(extractEstrategiaRolFromResposne(queryResponse.rows[i]));
        }
        return response;
    } catch (error) {
        winston.info("Error en estrategiaService.listarEstrategiaRolYRolPorId, ");
        throw error;
    }
}

estrategiaService.listarIdsConSumaDeIdRolActivosDeEstrategia = async (conn, listaIdsEstrategia) => {
    try {
        let whereCondition = " where est.id in (";
        let idsString = "";
        for(let i=0;i < listaIdsEstrategia.length;i++){
            idsString = idsString + "$"+(i+1);
            if((i+1) < listaIdsEstrategia.length){
                idsString = idsString + ","
            }
        }
        whereCondition = whereCondition + idsString + ")";
        const queryFinal = "SELECT est.id, sum("
        +"CASE WHEN est_rol.id_rol IS NULL THEN 0"
        +" ELSE"
        +"    CASE WHEN est_rol.activo != true THEN 0 ELSE est_rol.id_rol END"
        +" END) as suma"
        +" FROM dino.testrategia est left join dino.testrategia_rol est_rol on est_rol.id_estrategia=est.id"
        +whereCondition+" group by est.id";
        winston.info("idsString: "+idsString+" ::> queryFinal: "+queryFinal);
        const queryResponse = await conn.query(queryFinal,listaIdsEstrategia);
        return queryResponse.rows;
    } catch (error) {
        error.stack = `\nError en estrategiaService.listarIdsConSumaDeIdRolActivosDeEstrategia, ${error.stack}`;
        throw error;
    }
}

module.exports = estrategiaService;