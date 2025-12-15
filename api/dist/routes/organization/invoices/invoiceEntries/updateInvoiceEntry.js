"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../../../utils/response");
const db_1 = require("../../../../db");
const isValidUUID_1 = require("../../../../utils/isValidUUID");
const utils_1 = require("../../../../utils");
const drizzle_orm_1 = require("drizzle-orm");
// update invoice entry
exports.default = async (req, res) => {
    try {
        const invoiceId = req.params.invoice_id;
        const invoiceEntryId = req.params.entry_id;
        const orgId = req.params.org_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid organization_id'));
        if (!invoiceId || !(0, isValidUUID_1.isValidUUID)(invoiceId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invoice ID is required'));
        if (!invoiceEntryId || !(0, isValidUUID_1.isValidUUID)(invoiceEntryId))
            return res.status(400).json((0, response_1.createErrorResponse)('InvoiceEntry ID is required'));
        await db_1.db.transaction(async (tx) => {
            // make sure the invoice belongs to the org
            const invoice = await tx.query.invoices.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.invoices.id, invoiceId), (0, drizzle_orm_1.eq)(db_1.invoices.organizationId, orgId))
            });
            if (!invoice) {
                return res.status(400).json((0, response_1.createErrorResponse)('Invoice not found'));
            }
            const [updatedInvoiceEntry] = await tx.update(db_1.invoiceEntries)
                .set({
                ...(0, utils_1.pick)(req.body, [
                    'name',
                    'description',
                    'unitCost',
                    'quantity',
                ]),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.invoiceEntries.invoiceId, invoiceId), (0, drizzle_orm_1.eq)(db_1.invoiceEntries.id, invoiceEntryId)))
                .returning();
            if (!updatedInvoiceEntry) {
                return res.status(400).json((0, response_1.createErrorResponse)('InvoiceEntry not found'));
            }
            res.status(200).json((0, response_1.createSuccessResponse)(updatedInvoiceEntry));
        });
    }
    catch (err) {
        return res.status(400).json((0, response_1.createErrorResponse)('', err));
    }
};
