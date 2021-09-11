const winston = require('../utils/winston');
const Sociedad = require('../domain/sociedad');
const EscenarioNivel1 = require('../domain/escenarioNivel1');
const escenarioNivel1Service = {};

function extratcEscenarioNivel1FromResponse(aRow){
    const id = aRow.id ? aRow.id : null;
    const codigo = aRow.codigo ? aRow.codigo : null;
    const nombre = aRow.nombre ? aRow.nombre : null;
    const id_sociedad = aRow.id_sociedad ? aRow.id_sociedad : null;
    const sociedad_codigo_sap = aRow.sociedad_codigo_sap ? aRow.sociedad_codigo_sap: null;
    const sociedad_nombre = aRow.sociedad_nombre ? aRow.sociedad_nombre: null;
    const sociedad = new Sociedad();
    sociedad.id = id_sociedad;
    sociedad.codigo_sap = sociedad_codigo_sap;
    sociedad.nombre = sociedad_nombre;
    const escenarioNivel1 = new EscenarioNivel1();
    escenarioNivel1.id = id;
    escenarioNivel1.codigo = codigo;
    escenarioNivel1.nombre = nombre;
    escenarioNivel1.sociedad = sociedad;
    return escenarioNivel1;
}

escenarioNivel1Service.listarPorIdSociedad = async (conn, id_sociedad) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.tescenario_nivel1 en1 where en1.id_sociedad=$1",[id_sociedad]);
        const response = [];
        for(let i=0;i < queryResponse.rows.length;i++){
            response.push(extratcEscenarioNivel1FromResponse(queryResponse.rows[i]));
        }
        return response;
    } catch (error) {
        winston.info("Error en escenarioNivel1Service.listarPorIdSociedad, ");
        throw error;
    }
}

escenarioNivel1Service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.tescenario_nivel1",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en escenarioNivel1Service.listarTodo, " + error.stack;
        throw error;
    }
}

module.exports = escenarioNivel1Service;