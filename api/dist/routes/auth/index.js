"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postLogin_1 = __importDefault(require("./postLogin"));
const token_1 = __importDefault(require("./token"));
const postAccount_1 = __importDefault(require("./postAccount"));
const deleteAccount_1 = __importDefault(require("./deleteAccount"));
const logout_1 = __importDefault(require("./logout"));
const forgot_1 = __importDefault(require("./forgot"));
const validationMiddleware_1 = require("../../middleware/validationMiddleware");
const authMiddleware_1 = __importDefault(require("../../middleware/authMiddleware"));
const auth_validator_1 = require("../../validators/auth-validator");
const express_1 = require("express");
const routes = (0, express_1.Router)();
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
    res.set('Router', path);
    next();
});
/**
 * @api {post} /auth/login Gets the signedInUser's refresh token
 * @apiName Login
 */
routes.post('/login', auth_validator_1.GetAccountTokenValidator, validationMiddleware_1.ValidationErrorsHandler, postLogin_1.default);
/**
 * @api {post} /auth/ Use refresh token to get new access token
 * @apiName GetAccountToken
 */
routes.post('/token', token_1.default);
/**
 * @api {post} /auth/account Register new account
 * @apiName RegisterAccount
 */
routes.post('/account', auth_validator_1.RegisterAccountValidator, validationMiddleware_1.ValidationErrorsHandler, postAccount_1.default);
/**
 * @api {delete} /auth/account Delete account
 * @apiName DeleteAccount
 */
routes.delete('/account', authMiddleware_1.default, deleteAccount_1.default);
/**
 * @api {get} /auth/logout Logout - Clears the cookie if it exists
 * @apiName Logout
 */
routes.get('/logout', logout_1.default);
/**
 * @api {post} /auth/forgot Sends a password reset token to the signedInUser's email
 */
routes.post('/forgot', forgot_1.default);
exports.default = routes;
