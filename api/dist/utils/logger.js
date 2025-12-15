"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
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
const logger = (0, pino_1.default)(options);
exports.default = logger;
