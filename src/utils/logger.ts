import winston, { createLogger, transports } from 'winston';

function getFormat() {
  return winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
    winston.format.printf(
      (info) =>
        `[${info.timestamp}] ${info.level}: ${info.message}. ${JSON.stringify(info)}`,
    ),
  );
}

const logger = createLogger({
  transports: [
    new transports.File({
      format: getFormat(),
      filename: 'logs/error.log',
      level: 'error',
    }),
    new transports.File({
      format: getFormat(),
      filename: 'logs/combined.log',
    }),
  ],
});

export function enableConsole() {
  // If we are not in production, then log to the `console` with the format:
  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
    );
  }
}

export default logger;
