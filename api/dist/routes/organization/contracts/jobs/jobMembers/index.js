"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getJobMembers_1 = __importDefault(require("./getJobMembers"));
const getJobMember_1 = __importDefault(require("./getJobMember"));
const createJobMember_1 = __importDefault(require("./createJobMember"));
const deleteJobMember_1 = __importDefault(require("./deleteJobMember"));
const updateJobMember_1 = __importDefault(require("./updateJobMember"));
const express_1 = require("express");
const routes = (0, express_1.Router)({ mergeParams: true });
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
    res.set('Router', path);
    next();
});
/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members Get organization contract job members
 */
routes.get('/', getJobMembers_1.default);
/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members/:member_id Get organization contract job member
 */
routes.get('/:member_id', getJobMember_1.default);
/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members Add member to organization contract job
 */
routes.post('/', createJobMember_1.default);
/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members Remove member from organization contract job
 */
routes.delete('/:member_id', deleteJobMember_1.default);
/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members/:member_id Update organization contract job member
 */
routes.put('/:member_id', updateJobMember_1.default);
exports.default = routes;
