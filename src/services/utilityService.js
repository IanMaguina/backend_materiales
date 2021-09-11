const service = {};

service.extractSegundosEnBigintDeRestarTimestampString = async (conn, param1, param2) => {
    try {
        const queryResponse = await conn.query("SELECT EXTRACT(EPOCH FROM (TO_TIMESTAMP($1, 'YYYY-MM-DD HH24:MI:SS') - TO_TIMESTAMP($2, 'YYYY-MM-DD HH24:MI:SS')))::bigint as segundos"
        ,[param1, param2]);
        return queryResponse.rows;
    } catch (error) {
        error.stack ="\nError en utilityService.extractSegundosEnBigintDeRestarTimestampString, " + error.stack;
        throw error;
    }
}

module.exports = service;