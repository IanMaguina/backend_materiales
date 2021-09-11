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

module.exports = service;