"use strict";
/**
 * Model: https://www.figma.com/file/oXjOLhFELvDrGkTz8BIJUI/Untitled
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const logger_1 = __importDefault(require("./utils/logger"));
const response_1 = require("./utils/response");
const routes_1 = __importDefault(require("./routes"));
const pino_http_1 = __importDefault(require("pino-http"));
const app = (0, express_1.default)();
app.use((0, pino_http_1.default)({
    // Use our default logger instance, which is already configured
    logger: logger_1.default,
}));
const corsOptions = {
    origin: [process.env.CLIENT_URL || '', process.env.CLIENT_URL_DEV || ''],
    methods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS', 'PUT', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, helmet_1.default)());
app.disable('x-powered-by');
// if development.
if (process.env.NODE_ENV === 'development') {
    // middleware to see the router path in the "Router" header for debugging
    app.use((req, res, next) => {
        const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
        res.set('Router', path);
        next();
    });
}
app.use('/', routes_1.default);
app.use((req, res) => {
    return res.status(404).json((0, response_1.createErrorResponse)('Cannot find this route'));
});
exports.default = app;
