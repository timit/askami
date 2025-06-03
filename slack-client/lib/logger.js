const winston = require('winston');

//initialize winston (logging) using environment variables
const LEVEL = Symbol.for('level');
function filterOnly(level) {
  return winston.format(function (info) {
    if (info[LEVEL] === level) {
      return info;
    }
  })();
};
const logLevels = {
    error: 0, 
    warn: 1, 
    info: 2, 
    debug: 3,
    usage: 4
};
const logColors = {
    error: 'bold red', 
    warn: 'yellow', 
    info: 'white', 
    debug: 'green',
    usage: 'cyan'
};
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    winston.format.align(),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);
const logTransports = [
    new winston.transports.Console({
        level: process.env.LOGGER_LEVEL,
        format: winston.format.combine(logFormat,winston.format.colorize({ all: true }))
    })
];
const logger = winston.createLogger({
    levels: logLevels,
    transports: logTransports
});
winston.addColors(logColors);

module.exports = logger;