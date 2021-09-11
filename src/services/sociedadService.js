const winston = require('../utils/winston');
const service = {};

service.listarTodo = async (conn) => {
    try {
        const queryResponse = await conn.query("SELECT * FROM dino.tsociedad",[]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en sociedadService.listarTodo, "+error.stack;
        throw error;
    }
    
};

service.listar  = async (conn, id_escenario_nivel3) => {
    try {
        const queryResponse = await conn.query("SELECT s.id, s.codigo_sap, s.nombre \
            FROM dino.tescenario_nivel3 en3 \
            INNER JOIN dino.tescenario_nivel2 en2 ON en2.id = en3.id_escenario_nivel2 \
            INNER JOIN dino.tescenario_nivel1 en1 ON en1.id = en2.id_escenario_nivel1 \
            INNER JOIN dino.tsociedad s ON s.id = en1.id_sociedad \
            WHERE en3.id = $1", [id_escenario_nivel3]);
        
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en sociedadService.listar, "+error.stack;
        throw error;
    }
    
};

service.obtenerPorSolicitud  = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query("select so.id, so.codigo_sap, so.nombre \
        from dino.tsolicitud s \
        inner join dino.tescenario_nivel3 en3 on en3.id = s.id_escenario_nivel3 \
        inner join dino.tescenario_nivel2 en2 on en2.id = en3.id_escenario_nivel2 \
        inner join dino.tescenario_nivel1 en1 on en1.id = en2.id_escenario_nivel1 \
        inner join dino.tsociedad so on so.id = en1.id_sociedad \
        where s.id = $1", [id_solicitud]);
        
        if(queryResponse.rows.length > 0){
            return queryResponse.rows[0];
        }else{
            return null;
        }

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en sociedadService.listar, "+error.stack;
        throw error;
    }
    
};

module.exports = service;