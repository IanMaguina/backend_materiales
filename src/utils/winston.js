const util = require('util');
const config = require('../config');
const { createLogger, format, transports } = require('winston');

function transform(info, opts) {
    const args = info[Symbol.for('splat')];
    if (args) { info.message = util.format(info.message, ...args); }
    return info;
}
  
function utilFormatter() { return {transform}; }

const logger = createLogger({
    level: 'debug',
    format: format.combine(
        //format.simple(),
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS'}), 
        utilFormatter(),       
        format.printf(info => {
                return `[${info.timestamp}] ${info.message}`
          }
        )
    ),
    transports: [
        new transports.File({
            maxsize: 5242880, // 5242880 Bytes = 5 MB
            maxFiles: 10,
            filename: config.winston.ruta
        }),
        new transports.Console({
            level: 'debug'
        })
    ],
    exitOnError: false, // do not exit on handled exceptions
});

/*
// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    write: function(message, encoding) {
      // use the 'info' log level so the output will be picked up by both transports (file and console)
      logger.info(message);
    },
};
*/
module.exports = logger;