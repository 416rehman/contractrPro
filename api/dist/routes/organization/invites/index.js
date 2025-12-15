"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getOrganizationInvites_1 = __importDefault(require("./getOrganizationInvites"));
const getOrganizationInvite_1 = __importDefault(require("./getOrganizationInvite"));
const createOrganizationInvite_1 = __importDefault(require("./createOrganizationInvite"));
const deleteOrganizationInvite_1 = __importDefault(require("./deleteOrganizationInvite"));
const express_1 = require("express");
const routes = (0, express_1.Router)({ mergeParams: true });
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
    res.set('Router', path);
    next();
});
/**
 * @api {get} /organizations/:org_id/invites Get organization invites
 */
routes.get('/', getOrganizationInvites_1.default);
/**
 * @api {get} /organizations/:org_id/invites/:invite_id Get organization invite
 */
routes.get('/:invite_id', getOrganizationInvite_1.default);
/**
 * @api {post} /organizations/:org_id/invites Create organization invite
 */
routes.post('/', createOrganizationInvite_1.default);
/**
 * @api {delete} /organizations/:org_id/invites/:invite_id Delete organization invite
 */
routes.delete('/:invite_id', deleteOrganizationInvite_1.default);
exports.default = routes;
