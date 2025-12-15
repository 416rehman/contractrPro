"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../utils/response");
const db_1 = require("../../db");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const utils_1 = require("../../utils");
/**
 * @api {post} /auth/login Gets the user's refresh token
 * @apiName Login
 */
exports.default = async (req, res) => {
    try {
        const body = (0, utils_1.pick)(req.body, ['username', 'email', 'password']);
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.or)(body.username ? (0, drizzle_orm_1.eq)(db_1.users.username, body.username) : undefined, body.email ? (0, drizzle_orm_1.eq)(db_1.users.email, body.email) : undefined)
        });
        if (!user)
            return res.status(400).json((0, response_1.createErrorResponse)('User not found'));
        const isValidPass = await bcrypt_1.default.compareSync(body.password, user.password);
        if (!isValidPass) {
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid password'));
        }
        return res.json((0, response_1.createSuccessResponse)({
            refreshToken: user.refreshToken,
            message: 'Use this refresh token at the /auth/token endpoint to get an access token and set the cookie.',
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
