import winston from 'winston';

// logger configuration file， both production and development
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    (winston.format.timestamp(), // timestamp
    winston.format.errors({ stack: true }),
    winston.format.json())
  ),
  defaultMeta: { service: 'super-node-express-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), // error log
    new winston.transports.File({ filename: 'logs/combined.log' }), // combined log
  ],
});

// in console, only in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;
