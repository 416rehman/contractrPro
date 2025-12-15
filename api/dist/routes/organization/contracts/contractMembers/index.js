"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getContractMembers_1 = __importDefault(require("./getContractMembers"));
const getContractMember_1 = __importDefault(require("./getContractMember"));
const createContractMember_1 = __importDefault(require("./createContractMember"));
const updateContractMember_1 = __importDefault(require("./updateContractMember"));
const deleteContractMember_1 = __importDefault(require("./deleteContractMember"));
const express_1 = require("express");
const routes = (0, express_1.Router)({ mergeParams: true });
/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/members Get all members by contract
 */
routes.get('/', getContractMembers_1.default);
/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/members/:member_id Get contract member by id
 */
routes.get('/:member_id', getContractMember_1.default);
/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/members Create contract member
 */
routes.post('/', createContractMember_1.default);
/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/members/:member_id Update contract member
 */
routes.put('/:member_id', updateContractMember_1.default);
/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/members/:member_id Delete contract member
 */
routes.delete('/:member_id', deleteContractMember_1.default);
exports.default = routes;
