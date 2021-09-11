const config = require('./config');
const winston = require('./utils/winston');
const app = require('./index');

app.listen(config.express.port, function (error) {
  if (error) {
    winston.info('Unable to listen for connections', error)
    process.exit(10)
  }
  winston.info('express is listening on http://' +
    //config.express.ip + ':' + 
    config.express.port)
});