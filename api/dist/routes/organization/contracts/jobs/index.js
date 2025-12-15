"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getJobs_1 = __importDefault(require("./getJobs"));
const getJob_1 = __importDefault(require("./getJob"));
const postJob_1 = __importDefault(require("./postJob"));
const updateJob_1 = __importDefault(require("./updateJob"));
const deleteJob_1 = __importDefault(require("./deleteJob"));
const jobMembers_1 = __importDefault(require("./jobMembers"));
const comments_1 = __importDefault(require("./comments"));
const express_1 = require("express");
const routes = (0, express_1.Router)({ mergeParams: true });
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
    res.set('Router', path);
    next();
});
/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs Get all organization contract jobs
 */
routes.get('/', getJobs_1.default);
/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs/:job_id Get organization contract job
 */
routes.get('/:job_id', getJob_1.default);
/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/jobs Create organization contract job
 */
routes.post('/', postJob_1.default);
/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/jobs/:job_id Update organization contract job
 */
routes.put('/:job_id', updateJob_1.default);
/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/jobs/:job_id Delete organization contract job
 */
routes.delete('/:job_id', deleteJob_1.default);
/**
 * @api {use} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members Job members
 **/
routes.use('/:job_id/members', jobMembers_1.default);
/**
 * @api {use} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/comments Job comments
 */
routes.use('/:job_id/comments', comments_1.default);
exports.default = routes;
