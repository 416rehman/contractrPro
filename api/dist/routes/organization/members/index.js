"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getMembers_1 = __importDefault(require("./getMembers"));
const getMember_1 = __importDefault(require("./getMember"));
const createMember_1 = __importDefault(require("./createMember"));
const updateMember_1 = __importDefault(require("./updateMember"));
const deleteMember_1 = __importDefault(require("./deleteMember"));
const express_1 = require("express");
const routes = (0, express_1.Router)({ mergeParams: true });
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
    res.set('Router', path);
    next();
});
/**
 * @api {get} /organizations/:org_id/members Get organization members
 */
routes.get('/', getMembers_1.default);
/**
 * @api {get} /organizations/:org_id/members/:user_id Get organization member
 */
routes.get('/:member_id', getMember_1.default);
/**
 * @api {post} /organizations/:org_id/members Add to organization
 */
routes.post('/', createMember_1.default);
/**
 * @api {put} /organizations/:org_id/members/:member_id Update organization member
 */
routes.put('/:member_id', updateMember_1.default);
/**
 * @api {delete} /organizations/:org_id/members/:member_id Remove from organization
 */
routes.delete('/:member_id', deleteMember_1.default);
exports.default = routes;
