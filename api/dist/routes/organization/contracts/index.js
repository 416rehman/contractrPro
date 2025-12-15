"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getContracts_1 = __importDefault(require("./getContracts"));
const getContractById_1 = __importDefault(require("./getContractById"));
const createContract_1 = __importDefault(require("./createContract"));
const updateContract_1 = __importDefault(require("./updateContract"));
const deleteContract_1 = __importDefault(require("./deleteContract"));
const contractMembers_1 = __importDefault(require("./contractMembers"));
const comments_1 = __importDefault(require("./comments"));
const express_1 = require("express");
const routes = (0, express_1.Router)({ mergeParams: true });
const jobs_1 = __importDefault(require("./jobs"));
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
    res.set('Router', path);
    next();
});
/**
 * @api {get} /organizations/:org_id/contracts/ Get all contracts by organization
 */
routes.get('/', getContracts_1.default);
/**
 * @api {get} /organizations/:org_id/contracts/:contract_id Get organization contract by id
 */
routes.get('/:contract_id', getContractById_1.default);
/**
 * @api {post} /organizations/:org_id/contracts/ Create organization contract
 */
routes.post('/', createContract_1.default);
/**
 * @api {put} /organizations/:org_id/contracts/:contract_id Update organization contract
 */
routes.put('/:contract_id', updateContract_1.default);
/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id Delete organization contract
 */
routes.delete('/:contract_id', deleteContract_1.default);
/*####################################Entry Routes END####################################################*/
/**
 * @api {use} /organizations/:org_id/contracts/:contract_id/members Get all members by contract
 */
routes.use('/:contract_id/members', contractMembers_1.default);
/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs Get all jobs by contract
 * @type {Router}
 */
routes.use('/:contract_id/jobs', jobs_1.default);
/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/comments Get all comments by contract
 * @type {Router}
 */
routes.use('/:contract_id/comments', comments_1.default);
exports.default = routes;
