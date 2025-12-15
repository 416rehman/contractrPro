"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getInvoiceEntries_1 = __importDefault(require("./getInvoiceEntries"));
const getInvoiceEntry_1 = __importDefault(require("./getInvoiceEntry"));
const createInvoiceEntry_1 = __importDefault(require("./createInvoiceEntry"));
const updateInvoiceEntry_1 = __importDefault(require("./updateInvoiceEntry"));
const deleteInvoiceEntry_1 = __importDefault(require("./deleteInvoiceEntry"));
const express_1 = require("express");
const routes = (0, express_1.Router)({ mergeParams: true });
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
    res.set('Router', path);
    next();
});
/**
 * @api {get} /organizations/:org_id/invoices/:invoice_id/entries Get organization invoice entries
 */
routes.get('/', getInvoiceEntries_1.default);
/**
 * @api {get} /organizations/:org_id/invoices/:invoice_id/entries/:entry_id Get organization invoice entry
 */
routes.get('/:entry_id', getInvoiceEntry_1.default);
/**
 * @api {post} /organizations/:org_id/invoices/:invoice_id/entries Add to organization
 */
routes.post('/', createInvoiceEntry_1.default);
/**
 * @api {put} /organizations/:org_id/invoices/:invoice_id/entries/:entry_id Update organization invoice entry
 */
routes.put('/:entry_id', updateInvoiceEntry_1.default);
/**
 * @api {delete} /organizations/:org_id/invoices/:invoice_id/entries/:entry_id Remove from organization
 */
routes.delete('/:entry_id', deleteInvoiceEntry_1.default);
exports.default = routes;
