"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getUser_1 = __importDefault(require("./getUser"));
const changeEmail_1 = __importDefault(require("./changeEmail"));
const changePhone_1 = __importDefault(require("./changePhone"));
const changeAvatar_1 = __importDefault(require("./changeAvatar"));
const changeName_1 = __importDefault(require("./changeName"));
const express_1 = require("express");
const routes = (0, express_1.Router)();
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
    res.set('Router', path);
    next();
});
/**
 * @api {get} /me Get the current signedInUser
 */
routes.post('/', getUser_1.default);
/**
 * @api {post} /me/email Change the signedInUser's email address - sends a verification token to the new email
 * Once the signedInUser verifies the new email in the /confirm route, the email will be changed
 */
routes.post('/email', changeEmail_1.default);
/**
 * @api {post} /me/phone Change the signedInUser's phone number - sends a verification token to the new phone number
 * Once the signedInUser verifies the new phone number in the /confirm route, the phone number will be changed
 */
routes.post('/phone', changePhone_1.default);
/**
 * @api {post} /me/password Change the signedInUser's avatarUrl
 */
routes.post('/avatar', changeAvatar_1.default);
/**
 * @api {post} /me/name Change the signedInUser's name
 */
routes.post('/name', changeName_1.default);
exports.default = routes;
