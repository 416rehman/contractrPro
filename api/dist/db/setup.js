"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const logger_1 = __importDefault(require("../utils/logger"));
const drizzle_orm_1 = require("drizzle-orm");
exports.default = async () => {
    try {
        await index_1.db.execute((0, drizzle_orm_1.sql) `SELECT 1`);
        logger_1.default.info('Database connection established successfully.');
        if (process.env.NODE_ENV === 'development') {
            logger_1.default.debug(`Running in ${process.env.NODE_ENV} mode`);
            // Migrations are handled by drizzle-kit
            // Populate logic to be restored later
        }
    }
    catch (err) {
        logger_1.default.error(`Unable to connect to the database: ${err}.\n Make sure the database server is running.`);
        throw err;
    }
};
