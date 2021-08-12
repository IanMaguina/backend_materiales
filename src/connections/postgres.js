const winston = require('../utils/winston');
const config = require('../config');
const { Pool } = require('pg');

const types = require('pg').types;

types.setTypeParser(1114, function (stringValue) {

  var temp = new Date(stringValue);
  return new Date(Date.UTC(
    temp.getFullYear(), temp.getMonth(), temp.getDate(), temp.getHours(), temp.getMinutes(), temp.getSeconds(), temp.getMilliseconds())
  );
});


const pool = new Pool({
  user: config.postgres.user,
  host: config.postgres.host,
  password: process.env.PGPASSWORD || config.postgres.password,
  //host: '34.68.69.211',
  //password: 'oI1szyfnnxm5cC2N',
  // host: '10.10.0.18',
  // password: 'Pass_sigc-1',
  port: config.postgres.port,
  database: config.postgres.database,
  socketPath: config.postgres.host,

  // maximum number of clients the pool should contain
  // by default this is set to 10.
  max: 20,

  // number of milliseconds a client must sit idle in the pool and not be checked out
  // before it is disconnected from the backend and discarded
  // default is 10000 (10 seconds) - set to 0 to disable auto-disconnection of idle clients
  idleTimeoutMillis: 60000 * 15,

  // number of milliseconds to wait before timing out when connecting a new client
  // by default this is 0 which means no timeout
  connectionTimeoutMillis: 6000,
});

module.exports = {
  async query(text, params) {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start

    //winston.info("conn: " + config.postgres.host);
    //winston.info('executed query '+ JSON.stringify({ text, duration, rows: res.rowCount }))
    return res
  },
  async getClient() {
    const client = await pool.connect()
    const query = client.query
    const release = client.release
    // set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
      //console.error('A client has been checked out for more than 5 seconds!')
      winston.info('A client has been checked out for more than 5 seconds!')
      //console.error(`The last executed query on this client was: ${client.lastQuery}`)
      winston.info(`The last executed query on this client was: ${client.lastQuery}`)
    }, 5000)
    // monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args
      return query.apply(client, args)
    }
    client.release = () => {
      // clear our timeout
      clearTimeout(timeout)
      // set the methods back to their old un-monkey-patched version
      client.query = query
      client.release = release
      return release.apply(client)
    }
    return client
  }
};