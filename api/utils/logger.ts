import pino from 'pino';

// Use `info` as our standard log level if not specified
const options = { level: process.env.LOG_LEVEL || 'info' };

// @ts-ignore
options.transport = {
    target: 'pino-pretty',
    options: {
        colorize: true,
    },
};

// Create and export a Pino Logger instance:
// https://getpino.io/#/docs/api?id=logger
const logger = pino(options);
export default logger;
