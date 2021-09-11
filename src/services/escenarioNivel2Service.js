const winston = require('../utils/winston');
const EscenarioNivel1 = require('../domain/escenarioNivel1');
const EscenarioNivel2 = require('../domain/escenarioNivel2');
const escenarioNivel2Service = {};

function extractEscenarioNivel2FromResponse(aRow){
    const id = aRow.id ? aRow.id : null;
    const codigo = aRow.codigo ? aRow.codigo : null;
    const nombre = aRow.nombre ? aRow.nombre : null;
    const id_escenario_nivel1 =  aRow.id_escenario_nivel1 ? aRow.id_escenario_nivel1 : null;
    const escenario_nivel1_codigo = aRow.escenario_nivel1_codigo ? aRow.escenario_nivel1_codigo : null;
    const escenario_nivel1_nombre = aRow.escenario_nivel1_nombre ? aRow.escenario_nivel1_nombre : null;
    const escenario_nivel1 = new EscenarioNivel1();
    escenario_nivel1.id = id_escenario_nivel1;
    escenario_nivel1.codigo = escenario_nivel1_codigo;
    escenario_nivel1.nombre = escenario_nivel1_nombre;
    const escenarioNivel2 = new EscenarioNivel2();
    escenarioNivel2.id = id;
    escenarioNivel2.codigo = codigo;
    escenarioNivel2.nombre = nombre;
    escenarioNivel2.escenario_nivel1 = escenario_nivel1;
    return escenarioNivel2;
}

escenarioNivel2Service.listarPorIdEscenarioNivel1 = async (conn, id_escenario_nivel1) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.tescenario_nivel2 en2 where en2.id_escenario_nivel1=$1",[id_escenario_nivel1]);
        const response = [];
        for(let i=0;i < queryResponse.rows.length;i++){
            response.push(extractEscenarioNivel2FromResponse(queryResponse.rows[i]));
        }
        return response;
    } catch (error) {
        winston.info("Error en escenarioNivel2Service.listarPorIdEscenarioNivel1, ");
        throw error;
    }
}

module.exports = escenarioNivel2Service;