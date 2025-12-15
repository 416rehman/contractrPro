"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getUsers_1 = __importDefault(require("./getUsers"));
const me_1 = __importDefault(require("./me"));
const getUser_1 = __importDefault(require("./me/getUser"));
const getUserWithOrganizations_1 = __importDefault(require("./getUserWithOrganizations"));
const leaveOrganization_1 = __importDefault(require("./leaveOrganization"));
const meHandler_1 = __importDefault(require("../../middleware/meHandler"));
const express_1 = require("express");
const routes = (0, express_1.Router)();
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
    res.set('Router', path);
    next();
});
/**
 * @api {get} /users Get all users
 */
routes.get('/', getUsers_1.default);
/**
 * @api {use} /me Get the current signedInUser
 */
routes.use('/me', me_1.default);
/**
 * @api {get} /users/:user_id Get a signedInUser by id
 */
routes.get('/:user_id', meHandler_1.default, getUser_1.default);
/**
 * @api {get} /users/:user_id/organizations Get organizations of a signedInUser
 */
routes.get('/:user_id/organizations', meHandler_1.default, getUserWithOrganizations_1.default);
/**
 * @api {delete} /users/:user_id/organizations/:org_id leave the organization
 */
routes.delete('/:user_id/organizations/:org_id', meHandler_1.default, leaveOrganization_1.default);
exports.default = routes;
