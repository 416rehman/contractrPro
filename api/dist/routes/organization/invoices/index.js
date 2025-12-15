"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getInvoices_1 = __importDefault(require("./getInvoices"));
const getInvoice_1 = __importDefault(require("./getInvoice"));
const createInvoice_1 = __importDefault(require("./createInvoice"));
const updateInvoice_1 = __importDefault(require("./updateInvoice"));
const deleteInvoice_1 = __importDefault(require("./deleteInvoice"));
const invoiceEntries_1 = __importDefault(require("./invoiceEntries"));
const comments_1 = __importDefault(require("./comments"));
const express_1 = require("express");
const routes = (0, express_1.Router)({ mergeParams: true });
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
    res.set('Router', path);
    next();
});
/**
 * @api {get} /organizations/:org_id/invoices Get organization invoices
 */
routes.get('/', getInvoices_1.default);
/**
 * @api {get} /organizations/:org_id/invoices/:invoice_id Get organization invoice
 */
routes.get('/:invoice_id', getInvoice_1.default);
/**
 * @api {post} /organizations/:org_id/invoices Add to organization
 */
routes.post('/', createInvoice_1.default);
/**
 * @api {put} /organizations/:org_id/invoices/:invoice_id Update organization invoice
 */
routes.put('/:invoice_id', updateInvoice_1.default);
/**
 * @api {delete} /organizations/:org_id/invoices/:invoice_id Remove from organization
 */
routes.delete('/:invoice_id', deleteInvoice_1.default);
/**
 * @api {use} /organizations/:org_id/invoices/:invoice_id/entries Invoice entries
 */
routes.use('/:invoice_id/entries', invoiceEntries_1.default);
/**
 * @api {use} /organizations/:org_id/invoices/:invoice_id/comments Invoice comments
 */
routes.use('/:invoice_id/comments', comments_1.default);
exports.default = routes;
