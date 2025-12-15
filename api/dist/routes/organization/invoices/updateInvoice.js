"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const index_1 = require("../../../utils/index");
const drizzle_orm_1 = require("drizzle-orm");
// update invoice
exports.default = async (req, res) => {
    try {
        const { org_id, invoice_id } = req.params;
        if (!org_id || !(0, isValidUUID_1.isValidUUID)(org_id))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid org_id'));
        if (!invoice_id || !(0, isValidUUID_1.isValidUUID)(invoice_id))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid invoice_id'));
        const entriesData = req.body?.InvoiceEntries?.map((entry) => (0, index_1.pick)(entry, ['description', 'quantity', 'unitCost', 'name'])) || [];
        if (entriesData.length === 0) {
            return res.status(400).json((0, response_1.createErrorResponse)('InvoiceEntries is required. Provide at least one entry.'));
        }
        const body = {
            ...(0, index_1.pick)(req.body, [
                'invoiceNumber',
                'issueDate',
                'dueDate',
                'poNumber',
                'note',
                'taxRate',
                // 'BillToClientId',
            ]),
            billToClientId: req.body.BillToClientId,
            contractId: req.body.ContractId,
            jobId: req.body.JobId,
            updatedByUserId: req.auth.id,
        };
        // Clean undefined
        Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);
        await db_1.db.transaction(async (tx) => {
            const invoice = await tx.query.invoices.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.invoices.id, invoice_id), (0, drizzle_orm_1.eq)(db_1.invoices.organizationId, org_id))
            });
            if (!invoice) {
                // Return must be processed by caller if throwing? No, Express doesn't catch async thrown unless wrapped.
                // We are inside try/catch so generic catch will handle throw.
                throw new Error('Invoice not found');
            }
            await tx.update(db_1.invoices).set(body).where((0, drizzle_orm_1.eq)(db_1.invoices.id, invoice.id));
            if (entriesData && entriesData.length > 0) {
                // Delete existing
                await tx.delete(db_1.invoiceEntries).where((0, drizzle_orm_1.eq)(db_1.invoiceEntries.invoiceId, invoice.id));
                // Create new
                await tx.insert(db_1.invoiceEntries).values(entriesData.map((entry) => ({
                    ...entry,
                    invoiceId: invoice.id,
                    updatedByUserId: req.auth.id
                })));
            }
            // Re-fetch
            const updatedInvoice = await tx.query.invoices.findFirst({
                where: (0, drizzle_orm_1.eq)(db_1.invoices.id, invoice.id),
                with: {
                    invoiceEntries: true
                }
            });
            return res.status(200).json((0, response_1.createSuccessResponse)(updatedInvoice));
        });
    }
    catch (e) {
        const msg = e.message || '';
        const status = msg === 'Invoice not found' ? 400 : 500;
        return res.status(status).json((0, response_1.createErrorResponse)('Error updating invoice', e));
    }
};
