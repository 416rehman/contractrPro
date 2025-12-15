"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getVendors_1 = __importDefault(require("./getVendors"));
const getVendor_1 = __importDefault(require("./getVendor"));
const createVendor_1 = __importDefault(require("./createVendor"));
const updateVendor_1 = __importDefault(require("./updateVendor"));
const deleteVendor_1 = __importDefault(require("./deleteVendor"));
const comments_1 = __importDefault(require("./comments"));
const express_1 = require("express");
const routes = (0, express_1.Router)({ mergeParams: true });
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
    res.set('Router', path);
    next();
});
/**
 * @api {get} /organizations/:org_id/vendors Get organization vendors
 */
routes.get('/', getVendors_1.default);
/**
 * @api {get} /organizations/:org_id/vendors/:vendor_id Get organization vendor
 */
routes.get('/:vendor_id', getVendor_1.default);
/**
 * @api {post} /organizations/:org_id/vendors Add to organization
 */
routes.post('/', createVendor_1.default);
/**
 * @api {put} /organizations/:org_id/vendors/:vendor_id Update organization vendor
 */
routes.put('/:vendor_id', updateVendor_1.default);
/**
 * @api {delete} /organizations/:org_id/vendors/:vendor_id Remove from organization
 */
routes.delete('/:vendor_id', deleteVendor_1.default);
/**
 * @api {use} /organizations/:org_id/vendors/:vendor_id/comments Invoice comments
 */
routes.use('/:vendor_id/comments', comments_1.default);
exports.default = routes;
