"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const logger_1 = __importDefault(require("./utils/logger"));
const server_1 = __importDefault(require("./server"));
const setup_1 = __importDefault(require("./db/setup"));
try {
    // parse int from env
    const port = parseInt(process.env.PORT || '4000', 10);
    (0, setup_1.default)()
        .then(() => {
        server_1.default.listen(port, async () => {
            logger_1.default.info(`Server is running on port ${port}`);
            logger_1.default.info(`Database ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE} is connected`);
            logger_1.default.info(`Environment: ${process.env.NODE_ENV}`);
            logger_1.default.info(`Client URL: ${process.env.CLIENT_URL}`);
            logger_1.default.info(`Client URL (dev): ${process.env.CLIENT_URL_DEV}`);
        });
    })
        .catch((err) => {
        logger_1.default.error(`Unable to connect to the database: ${err}`);
    });
}
catch (error) {
    // Global error handler
    logger_1.default.error({ error }, 'Unhandled exception');
}
