"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getClients_1 = __importDefault(require("./getClients"));
const getClient_1 = __importDefault(require("./getClient"));
const createClient_1 = __importDefault(require("./createClient"));
const updateClient_1 = __importDefault(require("./updateClient"));
const deleteClient_1 = __importDefault(require("./deleteClient"));
const comments_1 = __importDefault(require("./comments"));
const express_1 = require("express");
const routes = (0, express_1.Router)({ mergeParams: true });
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
    res.set('Router', path);
    next();
});
/**
 * @api {get} /organizations/:org_id/clients Get organization clients
 */
routes.get('/', getClients_1.default);
/**
 * @api {get} /organizations/:org_id/clients/:client_id Get organization client
 */
routes.get('/:client_id', getClient_1.default);
/**
 * @api {post} /organizations/:org_id/clients Add to organization
 */
routes.post('/', createClient_1.default);
/**
 * @api {put} /organizations/:org_id/clients/:client_id Update organization client
 */
routes.put('/:client_id', updateClient_1.default);
/**
 * @api {delete} /organizations/:org_id/clients/:client_id Remove from organization
 */
routes.delete('/:client_id', deleteClient_1.default);
/**
 * @api {use} /organizations/:org_id/clients/:client_id/comments Client comments
 */
routes.use('/:client_id/comments', comments_1.default);
exports.default = routes;
