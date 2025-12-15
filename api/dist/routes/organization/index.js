"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postOrganization_1 = __importDefault(require("./postOrganization"));
const getOrganization_1 = __importDefault(require("./getOrganization"));
const deleteOrganization_1 = __importDefault(require("./deleteOrganization"));
const putOrganization_1 = __importDefault(require("./putOrganization"));
const search_1 = __importDefault(require("./search"));
const blob_1 = __importDefault(require("./blob"));
const clients_1 = __importDefault(require("./clients"));
const expenses_1 = __importDefault(require("./expenses"));
const invoices_1 = __importDefault(require("./invoices"));
const vendors_1 = __importDefault(require("./vendors"));
const summary_1 = __importDefault(require("./summary"));
const express_1 = require("express");
const routes = (0, express_1.Router)({ mergeParams: true });
const contracts_1 = __importDefault(require("./contracts"));
const members_1 = __importDefault(require("./members"));
const invites_1 = __importDefault(require("./invites"));
const response_1 = require("../../utils/response");
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
    res.set('Router', path);
    next();
});
const authorizeOrg = async (req, res, next) => {
    const organizationId = req.params.org_id;
    // Checks the req.auth.Organizations array for the organizationId
    const organization = req.auth.Organizations.find((org) => org.id === organizationId);
    if (!organization) {
        return res
            .status(403)
            .json((0, response_1.createErrorResponse)('Access token is missing or invalid')); // Ambiguous error message to prevent leaking information
    }
    else {
        return next();
    }
};
/**
 * @api {post} /organizations/ Create organization
 */
routes.post('/', postOrganization_1.default);
/**
 * @api {get} /organizations/:org_id Get organization by id
 */
routes.get('/:org_id', authorizeOrg, getOrganization_1.default);
/**
 * @api {delete} /organizations/:org_id Delete organization
 */
routes.delete('/:org_id', authorizeOrg, deleteOrganization_1.default);
/**
 * @api {put} /organizations/:org_id Update organization
 */
routes.put('/:org_id', authorizeOrg, putOrganization_1.default);
/**
 * @api {get} /organizations/:org_id/search?q= Search organization
 */
routes.get('/:org_id/search', authorizeOrg, search_1.default);
/**
 * @api {use} /organizations/:org_id/blob Get Blob
 */
routes.use('/:org_id/blob', authorizeOrg, blob_1.default);
/**
 * @api {get} /organizations/:org_id/members Uses the organization's member router
 */
routes.use('/:org_id/members', authorizeOrg, members_1.default);
/**
 * @api {get} /organizations/:org_id/invites Uses the organization's invite router
 */
routes.use('/:org_id/invites', authorizeOrg, invites_1.default);
/**
 * @api {use} /organizations/:org_id/contracts Uses the organization's contracts router
 */
routes.use('/:org_id/contracts', authorizeOrg, contracts_1.default);
/**
 * @api {use} /organizations/:org_id/clients Uses the organization's clients router
 */
routes.use('/:org_id/clients', authorizeOrg, clients_1.default);
/**
 * @api {use} /organizations/:org_id/expenses Uses the organization's expenses router
 */
routes.use('/:org_id/expenses', authorizeOrg, expenses_1.default);
/**
 * @api {use} /organizations/:org_id/jobs Uses the organization's jobs router
 */
routes.use('/:org_id/invoices', authorizeOrg, invoices_1.default);
/**
 * @api {use} /organizations/:org_id/vendors Uses the organization's vendors router
 */
routes.use('/:org_id/vendors', authorizeOrg, vendors_1.default);
/**
 * @api {use} /organizations/:org_id/summary Uses the organization's summary router
 */
routes.use('/:org_id/summary', authorizeOrg, summary_1.default);
exports.default = routes;
